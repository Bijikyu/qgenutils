/**
 * Worker-Based Async Logger
 * 
 * PURPOSE: Eliminate blocking I/O operations by using worker threads
 * for all file operations and JSON processing.
 * 
 * FEATURES:
 * - Non-blocking file operations
 * - Worker thread JSON processing
 * - Circular buffer for memory efficiency
 * - Automatic log rotation
 * - Performance monitoring
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { performance } from 'perf_hooks';

interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  service?: string;
}

interface WorkerMessage {
  type: 'log' | 'flush' | 'rotate' | 'stats' | 'destroy';
  data?: any;
}

interface LogStats {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  avgProcessingTime: number;
  bufferSize: number;
  workerUptime: number;
}

// Worker implementation
function runWorker(): void {
  if (isMainThread) return;

  const { logFile, maxFileSize, maxBuffer } = workerData as {
    logFile: string;
    maxFileSize: number;
    maxBuffer: number;
  };

  let logBuffer: LogEntry[] = [];
  let stats: LogStats = {
    totalLogs: 0,
    errorCount: 0,
    warnCount: 0,
    avgProcessingTime: 0,
    bufferSize: 0,
    workerUptime: Date.now()
  };

  let lastFlush = Date.now();
  const FLUSH_INTERVAL = 5000; // 5 seconds
  const FLUSH_THRESHOLD = 100; // or 100 entries

  // Ensure log directory exists
  const logDir = dirname(logFile);
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  /**
   * Check if log file needs rotation
   */
  function needsRotation(): boolean {
    try {
      return existsSync(logFile) && 
             require('fs').statSync(logFile).size > maxFileSize;
    } catch {
      return false;
    }
  }

  /**
   * Rotate log file
   */
  function rotateLog(): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
      
      if (existsSync(logFile)) {
        require('fs').renameSync(logFile, rotatedFile);
      }
    } catch (error) {
      console.error('Log rotation failed:', error);
    }
  }

  /**
   * Flush buffer to file
   */
  function flushBuffer(): void {
    if (logBuffer.length === 0) return;

    const startTime = performance.now();
    
    try {
      // Rotate if needed
      if (needsRotation()) {
        rotateLog();
      }

      // Batch write all logs
      const logLines = logBuffer.map(entry => {
        const logLine = JSON.stringify(entry);
        return `${logLine}\n`;
      }).join('');

      appendFileSync(logFile, logLines, 'utf8');

      // Update stats
      const processingTime = performance.now() - startTime;
      stats.totalLogs += logBuffer.length;
      stats.errorCount += logBuffer.filter(e => e.level === 'error').length;
      stats.warnCount += logBuffer.filter(e => e.level === 'warn').length;
      stats.avgProcessingTime = (stats.avgProcessingTime * 0.9) + (processingTime * 0.1);
      stats.bufferSize = 0;

      logBuffer = [];
      lastFlush = Date.now();

    } catch (error) {
      console.error('Log flush failed:', error);
    }
  }

  /**
   * Add entry to buffer
   */
  function addToBuffer(entry: LogEntry): void {
    // Circular buffer behavior - drop oldest if full
    if (logBuffer.length >= maxBuffer) {
      logBuffer.shift();
    }
    
    logBuffer.push(entry);
    
    // Auto-flush if needed
    const now = Date.now();
    if (logBuffer.length >= FLUSH_THRESHOLD || 
        now - lastFlush > FLUSH_INTERVAL) {
      flushBuffer();
    }
  }

  // Handle messages from main thread
  parentPort?.on('message', (message: WorkerMessage) => {
    switch (message.type) {
      case 'log':
        addToBuffer(message.data);
        break;
        
      case 'flush':
        flushBuffer();
        parentPort?.postMessage({ type: 'flushed' });
        break;
        
      case 'rotate':
        rotateLog();
        parentPort?.postMessage({ type: 'rotated' });
        break;
        
      case 'stats':
        stats.bufferSize = logBuffer.length;
        stats.workerUptime = Date.now() - stats.workerUptime;
        parentPort?.postMessage({ type: 'stats', data: stats });
        break;
        
      case 'destroy':
        flushBuffer();
        process.exit(0);
        break;
    }
  });

  // Periodic flush
  setInterval(() => {
    if (logBuffer.length > 0) {
      flushBuffer();
    }
  }, FLUSH_INTERVAL);
}

// Main thread logger implementation
export class WorkerAsyncLogger {
  private worker: Worker | null = null;
  private isDestroyed = false;
  private pendingFlushes = 0;
  private stats = {
    sentLogs: 0,
    droppedLogs: 0,
    avgLatency: 0
  };

  constructor(
    private logFile: string = './logs/application.log',
    private maxFileSize: number = 100 * 1024 * 1024, // 100MB
    private maxBuffer: number = 10000
  ) {
    this.startWorker();
  }

  /**
   * Start worker thread
   */
  private startWorker(): void {
    try {
      this.worker = new Worker(__filename, {
        workerData: {
          logFile: this.logFile,
          maxFileSize: this.maxFileSize,
          maxBuffer: this.maxBuffer
        }
      });

      this.worker.on('error', (error) => {
        console.error('Logger worker error:', error);
        this.restartWorker();
      });

      this.worker.on('exit', (code) => {
        if (code !== 0 && !this.isDestroyed) {
          console.warn('Logger worker exited, restarting...');
          this.restartWorker();
        }
      });

    } catch (error) {
      console.error('Failed to start logger worker:', error);
      // Fallback to simple logging
    }
  }

  /**
   * Restart worker
   */
  private restartWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.startWorker();
      }
    }, 1000);
  }

  /**
   * Send message to worker with error handling
   */
  private sendMessage(message: WorkerMessage): boolean {
    if (!this.worker || this.isDestroyed) {
      this.stats.droppedLogs++;
      return false;
    }

    try {
      this.worker!.postMessage(message);
      this.stats.sentLogs++;
      return true;
    } catch (error) {
      console.error('Failed to send message to logger worker:', error);
      this.stats.droppedLogs++;
      return false;
    }
  }

  /**
   * Log a message
   */
  log(level: LogEntry['level'], message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      metadata,
      requestId: metadata?.requestId,
      userId: metadata?.userId,
      service: metadata?.service
    };

    this.sendMessage({ type: 'log', data: entry });
  }

  /**
   * Debug level log
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  /**
   * Info level log
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  /**
   * Warning level log
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Error level log
   */
  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  /**
   * Force flush buffer
   */
  async flush(): Promise<void> {
    if (!this.worker || this.isDestroyed) return;

    return new Promise<void>((resolve) => {
      this.pendingFlushes++;
      
      const messageHandler = (message: any) => {
        if (message.type === 'flushed') {
          this.pendingFlushes--;
          this.worker?.off('message', messageHandler);
          resolve();
        }
      };

      this.worker!.on('message', messageHandler);
      this.sendMessage({ type: 'flush' });
      
      // Timeout fallback
      setTimeout(() => {
        this.worker?.off('message', messageHandler);
        this.pendingFlushes--;
        resolve();
      }, 5000);
    });
  }

  /**
   * Get logger statistics
   */
  async getStats(): Promise<LogStats & typeof this.stats> {
    if (!this.worker || this.isDestroyed) {
      return {
        totalLogs: 0,
        errorCount: 0,
        warnCount: 0,
        avgProcessingTime: 0,
        bufferSize: 0,
        workerUptime: 0,
        ...this.stats
      };
    }

    return new Promise((resolve) => {
      const messageHandler = (message: any) => {
        if (message.type === 'stats') {
          this.worker?.off('message', messageHandler);
          resolve({ ...message.data, ...this.stats });
        }
      };

      this.worker!.on('message', messageHandler);
      this.sendMessage({ type: 'stats' });
      
      setTimeout(() => {
        this.worker?.off('message', messageHandler);
        resolve({
          totalLogs: 0,
          errorCount: 0,
          warnCount: 0,
          avgProcessingTime: 0,
          bufferSize: 0,
          workerUptime: 0,
          ...this.stats
        });
      }, 3000);
    });
  }

  /**
   * Rotate log file
   */
  async rotate(): Promise<void> {
    if (!this.worker || this.isDestroyed) return;

    return new Promise<void>((resolve) => {
      const messageHandler = (message: any) => {
        if (message.type === 'rotated') {
          this.worker?.off('message', messageHandler);
          resolve();
        }
      };

      this.worker!.on('message', messageHandler);
      this.sendMessage({ type: 'rotate' });
      
      setTimeout(() => {
        this.worker?.off('message', messageHandler);
        resolve();
      }, 5000);
    });
  }

  /**
   * Destroy logger and cleanup
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    if (this.worker) {
      // Flush pending logs
      await this.flush();
      
      // Send destroy message
      this.sendMessage!({ type: 'destroy' });
      
      // Terminate worker
      this.worker.terminate();
      this.worker = null;
    }

    console.log('WorkerAsyncLogger: Destroyed');
  }
}

// Run worker if this file is executed as worker
if (!isMainThread) {
  runWorker();
}

// Export singleton instance
export const asyncLogger = new WorkerAsyncLogger();
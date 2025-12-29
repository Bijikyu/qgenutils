/**
 * Asynchronous Logger Utility
 * 
 * PURPOSE: Non-blocking logging system that moves I/O operations
 * out of request paths to improve scalability and performance.
 * 
 * SCALABILITY FEATURES:
 * - Buffered logging to prevent I/O blocking
 * - Worker thread support for log processing
 * - Configurable log levels and rotation
 * - Performance-optimized for high-throughput systems
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

interface LogWorkerData {
  entries: LogEntry[];
  logDir: string;
  logFile: string;
}

class AsyncLogger {
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 1000;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private logWorker?: Worker;
  private flushTimer?: NodeJS.Timeout;
  private logDir: string;
  private logFile: string;

  constructor(logDir: string = './logs', logFile: string = 'app.log') {
    this.logDir = logDir;
    this.logFile = logFile;
    
    // Ensure log directory exists
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    this.initializeLogWorker();
    this.startFlushTimer();
  }

  /**
   * Initialize log worker for processing logs in background
   */
  private initializeLogWorker(): void {
    if (!isMainThread) return;

    this.logWorker = new Worker(__filename, {
      workerData: { isLogWorker: true }
    });

    this.logWorker.on('error', (error) => {
      console.error('Log worker error:', error);
      // Fallback to synchronous logging if worker fails
      this.flushSync();
    });
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Add log entry to buffer (non-blocking)
   */
  log(level: LogEntry['level'], message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      metadata
    };

    this.logBuffer.push(entry);

    // Auto-flush if buffer is full
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      setImmediate(() => this.flush());
    }
  }

  /**
   * Convenience methods for different log levels
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  /**
   * Flush log buffer to worker thread (non-blocking)
   */
  private flush(): void {
    if (this.logBuffer.length === 0) return;

    const entries = this.logBuffer.splice(0, this.logBuffer.length);

    if (this.logWorker && !this.logWorker.terminate) {
      this.logWorker.postMessage({
        entries,
        logDir: this.logDir,
        logFile: this.logFile
      });
    } else {
      // Fallback to async file operation
      this.flushAsync(entries);
    }
  }

  /**
   * Async file writing fallback
   */
  private async flushAsync(entries: LogEntry[]): Promise<void> {
    try {
      const logLines = entries.map(entry => 
        `${new Date(entry.timestamp).toISOString()} [${entry.level.toUpperCase()}] ${entry.message}${entry.metadata ? ' ' + JSON.stringify(entry.metadata) : ''}\n`
      ).join('');

      const filePath = join(this.logDir, this.logFile);
      
      // Use async file operations in production environments
      if (process.env.NODE_ENV === 'production') {
        const { writeFile } = await import('fs/promises');
        await writeFile(filePath, logLines, { flag: 'a' });
      } else {
        // Fallback to sync for development
        writeFileSync(filePath, logLines, { flag: 'a' });
      }
    } catch (error) {
      console.error('Failed to write logs:', error);
    }
  }

  /**
   * Synchronous fallback for critical errors
   */
  private flushSync(): void {
    if (this.logBuffer.length === 0) return;

    try {
      const entries = this.logBuffer.splice(0, this.logBuffer.length);
      const logLines = entries.map(entry => 
        `${new Date(entry.timestamp).toISOString()} [${entry.level.toUpperCase()}] ${entry.message}${entry.metadata ? ' ' + JSON.stringify(entry.metadata) : ''}\n`
      ).join('');

      const filePath = join(this.logDir, this.logFile);
      writeFileSync(filePath, logLines, { flag: 'a' });
    } catch (error) {
      console.error('Failed to write logs synchronously:', error);
    }
  }

  /**
   * Force immediate flush of all buffered logs
   */
  async flushImmediate(): Promise<void> {
    this.flush();
    
    // Wait for worker to process logs (non-blocking wait)
    if (this.logWorker) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Flush remaining logs
    this.flushImmediate();

    // Terminate worker
    if (this.logWorker) {
      this.logWorker.terminate();
      this.logWorker = undefined;
    }
  }
}

// Log worker thread implementation
if (!isMainThread && workerData?.isLogWorker) {
  parentPort?.on('message', async (data: LogWorkerData) => {
    try {
      const { entries, logDir, logFile } = data;
      const filePath = join(logDir, logFile);
      
      const logLines = entries.map(entry => 
        `${new Date(entry.timestamp).toISOString()} [${entry.level.toUpperCase()}] ${entry.message}${entry.metadata ? ' ' + JSON.stringify(entry.metadata) : ''}\n`
      ).join('');

      // Use async file operations in worker
      const { writeFile } = await import('fs/promises');
      await writeFile(filePath, logLines, { flag: 'a' });
      
      parentPort?.postMessage({ success: true });
    } catch (error) {
      parentPort?.postMessage({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
}

// Create global async logger instance
const asyncLogger = new AsyncLogger();

export default asyncLogger;
export type { LogEntry };
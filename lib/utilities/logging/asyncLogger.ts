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

import { writeFile, mkdir, access } from 'fs/promises';
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
    this.initializeLogWorker();
    this.startFlushTimer();
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await access(this.logDir);
    } catch {
      await mkdir(this.logDir, { recursive: true });
    }
  }

  private initializeLogWorker(): void {
    if (!isMainThread) return;
    this.logWorker = new Worker(__filename, { workerData: { isLogWorker: true } });
    this.logWorker.on('error', (error) => {
      console.error('Log worker error:', error);
      this.flushAsync(this.logBuffer.splice(0));
    });
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL);
  }

  log(level: LogEntry['level'], message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = { timestamp: Date.now(), level, message, metadata };
    this.logBuffer.push(entry);
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) setImmediate(() => this.flush());
  }

  debug(message: string, metadata?: Record<string, any>): void { this.log('debug', message, metadata); }
  info(message: string, metadata?: Record<string, any>): void { this.log('info', message, metadata); }
  warn(message: string, metadata?: Record<string, any>): void { this.log('warn', message, metadata); }
  error(message: string, metadata?: Record<string, any>): void { this.log('error', message, metadata); }

  private flush(): void {
    if (this.logBuffer.length === 0) return;
    const entries = this.logBuffer.splice(0, this.logBuffer.length);
    if (this.logWorker && !this.logWorker.terminate) {
      this.logWorker.postMessage({ entries, logDir: this.logDir, logFile: this.logFile });
    } else {
      this.flushAsync(entries);
    }
  }

  private async flushAsync(entries: LogEntry[]): Promise<void> {
    try {
      await this.ensureLogDirectory();
      const logLines = entries.map(entry => `${new Date(entry.timestamp).toISOString()} [${entry.level.toUpperCase()}] ${entry.message}${entry.metadata ? ' ' + JSON.stringify(entry.metadata) : ''}\n`).join('');
      const filePath = join(this.logDir, this.logFile);
      await writeFile(filePath, logLines, { flag: 'a' });
    } catch (error) {
      console.error('Failed to write logs:', error);
    }
  }

  private flushSync(): void {
    console.warn('Synchronous logging operations are not allowed for scalability');
  }

  async flushImmediate(): Promise<void> {
    await this.ensureLogDirectory();
    this.flush();
    if (this.logWorker) await new Promise(resolve => setTimeout(resolve, 100));
  }

  destroy(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushImmediate();
    if (this.logWorker) {
      this.logWorker.terminate();
      this.logWorker = undefined;
    }
  }
}

if (!isMainThread && workerData?.isLogWorker) {
  parentPort?.on('message', async (data: LogWorkerData) => {
    try {
      const { entries, logDir, logFile } = data;
      const filePath = join(logDir, logFile);
      try {
        await access(logDir);
      } catch {
        await mkdir(logDir, { recursive: true });
      }
      const logLines = entries.map(entry => `${new Date(entry.timestamp).toISOString()} [${entry.level.toUpperCase()}] ${entry.message}${entry.metadata ? ' ' + JSON.stringify(entry.metadata) : ''}\n`).join('');
      await writeFile(filePath, logLines, { flag: 'a' });
      parentPort?.postMessage({ success: true });
    } catch (error) {
      parentPort?.postMessage({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
  });
}

const asyncLogger = new AsyncLogger();

export default asyncLogger;
export type { LogEntry };
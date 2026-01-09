/**
 * Common Logging and Debugging Utilities
 *
 * Centralized logging and debugging utilities to eliminate code duplication across
 * codebase. These utilities handle common patterns including
 * structured logging, debugging helpers, and development diagnostics.
 */

import { handleError } from '../error/commonErrorHandling.js';

/**
 * Log level constants
 */
export const LogLevel = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5
} as const;

export type LogLevelType = keyof typeof LogLevel;

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevelType;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  correlationId?: string;
  service?: string;
  version?: string;
}

/**
 * Logger interface
 */
export interface Logger {
  trace(message: string, context?: Record<string, any>, correlationId?: string): void;
  debug(message: string, context?: Record<string, any>, correlationId?: string): void;
  info(message: string, context?: Record<string, any>, correlationId?: string): void;
  warn(message: string, context?: Record<string, any>, correlationId?: string): void;
  error(message: string, context?: Record<string, any>, correlationId?: string): void;
  fatal(message: string, context?: Record<string, any>, correlationId?: string): void;
  getEntries(): LogEntry[];
  clear(): void;
  getEntriesByLevel(level: LogLevelType): LogEntry[];
  getEntriesByTimeRange(startTime: Date, endTime: Date): LogEntry[];
  getEntriesByCorrelationId(correlationId: string): LogEntry[];
}

/**
 * In-memory logger implementation
 */
export class InMemoryLogger implements Logger {
  private entries: LogEntry[] = [];
  private minLevel: LogLevelType = 'INFO';

  trace(message: string, context?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('TRACE')) {
      this.addEntry('TRACE', message, context, { correlationId });
    }
  }

  debug(message: string, context?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('DEBUG')) {
      this.addEntry('DEBUG', message, context, { correlationId });
    }
  }

  info(message: string, context?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('INFO')) {
      this.addEntry('INFO', message, context, { correlationId });
    }
  }

  warn(message: string, context?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('WARN')) {
      this.addEntry('WARN', message, context, { correlationId });
    }
  }

  error(message: string, context?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('ERROR')) {
      this.addEntry('ERROR', message, context, { correlationId });
    }
  }

  fatal(message: string, context?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('FATAL')) {
      this.addEntry('FATAL', message, context, { correlationId });
    }
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  getEntriesByLevel(level: LogLevelType): LogEntry[] {
    return this.entries.filter(entry => entry.level === level);
  }

  getEntriesByTimeRange(startTime: Date, endTime: Date): LogEntry[] {
    return this.entries.filter(entry =>
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  getEntriesByCorrelationId(correlationId: string): LogEntry[] {
    return this.entries.filter(entry => entry.correlationId === correlationId);
  }

  private shouldLog(level: LogLevelType): boolean {
    return LogLevel[level] >= LogLevel[this.minLevel];
  }

  private addEntry(level: LogLevelType, message: string, context?: Record<string, any>, options: { correlationId?: string } = {}): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      correlationId: options.correlationId
    };
    this.entries.push(entry);
  }

  setMinLevel(level: LogLevelType): void {
    this.minLevel = level;
  }
}

/**
 * Debug utilities
 */
export class DebugUtils {
  static createTimer(name: string) {
    return {
      name,
      startTime: 0 as number,
      start() {
        this.startTime = performance.now();
      },
      stop() {
        return performance.now() - this.startTime;
      },
      logElapsed(message?: string) {
        const elapsed = this.stop();
        console.log(`[Timer: ${this.name}] ${message || 'Elapsed'}: ${elapsed.toFixed(2)}ms`);
        return elapsed;
      }
    };
  }

  static createMonitor<T extends (...args: any[]) => any>(name: string, options: {
    logSlowCalls?: boolean;
    slowThreshold?: number;
    trackCallCount?: boolean;
  } = {}): (fn: T) => T {
    const { logSlowCalls = true, slowThreshold = 1000, trackCallCount = true } = options;
    let callCount = 0;

    return ((fn: T) => T => {
      callCount++;

      const wrappedFn = (...args: any[]): any => {
        const timer = DebugUtils.createTimer(name);
        timer.start();

        try {
          const result = fn(...args);
          timer.logElapsed('Function call completed');
          return result;
        } catch (error) {
          timer.logElapsed('Function call failed');
          handleError(error as Error, `${name}: Function call failed with ${args.length} arguments`);
          throw error;
        }
      };

      return wrappedFn;
    }) as any;
  }
}

/**
 * Common logging utilities
 */
export const CommonLoggingUtilities = {
  /**
   * Creates a new logger instance
   */
  createLogger(minLevel: LogLevelType = 'INFO'): Logger {
    const logger = new InMemoryLogger();
    logger.setMinLevel(minLevel);
    return logger;
  },

  /**
   * Creates a performance timer
   */
  createTimer: DebugUtils.createTimer,

  /**
   * Creates a performance monitor
   */
  createMonitor: DebugUtils.createMonitor,

  /**
   * Formats log entry for console output
   */
  formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.padEnd(5);
    const correlationId = entry.correlationId ? ` [${entry.correlationId}]` : '';
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    return `[${timestamp}] ${level}${correlationId} ${entry.message}${context}`;
  },

  /**
   * Gets current log level from environment
   */
  getLogLevelFromEnv(): LogLevelType {
    const envLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    return (envLevel as LogLevelType) in LogLevel ? envLevel as LogLevelType : 'INFO';
  }
};

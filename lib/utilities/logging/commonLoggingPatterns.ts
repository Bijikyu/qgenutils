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

/**
 * Log entry interface
 */
export interface LogEntry {
  level: keyof typeof LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  stack?: string;
}

/**
 * Logger interface
 */
export interface Logger {
  trace: (message: string, context?: Record<string, any>, correlationId?: string) => void;
  debug: (message: string, context?: Record<string, any>, correlationId?: string) => void;
  info: (message: string, context?: Record<string, any>, correlationId?: string) => void;
  warn: (message: string, context?: Record<string, any>, correlationId?: string) => void;
  error: (message: string, context?: Record<string, any>, correlationId?: string, error?: Error) => void;
  fatal: (message: string, context?: Record<string, any>, correlationId?: string, error?: Error) => void;
}

/**
 * Creates a context object for logging
 * @param baseContext - Base context
 * @param additions - Additional context properties
 * @returns Merged context object
 */
export function createLogContext(
  baseContext: Record<string, any> = {},
  additions: Record<string, any> = {}
): Record<string, any> {
  return { ...baseContext, ...additions };
}

/**
 * Creates a structured log entry
 * @param level - Log level
 * @param message - Log message
 * @param context - Log context
 * @param options - Additional options
 * @returns Formatted log entry
 */
export function createLogEntry(
  level: keyof typeof LogLevel,
  message: string,
  context: Record<string, any> = {},
  options: {
    correlationId?: string;
    userId?: string;
    error?: Error;
    stack?: string;
  } = {}
): LogEntry {
  const { correlationId, userId, error, stack } = options;
  
  return {
    level,
    message,
    context,
    timestamp: new Date(),
    correlationId,
    userId,
    stack: error?.stack || stack,
    service: process.env.SERVICE_NAME || 'application'
  };
}

/**
 * Console logger implementation
 */
export const ConsoleLogger: Logger = {
  trace: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    const entry = createLogEntry(LogLevel.TRACE, message, context, { correlationId });
    console.trace(JSON.stringify(entry));
  },

  debug: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    const entry = createLogEntry(LogLevel.DEBUG, message, context, { correlationId });
    console.debug(JSON.stringify(entry));
  },

  info: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    const entry = createLogEntry(LogLevel.INFO, message, context, { correlationId });
    console.info(JSON.stringify(entry));
  },

  warn: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    const entry = createLogEntry(LogLevel.WARN, message, context, { correlationId });
    console.warn(JSON.stringify(entry));
  },

  error: (message: string, context?: Record<string, any>, correlationId?: string, error?: Error): void => {
    const entry = createLogEntry(LogLevel.ERROR, message, context, { correlationId, error });
    console.error(JSON.stringify(entry));
  },

  fatal: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    const entry = createLogEntry(LogLevel.FATAL, message, context, { correlationId });
    console.error(JSON.stringify(entry));
  }
};

/**
 * In-memory logger with buffering
 */
export class InMemoryLogger implements Logger {
  private entries: LogEntry[] = [];
  private maxEntries: number;
  
  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }
  
  private shouldLog(level: keyof typeof LogLevel): boolean {
    const logLevel = this.getLogLevel();
    return level >= logLevel;
  }
  
  private getLogLevel(): keyof typeof LogLevel {
    const envLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    return (LogLevel as any)[envLevel] || LogLevel.INFO;
  }
  
  trace: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    if (this.shouldLog(LogLevel.TRACE)) {
      this.addEntry(LogLevel.TRACE, message, context, { correlationId });
    }
  },

  debug: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.addEntry(LogLevel.DEBUG, message, context, { correlationId });
    }
  },

  info: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    if (this.shouldLog(LogLevel.INFO)) {
      this.addEntry(LogLevel.INFO, message, context, { correlationId });
    }
  },

  warn: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    if (this.shouldLog(LogLevel.WARN)) {
      this.addEntry(LogLevel.WARN, message, context, { correlationId });
    }
  },

  error: (message: string, context?: Record<string, any>, correlationId?: string, error?: Error): void => {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.addEntry(LogLevel.ERROR, message, context, { correlationId, error });
    }
  },

  fatal: (message: string, context?: Record<string, any>, correlationId?: string): void => {
    if (this.shouldLog(LogLevel.FATAL)) {
      this.addEntry(LogLevel.FATAL, message, context, { correlationId });
    }
  },

  private addEntry(level: keyof typeof LogLevel, message: string, context: Record<string, any>, options: { correlationId?: string; error?: Error; stack?: string } = {}): void {
    const entry = createLogEntry(level, message, context, options);
    this.entries.push(entry);
    
    // Trim entries if needed
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  },

  /**
   * Gets all log entries
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  },

  /**
   * Clears all log entries
   */
  clear(): void {
    this.entries = [];
  },

  /**
   * Gets entries by level
   */
  getEntriesByLevel(level: keyof typeof LogLevel): LogEntry[] {
    return this.entries.filter(entry => entry.level === level);
  },

  /**
   * Gets entries by time range
   */
  getEntriesByTimeRange(startTime: Date, endTime: Date): LogEntry[] {
    return this.entries.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }
};

/**
 * Debugging utilities
 */
export const DebugUtils = {
  /**
   * Creates a debugging timer
   */
  createTimer: (name: string) => {
    const startTime = Date.now();
    
    return {
      name,
      start: () => startTime,
      getElapsed: () => Date.now() - startTime,
      
      /**
       * Logs the elapsed time
       */
      logElapsed: (label?: string) => {
        const elapsed = Date.now() - startTime;
        console.log(`[Timer: ${name}]${label ? ` - ${label}` : ''} ${elapsed}ms`);
      },
      
      /**
       * Ends the timer
       */
      end: (returnValue?: any) => {
        const elapsed = Date.now() - startTime;
        console.log(`[Timer: ${name}] Completed in ${elapsed}ms`);
        return returnValue;
      }
    };
  },

  /**
   * Creates a function that logs when called
   */
  createTracer: <T extends (...args: any[]) => any>(
    fn: T,
    options: {
      name?: string;
      logArgs?: boolean;
      logResult?: boolean;
      logDuration?: boolean;
    } = {}
  ): T => {
    const { name, logArgs = true, logResult = true, logDuration = true } = options;
    
    return ((...args: any[]) => {
      const startTime = Date.now();
      
      try {
        const result = fn(...args);
        
        if (logDuration) {
          const duration = Date.now() - startTime;
          console.log(`[${name}] Execution time: ${duration}ms`);
        }
        
        if (logResult) {
          console.log(`[${name}] Result:`, result);
        }
        
        if (logArgs) {
          console.log(`[${name}] Arguments:`, ...args);
        }
        
        return result;
      } catch (error) {
        console.error(`[${name}] Error:`, error);
        throw error;
      }
    }) as T;
  },

  /**
   * Logs object properties safely
   */
  logObject: (obj: any, label?: string): void => {
    console.log(label ? `[${label}]` : '', obj);
  },

  /**
   * Logs function arguments safely
   */
  logFunctionCall: (fnName: string, args: any[]): void => {
    console.log(`[${fnName}] Called with:`, ...args);
  },

  /**
   * Creates a conditional debugger
   */
  createDebugger: (condition: () => boolean) => {
    return (value: any) => {
      if (condition) {
        console.log('[DEBUG]', value);
      }
      return value;
    };
  }
};

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Measures and logs function execution time
   */
  measureTime: <T>(name: string, fn: () => T): T => {
    const timer = DebugUtils.createTimer(name);
    timer.start();
    
    try {
      const result = fn();
      timer.logElapsed('Function completed');
      return result;
    } catch (error) {
      timer.logElapsed('Function failed with error');
      throw error;
    }
  },

  /**
   * Creates a performance monitor for repeated calls
   */
  createMonitor: (name: string, options: {
    logSlowCalls?: boolean;
    slowThreshold?: number;
    trackCallCount?: boolean;
  } = {}): {
    const { logSlowCalls = true, slowThreshold = 1000, trackCallCount = true } = options;
    let callCount = 0;
    
    return (fn: T) => T => {
      callCount++;
      
      const wrappedFn = (...args: any[]): T => {
        const timer = DebugUtils.createTimer(name);
        timer.start();
        
        try {
          const result = fn(...args);
          timer.logElapsed('Function call completed');
          return result;
        } catch (error) {
          timer.logElapsed('Function call failed');
          throw error;
        }
      };
      
      if (trackCallCount) {
        console.log(`[${name}] Call count: ${callCount}`);
      }
      
      return wrappedFn;
    };
  }
};

/**
 * Error tracking utilities
 */
export const ErrorTracker = {
  /**
   * Tracks error occurrences
   */
  trackError: (error: Error, context?: Record<string, any>): void => {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context,
      type: error.constructor.name
    };
    
    // In production, you might want to store this in a database
    console.error('Error tracked:', errorInfo);
  },

  /**
   * Creates error boundary wrapper
   */
  withErrorBoundary: <T>(fn: () => T, fallback?: T): T => {
    try {
      return fn();
    } catch (error) {
      ErrorTracker.trackError(error);
      return fallback !== undefined ? fallback : (null as any);
    }
  },

  /**
   * Gets error statistics
   */
  getErrorStats: () => {
    // In production, this could query an error tracking system
    console.log('Would query error statistics');
    return {
      totalErrors: 0,
      errorsByType: {},
      recentErrors: []
    };
  }
};

/**
 * Development diagnostics utilities
 */
export const DiagnosticsUtils = {
  /**
   * Logs system information
   */
  logSystemInfo: (): void => {
    const info = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      pid: process.pid,
      cwd: process.cwd(),
      env: { ...process.env }
    };
    
    console.log('System Info:', info);
  },

  /**
   * Logs module information
   */
  logModuleInfo: (moduleName: string): void => {
    try {
      // Check if module exists
      const moduleInfo = require.resolve(moduleName);
      console.log(`Module Info [${moduleName}]:`, moduleInfo);
    } catch (error) {
      console.error(`Failed to get module info [${moduleName}]:`, error);
    }
  },

  /**
   * Logs environment variables
   */
  logEnvironment: (prefix?: string): void => {
    const envVars = Object.entries(process.env);
    const filteredVars = prefix 
      ? envVars.filter(([key]) => key.startsWith(prefix))
      : envVars;
    
    console.log(`Environment Variables${prefix ? ` [${prefix}]` : ''}:`);
    filteredVars.forEach(([key, value]) => {
      console.log(`  ${key} = ${value}`);
    });
  },

  /**
   * Checks system dependencies
   */
  checkDependencies: async (dependencies: string[]): Promise<void> => {
    for (const dep of dependencies) {
      try {
        require.resolve(dep);
        console.log(`✅ Dependency available: ${dep}`);
      } catch (error) {
        console.error(`❌ Dependency error [${dep}]:`, error);
      }
    }
  },

  /**
   * Validates environment setup
   */
  validateEnvironment: (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0]);
    
    if (majorVersion < 14) {
      errors.push(`Node.js version ${nodeVersion} is below minimum recommended (14)`);
    }
    
    // Check environment variables
    const requiredVars = ['NODE_ENV'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
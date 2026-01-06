/**
 * SHARED LOGGING UTILITIES
 * 
 * PURPOSE: Provides common logging patterns used across the codebase.
 * This utility eliminates duplication of logging logic and ensures
 * consistent logging behavior throughout the application.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized logging patterns and helpers
 * - Consistent log message formatting
 * - Performance optimized logging
 * - Context-aware logging
 * - TypeScript compatible with proper typing
 * 
 * USAGE PATHERNS:
 * - Function execution logging
 * - Debug logging with context
 * - Performance logging
 * - Error logging with metadata
 */

import logger from '../../logger.js';
import { TypeValidators } from './typeValidators.js';

/**
 * Logging context interface for structured logging.
 */
export interface LoggingContext {
  /** Function name where logging occurs */
  functionName?: string;
  /** Module or file name */
  module?: string;
  /** Operation being performed */
  operation?: string;
  /** User ID for user-specific operations */
  userId?: string;
  /** Request ID for request tracing */
  requestId?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Performance logging options.
 */
export interface PerformanceLoggingOptions {
  /** Whether to log start time */
  logStart?: boolean;
  /** Whether to log end time */
  logEnd?: boolean;
  /** Whether to log duration */
  logDuration?: boolean;
  /** Duration threshold in milliseconds for warning logs */
  warnThreshold?: number;
  /** Duration threshold in milliseconds for error logs */
  errorThreshold?: number;
}

/**
 * Function execution logging result.
 */
export interface FunctionExecutionResult<T = any> {
  /** Function result or error */
  result?: T;
  error?: Error;
  /** Execution duration in milliseconds */
  duration: number;
  /** Whether execution succeeded */
  success: boolean;
}

/**
 * Creates a context-aware logger for a specific function or module.
 * This is the most common logging pattern used across the codebase.
 * 
 * @param context - Logging context information
 * @returns Context-aware logger functions
 * 
 * @example
 * ```typescript
 * const myLogger = createContextLogger({
 *   functionName: 'validateEmail',
 *   module: 'validation'
 * });
 * 
 * myLogger.debug('Starting validation', { email: input });
 * const result = validationLogic();
 * myLogger.info('Validation completed', { isValid: result });
 * ```
 */
export const createContextLogger = (context: LoggingContext = {}) => {
  const {
    functionName = 'unknown',
    module = 'unknown',
    operation,
    userId,
    requestId,
    metadata = {}
  } = context;

  const buildLogContext = (additionalData?: Record<string, any>) => ({
    functionName,
    module,
    operation,
    userId,
    requestId,
    ...metadata,
    ...additionalData
  });

  return {
    /**
     * Debug level logging
     */
    debug: (message: string, data?: Record<string, any>) => {
      logger.debug(message, buildLogContext(data));
    },

    /**
     * Info level logging
     */
    info: (message: string, data?: Record<string, any>) => {
      logger.info(message, buildLogContext(data));
    },

    /**
     * Warning level logging
     */
    warn: (message: string, data?: Record<string, any>) => {
      logger.warn(message, buildLogContext(data));
    },

    /**
     * Error level logging
     */
    error: (message: string, error?: Error | string, data?: Record<string, any>) => {
      const errorData = error ? { error: error instanceof Error ? error.message : error } : {};
      logger.error(message, buildLogContext({ ...errorData, ...data }));
    },

    /**
     * Function start logging
     */
    start: (inputData?: any) => {
      const inputType = typeof inputData;
      const inputSummary = TypeValidators.isString(inputData) 
        ? inputData.substring(0, 50) + (inputData.length > 50 ? '...' : '')
        : typeof inputData === 'object' && inputData !== null
        ? Object.keys(inputData as object).length + ' properties'
        : inputType;

      logger.debug(`${functionName} is starting`, buildLogContext({
        inputType,
        inputSummary,
        inputData: process.env.NODE_ENV === 'development' ? inputData : undefined
      }));
    },

    /**
     * Function end logging
     */
    end: (result?: any, duration?: number) => {
      const resultType = typeof result;
      const resultSummary = TypeValidators.isString(result)
        ? result.substring(0, 50) + (result.length > 50 ? '...' : '')
        : resultType;

      logger.debug(`${functionName} is ending`, buildLogContext({
        resultType,
        resultSummary,
        duration,
        result: process.env.NODE_ENV === 'development' ? result : undefined
      }));
    },

    /**
     * Function error logging
     */
    functionError: (error: Error, context?: string) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorContext = context ? ` in ${context}` : '';
      
      logger.error(`${functionName} failed${errorContext}: ${errorMessage}`, buildLogContext({
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      }));
    },

    /**
     * Get the current context
     */
    getContext: () => buildLogContext()
  };
};

/**
 * Quick logger for simple use cases.
 * Simplified interface for the most frequent logging patterns.
 * 
 * @param functionName - Function name for context
 * @returns Simplified logger functions
 * 
 * @example
 * ```typescript
 * const log = quickLogger('myFunction');
 * log.start('input data');
 * log.info('Processing...');
 * log.end('result');
 * ```
 */
export const quickLogger = (functionName: string) => {
  const contextLogger = createContextLogger({ functionName });

  return {
    start: (input?: any) => {
      logger.debug(`${functionName} is running with input: ${typeof input === 'string' ? input.substring(0, 100) : typeof input}`);
    },

    info: (message: string) => {
      logger.info(`${functionName}: ${message}`);
    },

    debug: (message: string) => {
      logger.debug(`${functionName}: ${message}`);
    },

    warn: (message: string) => {
      logger.warn(`${functionName}: ${message}`);
    },

    error: (error: Error | string, context?: string) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const contextStr = context ? ` in ${context}` : '';
      logger.error(`${functionName} failed${contextStr}: ${errorMessage}`);
    },

    end: (result?: any) => {
      const resultStr = typeof result === 'string' ? result.substring(0, 100) : typeof result;
      logger.debug(`${functionName} is returning ${resultStr}`);
    }
  };
};

/**
 * Wraps a function with performance logging.
 * Automatically logs function start, end, duration, and errors.
 * 
 * @param fn - Function to wrap with logging
 * @param options - Logging options and context
 * @returns Wrapped function with automatic logging
 * 
 * @example
 * ```typescript
 * const loggedFunction = withLogging(
 *   (input: string) => {
 *     // Your logic here
 *     return input.toUpperCase();
 *   },
 *   { functionName: 'toUpperCase', logStart: true, logEnd: true }
 * );
 * ```
 */
export const withLogging = <T extends (...args: any[]) => any>(
  fn: T,
  options: {
    functionName?: string;
    module?: string;
    performance?: PerformanceLoggingOptions;
    logArgs?: boolean;
    logResult?: boolean;
  } = {}
): T => {
  const {
    functionName = fn.name || 'anonymous',
    module,
    performance = { logStart: true, logEnd: true, logDuration: true },
    logArgs = false,
    logResult = false
  } = options;

  const logger = createContextLogger({ functionName, module });

  return ((...args: Parameters<T>) => {
    const startTime = Date.now();

    // Log start
    if (performance.logStart) {
      const argSummary = logArgs ? args.map(arg => 
        typeof arg === 'string' ? arg.substring(0, 50) : typeof arg
      ) : 'args hidden';
      
      logger.debug('Function started', { args: argSummary });
    }

    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then(asyncResult => {
            const duration = Date.now() - startTime;
            
            if (performance.logEnd) {
              logger.debug('Function completed successfully', { duration });
            }
            
            if (performance.logDuration) {
              logPerformanceDuration(functionName, duration, performance);
            }
            
            if (logResult) {
              const resultSummary = typeof asyncResult === 'string' 
                ? asyncResult.substring(0, 50) 
                : typeof asyncResult;
              logger.debug('Function result', { result: resultSummary });
            }
            
            return asyncResult;
          })
          .catch(error => {
            const duration = Date.now() - startTime;
            
            logger.functionError(error, 'async execution');
            
            if (performance.logDuration) {
              logPerformanceDuration(functionName, duration, performance, true);
            }
            
            throw error;
          });
      }
      
      // Handle sync functions
      const duration = Date.now() - startTime;
      
      if (performance.logEnd) {
        logger.debug('Function completed successfully', { duration });
      }
      
      if (performance.logDuration) {
        logPerformanceDuration(functionName, duration, performance);
      }
      
      if (logResult) {
        const resultSummary = typeof result === 'string' 
          ? result.substring(0, 50) 
          : typeof result;
        logger.debug('Function result', { result: resultSummary });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.functionError(error as Error, 'sync execution');
      
      if (performance.logDuration) {
        logPerformanceDuration(functionName, duration, performance, true);
      }
      
      throw error;
    }
  }) as T;
};

/**
 * Logs function performance with threshold-based warnings.
 * 
 * @param functionName - Name of the function
 * @param duration - Execution duration in milliseconds
 * @param options - Performance logging options
 * @param hadError - Whether the function threw an error
 */
export const logPerformanceDuration = (
  functionName: string,
  duration: number,
  options: PerformanceLoggingOptions = {},
  hadError: boolean = false
) => {
  const { warnThreshold = 1000, errorThreshold = 5000 } = options;
  
  const context = { functionName, duration, hadError };
  
  if (hadError || duration > errorThreshold) {
    logger.error(`Performance issue: ${functionName} took ${duration}ms`, context);
  } else if (duration > warnThreshold) {
    logger.warn(`Performance warning: ${functionName} took ${duration}ms`, context);
  } else {
    logger.debug(`Performance: ${functionName} completed in ${duration}ms`, context);
  }
};

/**
 * Measures and logs function execution time.
 * 
 * @param fn - Function to measure
 * @param context - Logging context
 * @returns Execution result with duration
 * 
 * @example
 * ```typescript
 * const result = measurePerformance(() => {
 *   // Your logic here
 *   return 'result';
 * }, { functionName: 'expensiveOperation' });
 * 
 * console.log(result.result); // 'result'
 * console.log(result.duration); // execution time in ms
 * ```
 */
export const measurePerformance = async <T>(
  fn: () => T | Promise<T>,
  context: LoggingContext = {}
): Promise<FunctionExecutionResult<T>> => {
  const logger = createContextLogger(context);
  const startTime = Date.now();
  
  try {
    logger.debug('Starting performance measurement');
    
    const result = await fn();
    const duration = Date.now() - startTime;
    
    logger.info('Performance measurement completed', { duration });
    
    return {
      result,
      duration,
      success: true
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.functionError(error as Error, 'performance measurement');
    
    return {
      error: error as Error,
      duration,
      success: false
    };
  }
};

/**
 * Creates a structured log entry for API requests.
 * 
 * @param method - HTTP method
 * @param url - Request URL
 * @param statusCode - Response status code
 * @param duration - Request duration in milliseconds
 * @param context - Additional context
 */
export const logApiRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context: {
    userId?: string;
    requestId?: string;
    userAgent?: string;
    ip?: string;
  } = {}
) => {
  const logger = createContextLogger({
    functionName: 'apiRequest',
    operation: `${method} ${url}`,
    ...context
  });

  const level = statusCode >= 500 ? 'error' : 
                statusCode >= 400 ? 'warn' : 
                'info';

  const message = `${method} ${url} - ${statusCode} (${duration}ms)`;

  const logData = {
    method,
    url,
    statusCode,
    duration,
    userId: context.userId,
    requestId: context.requestId,
    userAgent: context.userAgent,
    ip: context.ip
  };

  if (level === 'error') {
    logger.error(message, new Error(message), logData);
  } else if (level === 'warn') {
    logger.warn(message, logData);
  } else {
    logger.info(message, logData);
  }
};

// Export all logging utilities as a grouped object for convenience
export const LoggingUtils = {
  createContextLogger,
  quickLogger,
  withLogging,
  logPerformanceDuration,
  measurePerformance,
  logApiRequest
};

export default LoggingUtils;
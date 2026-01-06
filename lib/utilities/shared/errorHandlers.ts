/**
 * SHARED ERROR HANDLING UTILITIES
 * 
 * PURPOSE: Provides consistent error handling patterns across the codebase.
 * This utility eliminates duplication of error handling logic and ensures
 * uniform error reporting and logging behavior.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized error handling with qerrors integration
 * - Consistent error logging and reporting
 * - Graceful error recovery with fallback values
 * - Type-safe error handling for TypeScript
 * - Performance optimized error processing
 * 
 * USAGE PATTERNS:
 * - Try-catch wrapper functions
 * - Error logging with context
 * - Fallback value handling
 * - Error type normalization
 */

import { qerrors } from 'qerrors';
import logger from '../../logger.js';

/**
 * Standard error information interface for consistent error handling.
 */
export interface ErrorInfo {
  message: string;
  originalError: Error | string | unknown;
  context?: string;
  functionName?: string;
  timestamp: Date;
}

/**
 * Configuration options for error handling behavior.
 */
export interface ErrorHandlingOptions {
  /** Function name for error context */
  functionName?: string;
  /** Additional context information */
  context?: string;
  /** Fallback value to return on error */
  fallbackValue?: any;
  /** Whether to log the error (default: true) */
  logError?: boolean;
  /** Whether to report error via qerrors (default: true) */
  reportError?: boolean;
  /** Custom error message prefix */
  messagePrefix?: string;
}

/**
 * Wraps a function with standardized error handling.
 * This is the most common pattern used across the codebase.
 * 
 * @param fn - The function to wrap with error handling
 * @param options - Error handling configuration
 * @returns Function with error handling applied
 * 
 * @example
 * ```typescript
 * const safeFunction = withErrorHandling(
 *   (input: string) => {
 *     // Your logic here
 *     return input.toUpperCase();
 *   },
 *   {
 *     functionName: 'myFunction',
 *     fallbackValue: '',
 *     context: 'Processing user input'
 *   }
 * );
 * 
 * const result = safeFunction('hello'); // Returns 'HELLO'
 * const badResult = safeFunction(null); // Returns '' (fallback)
 * ```
 */
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  options: ErrorHandlingOptions = {}
): T => {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          handleError(error, options);
          return options.fallbackValue;
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, options);
      return options.fallbackValue;
    }
  }) as T;
};

/**
 * Handles errors in a standardized way across the codebase.
 * This replaces the repetitive error handling pattern found in 54+ locations.
 * 
 * @param error - The error to handle
 * @param options - Error handling configuration
 * @returns Normalized error information
 */
export const handleError = (
  error: Error | string | unknown,
  options: ErrorHandlingOptions = {}
): ErrorInfo => {
  const {
    functionName = 'unknown',
    context = '',
    logError = true,
    reportError = true,
    messagePrefix = ''
  } = options;

  // Normalize error to Error instance
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  
  // Create error info object
  const errorInfo: ErrorInfo = {
    message: messagePrefix ? `${messagePrefix}: ${normalizedError.message}` : normalizedError.message,
    originalError: error,
    context,
    functionName,
    timestamp: new Date()
  };

  // Log error if enabled
  if (logError) {
    const logMessage = context 
      ? `${functionName} failed in ${context}: ${errorInfo.message}`
      : `${functionName} failed: ${errorInfo.message}`;
    
    logger.error(logMessage, { error: errorInfo.originalError });
  }

  // Report error via qerrors if enabled
  if (reportError) {
    const reportMessage = context 
      ? `${functionName} error in ${context}: ${errorInfo.message}`
      : `${functionName} error: ${errorInfo.message}`;
    
    qerrors(normalizedError, functionName, reportMessage);
  }

  return errorInfo;
};

/**
 * Safe execution wrapper that returns a result object instead of throwing.
 * Useful for functions where you need to know if execution succeeded.
 * 
 * @param fn - Function to execute safely
 * @param options - Error handling options
 * @returns Object with success status, result, and error info
 * 
 * @example
 * ```typescript
 * const result = safeExecute(() => {
 *   return JSON.parse(invalidJson);
 * }, { functionName: 'parseJson' });
 * 
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.log('Error:', result.error.message);
 * }
 * ```
 */
export const safeExecute = <T>(
  fn: () => T,
  options: ErrorHandlingOptions = {}
): { success: true; data: T } | { success: false; error: ErrorInfo; fallbackValue?: any } => {
  try {
    const result = fn();
    
    // Handle async functions
    if (result instanceof Promise) {
      // For async functions, we need to return a Promise that resolves to the expected type
      return result
        .then(data => ({ success: true, data }))
        .catch(error => ({
          success: false,
          error: handleError(error, options),
          fallbackValue: options.fallbackValue
        })) as any;
    }
    
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, options),
      fallbackValue: options.fallbackValue
    };
  }
};

/**
 * Async-safe error handling wrapper for promise-based functions.
 * 
 * @param asyncFn - Async function to wrap
 * @param options - Error handling options
 * @returns Promise that never rejects
 * 
 * @example
 * ```typescript
 * const safeAsyncFunction = withAsyncErrorHandling(
 *   async (url: string) => {
 *     const response = await fetch(url);
 *     return response.json();
 *   },
 *   {
 *     functionName: 'fetchData',
 *     fallbackValue: null
 *   }
 * );
 * 
 * const data = await safeAsyncFunction('https://api.example.com');
 * // Never throws, returns fallback on error
 * ```
 */
export const withAsyncErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: ErrorHandlingOptions = {}
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, options);
      return options.fallbackValue;
    }
  }) as T;
};

/**
 * Creates a standardized error response object for API endpoints.
 * Common pattern used in HTTP utilities and middleware.
 * 
 * @param error - The error that occurred
 * @param options - Error handling options
 * @returns Standardized error response object
 */
export const createErrorResponse = (
  error: Error | string | unknown,
  options: ErrorHandlingOptions & { 
    statusCode?: number; 
    errorType?: string;
    userMessage?: string;
  } = {}
): {
  success: false;
  error: {
    type: string;
    message: string;
    timestamp: string;
    context?: string;
  };
  statusCode?: number;
} => {
  const errorInfo = handleError(error, options);
  
  return {
    success: false,
    error: {
      type: options.errorType || 'INTERNAL_ERROR',
      message: options.userMessage || 'An internal error occurred',
      timestamp: errorInfo.timestamp.toISOString(),
      context: options.context
    },
    statusCode: options.statusCode || 500
  };
};

/**
 * Validation error handler for form/input validation.
 * Specialized error handling for validation failures.
 * 
 * @param fieldName - Name of the field being validated
 * @param validationError - Validation error details
 * @param options - Additional error handling options
 * @returns Standardized validation error response
 */
export const handleValidationError = (
  fieldName: string,
  validationError: string | { message: string; code?: string },
  options: ErrorHandlingOptions = {}
): { error: string; field?: string; code?: string } => {
  const errorMessage = typeof validationError === 'string' 
    ? validationError 
    : validationError.message;
  
  const errorCode = typeof validationError === 'object' && validationError.code 
    ? validationError.code 
    : 'VALIDATION_ERROR';

  handleError(`Validation failed for field '${fieldName}': ${errorMessage}`, {
    ...options,
    functionName: options.functionName || 'validateField',
    context: `Field: ${fieldName}`
  });

  return {
    error: errorMessage,
    field: fieldName,
    code: errorCode
  };
};

/**
 * Performance monitoring error handler.
 * Tracks errors that occur during performance-critical operations.
 * 
 * @param operation - Name of the operation being performed
 * @param error - Error that occurred
 * @param metrics - Optional performance metrics
 * @param options - Additional error handling options
 */
export const handlePerformanceError = (
  operation: string,
  error: Error | string | unknown,
  metrics: { duration?: number; memoryUsage?: number } = {},
  options: ErrorHandlingOptions = {}
): ErrorInfo => {
  const errorInfo = handleError(error, {
    ...options,
    functionName: options.functionName || operation,
    context: options.context ? `${options.context} | Metrics: ${JSON.stringify(metrics)}` : `Metrics: ${JSON.stringify(metrics)}`
  });

  // Log performance-specific information
  logger.warn(`Performance error in ${operation}`, {
    error: errorInfo,
    metrics
  });

  return errorInfo;
};

// Export all error handlers as a grouped object for convenience
export const ErrorHandlers = {
  withErrorHandling,
  handleError,
  safeExecute,
  withAsyncErrorHandling,
  createErrorResponse,
  handleValidationError,
  handlePerformanceError
};

export default ErrorHandlers;
/**
 * Common Error Handling Utilities
 *
 * Centralized error handling functions to eliminate code duplication across
 * the codebase. These utilities handle common error patterns including
 * try-catch blocks, error logging, error creation, and standardized error responses.
 */

import { qerr as qerrors } from '@bijikyu/qerrors';

/**
 * Standard error handler with qerrors logging
 * @param error - Error to handle
 * @param functionName - Name of the function where error occurred
 * @param context - Additional context information
 * @returns Normalized error object
 */
export function handleError(error: any, functionName: string, context?: string): Error {
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  qerrors(normalizedError, functionName, context);
  return normalizedError;
}

/**
 * Wraps a function with standardized error handling
 * @param fn - Function to wrap
 * @param functionName - Name of the function for error logging
 * @param context - Additional context for error logging
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  context?: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.catch((error: any) => {
          throw handleError(error, functionName, context);
        });
      }

      return result;
    } catch (error) {
      throw handleError(error, functionName, context);
    }
  }) as T;
}

/**
 * Creates a safe version of a function that returns a default value on error
 * @param fn - Function to make safe
 * @param defaultValue - Default value to return on error
 * @param functionName - Name of the function for error logging
 * @param context - Additional context for error logging
 * @returns Safe function that returns default value on error
 */
export function createSafeFunction<T extends (...args: any[]) => any>(
  fn: T,
  defaultValue: ReturnType<T>,
  functionName: string,
  context?: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.catch((error: any) => {
          handleError(error, functionName, context);
          return defaultValue;
        });
      }

      return result;
    } catch (error) {
      handleError(error, functionName, context);
      return defaultValue;
    }
  }) as T;
}

/**
 * Standardized error response creator
 * @param options - Error response options
 * @returns Standardized error response object
 */
export function createErrorResponse(options: {
  status?: number;
  type?: string;
  message?: string;
  field?: string;
  metadata?: Record<string, any>;
} = {}): {
  success: false;
  error: {
    type: string;
    message: string;
    field?: string;
    metadata?: Record<string, any>;
  };
} {
  const {
    status = 400,
    type = 'ERROR',
    message = 'Request failed',
    field,
    metadata
  } = options;

  return {
    success: false,
    error: {
      type,
      message,
      ...(field && { field }),
      ...(metadata && { metadata })
    }
  };
}

/**
 * Common HTTP error response types
 */
export const ErrorResponses = {
  badRequest: (message = 'Bad request', field?: string) => createErrorResponse({
    status: 400,
    type: 'BAD_REQUEST',
    message,
    field
  }),

  unauthorized: (message = 'Unauthorized') => createErrorResponse({
    status: 401,
    type: 'UNAUTHORIZED',
    message
  }),

  forbidden: (message = 'Forbidden') => createErrorResponse({
    status: 403,
    type: 'FORBIDDEN',
    message
  }),

  notFound: (message = 'Not found') => createErrorResponse({
    status: 404,
    type: 'NOT_FOUND',
    message
  }),

  methodNotAllowed: (message = 'Method not allowed') => createErrorResponse({
    status: 405,
    type: 'METHOD_NOT_ALLOWED',
    message
  }),

  conflict: (message = 'Conflict') => createErrorResponse({
    status: 409,
    type: 'CONFLICT',
    message
  }),

  unprocessableEntity: (message = 'Unprocessable entity', field?: string) => createErrorResponse({
    status: 422,
    type: 'UNPROCESSABLE_ENTITY',
    message,
    field
  }),

  tooManyRequests: (message = 'Too many requests') => createErrorResponse({
    status: 429,
    type: 'TOO_MANY_REQUESTS',
    message
  }),

  internalServerError: (message = 'Internal server error') => createErrorResponse({
    status: 500,
    type: 'INTERNAL_SERVER_ERROR',
    message
  }),

  serviceUnavailable: (message = 'Service unavailable') => createErrorResponse({
    status: 503,
    type: 'SERVICE_UNAVAILABLE',
    message
  })
};

/**
 * Validation error creator
 * @param field - Field name that failed validation
 * @param message - Validation error message
 * @returns Validation error response
 */
export function createValidationError(field: string, message?: string) {
  return createErrorResponse({
    status: 400,
    type: 'VALIDATION_ERROR',
    message: message || `Validation failed for field: ${field}`,
    field
  });
}

/**
 * Authentication error creator
 * @param message - Authentication error message
 * @returns Authentication error response
 */
export function createAuthError(message = 'Authentication failed') {
  return createErrorResponse({
    status: 401,
    type: 'AUTHENTICATION_ERROR',
    message
  });
}

/**
 * Authorization error creator
 * @param message - Authorization error message
 * @returns Authorization error response
 */
export function createForbiddenError(message = 'Access denied') {
  return createErrorResponse({
    status: 403,
    type: 'AUTHORIZATION_ERROR',
    message
  });
}

/**
 * Not found error creator
 * @param resource - Resource name that was not found
 * @returns Not found error response
 */
export function createNotFoundError(resource = 'Resource') {
  return createErrorResponse({
    status: 404,
    type: 'NOT_FOUND_ERROR',
    message: `${resource} not found`
  });
}

/**
 * Rate limit error creator
 * @param retryAfter - Seconds to wait before retrying
 * @returns Rate limit error response
 */
export function createRateLimitError(retryAfter?: number) {
  return createErrorResponse({
    status: 429,
    type: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
    metadata: retryAfter ? { retryAfter } : undefined
  });
}

/**
 * Creates a standardized error for API operations
 * @param operation - Operation name
 * @param error - Original error
 * @param context - Additional context
 * @returns Standardized API error
 */
export function createApiError(operation: string, error: any, context?: string) {
  const message = error instanceof Error ? error.message : String(error);
  return createErrorResponse({
    status: 500,
    type: 'API_ERROR',
    message: `${operation} failed: ${message}`,
    metadata: context ? { context, operation } : { operation }
  });
}

/**
 * Error boundary for async operations
 * @param asyncFn - Async function to execute
 * @param errorHandler - Error handler function
 * @returns Promise with error handling
 */
export async function withAsyncErrorHandling<T>(
  asyncFn: () => Promise<T>,
  errorHandler?: (error: Error) => T | Promise<T>
): Promise<T> {
  try {
    return await asyncFn();
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));

    if (errorHandler) {
      return await errorHandler(normalizedError);
    }

    throw normalizedError;
  }
}

/**
 * Creates a retry wrapper for functions that can fail temporarily
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delay - Delay between retries in milliseconds
 * @param functionName - Function name for error logging
 * @returns Function with retry logic
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  maxRetries: number = 3,
  delay: number = 1000,
  functionName: string = 'unknown'
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          handleError(lastError, functionName, `Failed after ${maxRetries} retries`);
          throw lastError;
        }

        // Log retry attempt
        handleError(lastError, functionName, `Attempt ${attempt + 1} failed, retrying...`);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }

    throw lastError!;
  }) as T;
}

/**
 * SHARED HTTP RESPONSE UTILITIES
 * 
 * PURPOSE: Provides common HTTP response patterns used across the codebase.
 * This utility eliminates duplication of response handling logic and ensures
 * consistent API response format throughout the application.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized HTTP response formatting
 * - Consistent error response structure
 * - Standardized status code handling
 * - Performance optimized response creation
 * - TypeScript compatible with proper typing
 * 
 * USAGE PATTERNS:
 * - Success response formatting
 * - Error response standardization
 * - Status code management
 * - Response middleware helpers
 */

import { Response } from 'express';
import { ErrorHandlers } from './errorHandlers.js';
import { FieldValidators } from './fieldValidators.js';
import logger from '../../logger.js';

/**
 * Standard API response interface.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
  meta?: {
    timestamp: string;
    version?: string;
    requestId?: string;
  };
}

/**
 * Error response options interface.
 */
export interface ErrorResponseOptions {
  /** Error type for categorization */
  errorType?: string;
  /** Custom error message for user */
  userMessage?: string;
  /** Additional error details */
  details?: any;
  /** Request ID for tracing */
  requestId?: string;
  /** API version */
  version?: string;
  /** Whether to include stack trace in development */
  includeStack?: boolean;
}

/**
 * Success response options interface.
 */
export interface SuccessResponseOptions<T = any> {
  /** Response data */
  data?: T;
  /** Success message */
  message?: string;
  /** Request ID for tracing */
  requestId?: string;
  /** API version */
  version?: string;
  /** Additional metadata */
  meta?: Record<string, any>;
}

/**
 * Creates a standardized success response.
 * This is the most common response pattern used across the codebase.
 * 
 * @param res - Express Response object
 * @param statusCode - HTTP status code (default: 200)
 * @param options - Response options
 * @returns Express Response with standardized format
 * 
 * @example
 * ```typescript
 * // Simple success response
 * return successResponse(res, 200, { data: user });
 * 
 * // With additional options
 * return successResponse(res, 201, { 
 *   data: createdUser,
 *   message: 'User created successfully',
 *   requestId: 'req-123'
 * });
 * ```
 */
export const successResponse = <T = any>(
  res: Response,
  statusCode: number = 200,
  options: SuccessResponseOptions<T> = {}
): Response => {
  const { data, message, requestId, version, meta } = options;
  
  const response: ApiResponse<T> = {
    success: true,
    meta: {
      timestamp: new Date().toISOString(),
      version,
      requestId,
      ...meta
    }
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    // Add message to data or meta depending on data presence
    if (response.data !== undefined) {
      response.data = { ...response.data, message } as T;
    } else {
      response.data = { message } as T;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Creates a standardized error response.
 * Replaces the repetitive error response pattern found in 40+ locations.
 * 
 * @param res - Express Response object
 * @param statusCode - HTTP status code (default: 500)
 * @param error - Error object or message
 * @param options - Error response options
 * @returns Express Response with standardized error format
 * 
 * @example
 * ```typescript
 * // Simple error response
 * return errorResponse(res, 400, 'Invalid input');
 * 
 * // With detailed options
 * return errorResponse(res, 404, new Error('User not found'), {
 *   errorType: 'NOT_FOUND',
 *   userMessage: 'We could not find the user you are looking for',
 *   requestId: 'req-123'
 * });
 * ```
 */
export const errorResponse = (
  res: Response,
  statusCode: number = 500,
  error: Error | string = 'Internal Server Error',
  options: ErrorResponseOptions = {}
): Response => {
  const {
    errorType = 'INTERNAL_ERROR',
    userMessage = 'An internal error occurred',
    details,
    requestId,
    version,
    includeStack = process.env.NODE_ENV === 'development'
  } = options;

  // Handle the error using our centralized error handler
  const errorInfo = ErrorHandlers.handleError(error, {
    functionName: 'errorResponse',
    context: `HTTP ${statusCode} response`
  });

  // Determine error type based on status code
  let finalErrorType = errorType;
  if (statusCode >= 400 && statusCode < 500) {
    if (finalErrorType === 'INTERNAL_ERROR') {
      finalErrorType = statusCode === 400 ? 'BAD_REQUEST' : 
                       statusCode === 401 ? 'UNAUTHORIZED' :
                       statusCode === 403 ? 'FORBIDDEN' :
                       statusCode === 404 ? 'NOT_FOUND' :
                       'CLIENT_ERROR';
    }
  }

  const response: ApiResponse = {
    success: false,
    error: {
      type: finalErrorType,
      message: userMessage,
      details,
      timestamp: errorInfo.timestamp.toISOString(),
      requestId
    },
    meta: {
      timestamp: errorInfo.timestamp.toISOString(),
      version,
      requestId
    }
  };

  // Include stack trace in development
  if (includeStack && error instanceof Error && response.error) {
    response.error.details = {
      ...response.error.details,
      stack: error.stack
    };
  }

  return res.status(statusCode).json(response);
};

/**
 * Quick success response for common use cases.
 * Simplified interface for the most frequent success patterns.
 * 
 * @param res - Express Response object
 * @param data - Response data
 * @param options - Additional options
 * @returns Express Response
 * 
 * @example
 * ```typescript
 * return quickSuccess(res, { users: [...] });
 * return quickSuccess(res, { users: [...] }, { message: 'Users retrieved successfully' });
 * ```
 */
export const quickSuccess = <T = any>(
  res: Response,
  data?: T,
  options: { message?: string; statusCode?: number; requestId?: string } = {}
): Response => {
  const { message, statusCode = 200, requestId } = options;
  
  return successResponse(res, statusCode, {
    data,
    message,
    requestId
  });
};

/**
 * Quick error response for common use cases.
 * Simplified interface for the most frequent error patterns.
 * 
 * @param res - Express Response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param options - Additional options
 * @returns Express Response
 * 
 * @example
 * ```typescript
 * return quickError(res, 'Invalid input', 400);
 * return quickError(res, 'Unauthorized', 401, { errorType: 'AUTH_ERROR' });
 * ```
 */
export const quickError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  options: { errorType?: string; details?: any } = {}
): Response => {
  const { errorType, details } = options;
  
  return errorResponse(res, statusCode, message, {
    errorType,
    userMessage: message,
    details
  });
};

/**
 * Creates a validation error response.
 * Specialized response for validation failures.
 * 
 * @param res - Express Response object
 * @param validationErrors - Array of validation errors
 * @param options - Response options
 * @returns Express Response
 */
export const validationErrorResponse = (
  res: Response,
  validationErrors: Array<{ field?: string; message: string; code?: string }>,
  options: { requestId?: string; version?: string } = {}
): Response => {
  const { requestId, version } = options;

  // Group errors by field
  const fieldErrors: { [field: string]: string[] } = {};
  const generalErrors: string[] = [];

  validationErrors.forEach(error => {
    if (error.field) {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field].push(error.message);
    } else {
      generalErrors.push(error.message);
    }
  });

  return errorResponse(res, 400, 'Validation failed', {
    errorType: 'VALIDATION_ERROR',
    userMessage: 'The provided data is invalid',
    details: {
      fields: fieldErrors,
      general: generalErrors
    },
    requestId,
    version
  });
};

/**
 * Creates a not found response.
 * 
 * @param res - Express Response object
 * @param resource - Name of the resource that was not found
 * @param options - Response options
 * @returns Express Response
 */
export const notFoundResponse = (
  res: Response,
  resource: string = 'Resource',
  options: { requestId?: string; details?: any } = {}
): Response => {
  const { requestId, details } = options;
  
  return errorResponse(res, 404, `${resource} not found`, {
    errorType: 'NOT_FOUND',
    userMessage: `The ${resource.toLowerCase()} you are looking for could not be found`,
    details,
    requestId
  });
};

/**
 * Creates an unauthorized response.
 * 
 * @param res - Express Response object
 * @param message - Custom message (default: 'Unauthorized')
 * @param options - Response options
 * @returns Express Response
 */
export const unauthorizedResponse = (
  res: Response,
  message: string = 'Unauthorized',
  options: { requestId?: string; details?: any } = {}
): Response => {
  const { requestId, details } = options;
  
  return errorResponse(res, 401, message, {
    errorType: 'UNAUTHORIZED',
    userMessage: message,
    details,
    requestId
  });
};

/**
 * Creates a forbidden response.
 * 
 * @param res - Express Response object
 * @param message - Custom message (default: 'Forbidden')
 * @param options - Response options
 * @returns Express Response
 */
export const forbiddenResponse = (
  res: Response,
  message: string = 'Forbidden',
  options: { requestId?: string; details?: any } = {}
): Response => {
  const { requestId, details } = options;
  
  return errorResponse(res, 403, message, {
    errorType: 'FORBIDDEN',
    userMessage: message,
    details,
    requestId
  });
};

/**
 * Creates a server error response.
 * 
 * @param res - Express Response object
 * @param error - Error object or message
 * @param options - Response options
 * @returns Express Response
 */
export const serverErrorResponse = (
  res: Response,
  error: Error | string = 'Internal Server Error',
  options: { requestId?: string; userMessage?: string; details?: any } = {}
): Response => {
  const { requestId, userMessage, details } = options;
  
  return errorResponse(res, 500, error, {
    errorType: 'INTERNAL_ERROR',
    userMessage: userMessage || 'An unexpected error occurred',
    details,
    requestId
  });
};

/**
 * Response middleware factory for consistent response handling.
 * 
 * @param options - Middleware configuration
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * // Apply middleware to all routes
 * app.use(responseMiddleware({ version: '1.0.0' }));
 * 
 * // Now routes can use simplified response helpers
 * app.get('/users', (req, res) => {
 *   return res.success({ users: [...] });
 * });
 * ```
 */
export const responseMiddleware = (options: { version?: string; includeRequestId?: boolean } = {}) => {
  const { version, includeRequestId = true } = options;

  return (req: any, res: Response, next: any) => {
    // Generate request ID if needed
    const requestId = includeRequestId ? req.id || req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : undefined;

    // Attach response helpers to res object
    res.success = <T = any>(data?: T, options?: { message?: string; statusCode?: number }) => {
      return successResponse(res, options?.statusCode || 200, {
        data,
        message: options?.message,
        requestId,
        version
      });
    };

    res.error = (message: string, statusCode: number = 400, options?: { errorType?: string; details?: any }) => {
      return errorResponse(res, statusCode, message, {
        ...options,
        requestId,
        version
      });
    };

    res.validationError = (errors: Array<{ field?: string; message: string; code?: string }>) => {
      return validationErrorResponse(res, errors, { requestId, version });
    };

    res.notFound = (resource?: string, options?: { details?: any }) => {
      return notFoundResponse(res, resource, { requestId, ...options });
    };

    res.unauthorized = (message?: string, options?: { details?: any }) => {
      return unauthorizedResponse(res, message, { requestId, ...options });
    };

    res.forbidden = (message?: string, options?: { details?: any }) => {
      return forbiddenResponse(res, message, { requestId, ...options });
    };

    res.serverError = (error: Error | string, options?: { userMessage?: string; details?: any }) => {
      return serverErrorResponse(res, error, { requestId, ...options });
    };

    next();
  };
};

// Export all response utilities as a grouped object for convenience
export const HttpResponseUtils = {
  successResponse,
  errorResponse,
  quickSuccess,
  quickError,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  responseMiddleware
};

export default HttpResponseUtils;
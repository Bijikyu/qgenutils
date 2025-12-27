'use strict';

interface ValidationErrorHandlerOptions {
  sendError?: (res: any, errorPayload: any) => Promise<void>;
}

/**
 * Creates a validation error handler for a specific controller
 * Provides standardized validation error responses
 * @param {string} controllerName - Name of the controller for error context
 * @param {Object} [options] - Configuration options
 * @param {Function} [options.sendError] - Custom error response function
 * @returns {Function} Handler function for validation errors
 * @example
 * const handleError: any = createValidationErrorHandler('UserController');
 * handleError(res, 'Email is required', 'email');
 */
function createValidationErrorHandler(controllerName: string, options: ValidationErrorHandlerOptions = {}) { // factory for validation error handlers
  if (typeof controllerName !== 'string' || !controllerName.trim()) {
    throw new Error('controllerName is required');
  }

  const sendError: any = options.sendError || defaultSendError; // custom or default error sender

  return async function handleValidationError(res, message, fieldName, metadata) { // handle validation error
    if (!res || typeof res.status !== 'function') {
      throw new Error('Valid Express response object required');
    }

    interface ValidationErrorPayload {
      success: boolean;
      error: {
        type: string;
        message: string;
        field: string | null;
        controller: string;
        metadata?: any;
      };
    }

    const errorPayload: ValidationErrorPayload = { // build error payload
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: message || 'Validation failed',
        field: fieldName || null,
        controller: controllerName
      }
    };

    if (metadata && typeof metadata === 'object') { // include metadata if provided
      errorPayload.error.metadata = metadata;
    }

    await sendError(res, errorPayload); // send error response
  };
}

function defaultSendError(res, payload) { // default error sender
  res.status(400).json(payload);
}

export default createValidationErrorHandler;

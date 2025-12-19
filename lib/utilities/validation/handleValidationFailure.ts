'use strict';

/**
 * Sends a standardized validation failure response
 * @param {Object} options - Validation failure options
 * @param {Object} options.res - Express response object
 * @param {string} options.message - Validation message for API clients
 * @param {string} options.field - Name of field that failed validation
 * @param {string} options.context - Request context for debugging
 * @param {Object} [options.metadata] - Extra debugging data
 * @param {boolean} [options.throwError=false] - Throw error instead of sending response
 * @returns {Promise<void>}
 * @example
 * await handleValidationFailure({
 *   res, message: 'Invalid email format', field: 'email', context: 'UserController.create'
 * });
 */
async function handleValidationFailure(options) { // send validation failure response
  const { res, field, message, metadata, context, throwError = false }: any = options;

  if (!res || typeof res.status !== 'function') {
    throw new Error('Valid Express response object required');
  }

  const errorPayload = { // build error payload
    success: false,
    error: {
      type: 'VALIDATION_ERROR',
      message: message || 'Validation failed',
      field: field || null,
      context: context || null
    }
  };

  if (metadata && typeof metadata === 'object') { // include metadata
    errorPayload.error.details = metadata;
  }

  if (throwError) { // throw instead of sending
    const error: any = new Error(message);
    error.status = 400;
    error.field = field;
    error.details = metadata;
    throw error;
  }

  res.status(400).json(errorPayload); // send error response
}

export default handleValidationFailure;

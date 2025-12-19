/**
 * Sends standardized error responses for HTTP requests
 * @param {Object} res - Express response object
 * @param {Object} options - Error response options
 * @param {number} options.status - HTTP status code (default: 400)
 * @param {string} options.type - Error type (default: 'ERROR')
 * @param {string} options.message - Error message (default: 'Request failed')
 * @param {string} options.field - Field name that caused the error
 * @param {Object} options.metadata - Additional error metadata
 * @returns {Object} Express response object
 */
function sendErrorResponse(res, options = {}) {
  const {
    status = 400,
    type = 'ERROR',
    message = 'Request failed',
    field = null,
    metadata = null
  } = options;

  const payload = {
    success: false,
    error: {
      type,
      message,
      ...(field && { field }),
      ...(metadata && { metadata })
    }
  };

  return res.status(status).json(payload);
}

/**
 * Sends validation error responses
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 * @param {string} fieldName - Field name that failed validation
 * @param {Object} metadata - Additional validation metadata
 * @returns {Object} Express response object
 */
function sendValidationError(res, message, fieldName = null, metadata = null) {
  return sendErrorResponse(res, {
    status: 400,
    type: 'VALIDATION_ERROR',
    message: message || 'Validation failed',
    field: fieldName,
    metadata
  });
}

/**
 * Sends authentication error responses
 * @param {Object} res - Express response object
 * @param {string} message - Authentication error message
 * @returns {Object} Express response object
 */
function sendAuthError(res, message = null) {
  return sendErrorResponse(res, {
    status: 401,
    type: 'AUTHENTICATION_ERROR',
    message: message || 'Authentication required',
    field: null
  });
}

/**
 * Sends authorization error responses
 * @param {Object} res - Express response object
 * @param {string} message - Authorization error message
 * @returns {Object} Express response object
 */
function sendForbiddenError(res, message = null) {
  return sendErrorResponse(res, {
    status: 403,
    type: 'AUTHORIZATION_ERROR',
    message: message || 'Access denied',
    field: null
  });
}

/**
 * Sends not found error responses
 * @param {Object} res - Express response object
 * @param {string} message - Not found error message
 * @returns {Object} Express response object
 */
function sendNotFoundError(res, message = null) {
  return sendErrorResponse(res, {
    status: 404,
    type: 'NOT_FOUND_ERROR',
    message: message || 'Resource not found',
    field: null
  });
}

/**
 * Sends server error responses
 * @param {Object} res - Express response object
 * @param {string} message - Server error message
 * @param {Object} metadata - Additional error metadata
 * @returns {Object} Express response object
 */
function sendServerError(res, message = null, metadata = null) {
  return sendErrorResponse(res, {
    status: 500,
    type: 'SERVER_ERROR',
    message: message || 'Internal server error',
    field: null,
    metadata
  });
}

module.exports = {
  sendErrorResponse,
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError,
  sendServerError
};
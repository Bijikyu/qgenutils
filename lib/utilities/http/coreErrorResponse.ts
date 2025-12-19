/**
 * Core error response functionality
 */

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

export default {
  sendErrorResponse
};
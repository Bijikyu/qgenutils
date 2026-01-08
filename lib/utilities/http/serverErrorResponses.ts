/**
 * Server error response utilities (5xx status codes)
 */

import coreErrorResponse from './coreErrorResponse.js';
const { sendErrorResponse } = coreErrorResponse;

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

export default {
  sendServerError
};

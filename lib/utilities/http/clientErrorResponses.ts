/**
 * Client error response utilities (4xx status codes)
 */

import coreErrorResponse from './coreErrorResponse.js';
const { sendErrorResponse } = coreErrorResponse;

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

export default {
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError
};

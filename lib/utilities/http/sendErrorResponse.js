/**
 * Error response utilities - consolidated interface for all error responses
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual error response modules
const { sendErrorResponse } = require('./coreErrorResponse');
const {
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError
} = require('./clientErrorResponses');
const { sendServerError } = require('./serverErrorResponses');

// Export all error response functions for backward compatibility
module.exports = {
  sendErrorResponse,
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError,
  sendServerError
};
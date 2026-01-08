/**
 * Error response utilities - consolidated interface for all error responses
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual error response modules
import coreErrorResponse from './coreErrorResponse.js';
import clientErrorResponses from './clientErrorResponses.js';
import serverErrorResponses from './serverErrorResponses.js';

const { sendErrorResponse } = coreErrorResponse;
const { sendValidationError, sendAuthError, sendForbiddenError, sendNotFoundError } = clientErrorResponses;
const { sendServerError } = serverErrorResponses;

// Export all error response functions for backward compatibility
export default {
  sendErrorResponse,
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError,
  sendServerError
};

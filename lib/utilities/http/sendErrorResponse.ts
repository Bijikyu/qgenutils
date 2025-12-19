/**
 * Error response utilities - consolidated interface for all error responses
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual error response modules
import { sendErrorResponse } from './coreErrorResponse';
const {
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError
} = require('./clientErrorResponses');
import { sendServerError } from './serverErrorResponses';

// Export all error response functions for backward compatibility
export default {
  sendErrorResponse,
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError,
  sendServerError
};
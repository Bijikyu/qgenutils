
/*
 * Response Utilities Module
 * 
 * This module provides centralized response handling utilities that standardize
 * HTTP responses across all modules. It consolidates error response patterns
 * and Express response validation to ensure consistent API behavior.
 * 
 * DESIGN PHILOSOPHY:
 * - Consistency: All modules use the same response format and error handling
 * - Fail-fast: Invalid responses are caught early with clear error messages
 * - Developer experience: Centralized logging and debugging for all responses
 * - Security: Standardized error messages prevent information leakage
 * 
 * CONSOLIDATION RATIONALE:
 * Previously, validation.js and http.js had duplicate response handling code.
 * This module eliminates that duplication while providing a single source of
 * truth for response formatting across the entire application.
 */

const { qerrors } = require('qerrors'); // error logger
const { isValidObject, isValidExpressResponse } = require('./input-validation'); // response object validators

/**
 * Send standardized JSON responses
 * 
 * RATIONALE: Centralizes all JSON response logic that was previously duplicated
 * across validation.js and http.js. Ensures consistent response format,
 * proper Content-Type headers, and unified logging across all modules.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use Express's built-in json() method for proper serialization
 * - Log all responses for debugging and monitoring
 * - Keep function simple - no transformation or complex error handling
 * - Validate response object to prevent runtime errors
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 400, 500, etc.)
 * @param {object} data - Response data to be JSON-serialized
 */
function sendJsonResponse(res, statusCode, data) {
  console.log(`sendJsonResponse is sending ${statusCode} with`, data);
  
  // Validate response object before attempting to use it
  if (!isValidExpressResponse(res)) {
    qerrors(new Error('Invalid Express response object'), 'sendJsonResponse', { statusCode, data });
    return; // Cannot send response if res object is invalid
  }
  
  try {
    res.status(statusCode).json(data);
  } catch (error) {
    qerrors(error, 'sendJsonResponse', { statusCode, data });
    // If JSON serialization fails, try to send a basic error response
    try {
      res.status(500).json({ error: 'Response serialization failed' });
    } catch (fallbackError) {
      qerrors(fallbackError, 'sendJsonResponse_fallback', { statusCode, data });
    }
  }
}

/**
 * Send standardized validation error responses
 * 
 * RATIONALE: Consolidates the validation error pattern that was duplicated
 * in validation.js. Provides consistent error format for all validation
 * failures across the application.
 * 
 * DESIGN DECISIONS:
 * - Use 400 as default status for validation errors (client error)
 * - Allow additional data to be included for detailed error information
 * - Validate response object before attempting to send
 * - Use sendJsonResponse for consistency with other response types
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message describing the validation failure
 * @param {object} additionalData - Optional additional data (missing fields, etc.)
 * @param {number} statusCode - HTTP status code (defaults to 400)
 */
function sendValidationError(res, message, additionalData = {}, statusCode = 400) {
  console.log(`sendValidationError is sending ${statusCode} with message: ${message}`);
  
  if (!isValidExpressResponse(res)) {
    qerrors(new Error('Invalid Express response object'), 'sendValidationError', { message, additionalData, statusCode });
    return;
  }
  
  const errorResponse = { error: message, ...additionalData };
  sendJsonResponse(res, statusCode, errorResponse);
}

/**
 * Send standardized authentication error responses
 * 
 * RATIONALE: Provides consistent authentication error handling that can be
 * used across auth.js and other modules that need to handle authentication
 * failures. Centralizes the 401 response pattern.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Always use 401 status code for authentication errors (vs 403 forbidden)
 * - Default to generic message to avoid revealing authentication internals
 * - Log authentication failures for security monitoring
 * - Use consistent error response format across all authentication points
 * 
 * SECURITY CONSIDERATIONS:
 * - Generic error messages prevent authentication mechanism disclosure
 * - 401 status triggers browser authentication prompts where appropriate
 * - Consistent responses prevent timing-based user enumeration attacks
 * 
 * @param {object} res - Express response object
 * @param {string} message - Authentication error message (defaults to generic message)
 */
function sendAuthError(res, message = 'Authentication required') {
  console.log(`sendAuthError is sending 401 with message: ${message}`); // Log for security monitoring
  sendJsonResponse(res, 401, { error: message });
}

/**
 * Send standardized server error responses
 * 
 * RATIONALE: Provides consistent 500 error handling across all modules.
 * Prevents sensitive error information from leaking to clients while
 * ensuring proper error logging for debugging.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Always use 500 status code for internal server errors
 * - Send generic message to client, log detailed error internally
 * - Accept optional error object and context for comprehensive logging
 * - Use qerrors for structured error logging when available
 * 
 * SECURITY CONSIDERATIONS:
 * - Never expose internal error details to clients (stack traces, file paths)
 * - Log full error context for debugging without client exposure
 * - Generic error messages prevent information disclosure attacks
 * - Detailed logging enables effective debugging without security risks
 * 
 * ERROR LOGGING STRATEGY:
 * - Public message: Generic, safe for client consumption
 * - Internal logging: Detailed error object, context, and stack traces
 * - Structured logging: Consistent format for log analysis and monitoring
 * 
 * @param {object} res - Express response object
 * @param {string} message - Public error message (defaults to generic message for security)
 * @param {Error} error - Original error object for internal logging
 * @param {string} context - Context information for debugging (function name, operation, etc.)
 */
function sendServerError(res, message = 'Internal server error', error = null, context = null) {
  console.log(`sendServerError is sending 500 with message: ${message}`); // Log public response
  
  // Log detailed error information for debugging (internal only)
  // This provides developers with full context while keeping client responses generic
  if (error) {
    qerrors(error, 'sendServerError', { message, context }); // Structured error logging
  }
  
  // Send generic error response to client (never expose internal details)
  sendJsonResponse(res, 500, { error: message });
}

/*
 * Module Export Strategy:
 * 
 * Export all response utility functions to provide a complete toolkit for
 * standardized response handling across the application. Each function
 * serves a specific response pattern:
 * 
 * - sendJsonResponse: General JSON responses
 * - sendValidationError: 400 validation errors
 * - sendAuthError: 401 authentication errors  
 * - sendServerError: 500 internal server errors
 * 
 * This covers the most common response patterns used throughout the codebase.
 */
module.exports = {
  sendJsonResponse, // export general JSON response
  sendValidationError, // export 400 error helper
  sendAuthError, // export 401 response helper
  sendServerError // export 500 response helper
};

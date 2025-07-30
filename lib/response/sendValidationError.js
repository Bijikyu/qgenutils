/**
 * Send Standardized Validation Error Response
 * 
 * RATIONALE: Validation failures need consistent error responses across all
 * API endpoints. This utility standardizes validation error format and
 * status codes, improving client integration and debugging experience.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use 400 status code for client-side validation errors
 * - Provide structured error format with clear message
 * - Allow additional validation details (missing fields, constraints)
 * - Validate Express response object before attempting to send
 * - Log validation errors for debugging and monitoring
 * 
 * ERROR RESPONSE FORMAT:
 * {
 *   "error": "Primary error message",
 *   "details": "Additional error details",
 *   "missingFields": ["field1", "field2"],
 *   "constraintViolations": {...}
 * }
 * 
 * STATUS CODE STRATEGY:
 * - 400 Bad Request: Client sent invalid data (default)
 * - 422 Unprocessable Entity: Data format valid but semantically incorrect
 * - Custom codes: Allow override for specific validation scenarios
 * 
 * @param {object} res - Express response object
 * @param {string} message - Primary error message describing validation failure
 * @param {object} additionalData - Optional validation details (missing fields, etc.)
 * @param {number} statusCode - HTTP status code (defaults to 400)
 * @returns {object} Express response object for method chaining
 * @throws Never throws - handles all errors gracefully
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');

function sendValidationError(res, message, additionalData = {}, statusCode = 400) {
  console.log(`sendValidationError sending ${statusCode} response: ${message}`);
  logger.debug('sendValidationError: preparing validation error response', {
    message,
    statusCode,
    hasAdditionalData: !!additionalData && Object.keys(additionalData).length > 0,
    additionalDataKeys: additionalData ? Object.keys(additionalData) : []
  });

  try {
    // Validate Express response object
    if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
      console.error('sendValidationError: invalid Express response object');
      qerrors(new Error('Invalid Express response object'), 'sendValidationError', {
        message,
        additionalData,
        statusCode,
        hasRes: !!res,
        hasStatus: res && typeof res.status === 'function',
        hasJson: res && typeof res.json === 'function'
      });
      logger.error('sendValidationError: invalid response object', {
        message,
        hasRes: !!res,
        hasRequiredMethods: res && typeof res.status === 'function' && typeof res.json === 'function'
      });
      return null;
    }

    // Validate message parameter
    if (!message || typeof message !== 'string') {
      console.warn('sendValidationError: invalid or missing error message');
      logger.warn('sendValidationError: invalid message provided', {
        message,
        messageType: typeof message
      });
      message = 'Validation failed'; // Default message for invalid input
    }

    // Validate status code
    if (typeof statusCode !== 'number' || statusCode < 400 || statusCode >= 500) {
      console.warn(`sendValidationError: invalid status code ${statusCode}, using 400`);
      logger.warn('sendValidationError: invalid status code provided', {
        providedStatusCode: statusCode,
        statusCodeType: typeof statusCode
      });
      statusCode = 400; // Default to Bad Request for invalid codes
    }

    // Validate and normalize additional data
    if (additionalData && typeof additionalData !== 'object') {
      console.warn('sendValidationError: invalid additionalData type, using empty object');
      logger.warn('sendValidationError: invalid additional data type', {
        additionalDataType: typeof additionalData
      });
      additionalData = {};
    }

    if (additionalData === null || additionalData === undefined) {
      additionalData = {};
    }

    // Handle arrays as invalid additional data
    if (Array.isArray(additionalData)) {
      console.warn('sendValidationError: array provided as additional data, converting to object');
      logger.warn('sendValidationError: array converted to object for additional data');
      additionalData = { details: additionalData };
    }

    // Build error response object
    const errorResponse = {
      error: message,
      ...additionalData
    };

    // Attempt to send response
    const result = res.status(statusCode).json(errorResponse);

    console.log(`sendValidationError: successfully sent ${statusCode} validation error`);
    logger.debug('sendValidationError: response sent successfully', {
      statusCode,
      message,
      responseSize: JSON.stringify(errorResponse).length
    });

    return result;

  } catch (error) {
    // Handle any unexpected errors during response sending
    console.error('sendValidationError encountered unexpected error:', error.message);
    qerrors(error, 'sendValidationError', {
      message,
      additionalData,
      statusCode,
      errorMessage: error.message
    });
    logger.error('sendValidationError failed with error', {
      error: error.message,
      message,
      statusCode,
      stack: error.stack
    });

    // Attempt emergency fallback response
    try {
      if (res && typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Unable to send validation error response'
        });
      }
    } catch (fallbackError) {
      console.error('sendValidationError: fallback response also failed:', fallbackError.message);
      qerrors(fallbackError, 'sendValidationError-fallback');
    }

    return null;
  }
}

module.exports = sendValidationError;
/**
 * Send Standardized JSON Response
 * 
 * RATIONALE: API consistency requires standardized response formats across all endpoints.
 * This utility ensures consistent JSON structure, proper HTTP status codes, and
 * appropriate headers for all API responses, improving client integration and debugging.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Validate response object to prevent undefined/null responses
 * - Set appropriate Content-Type headers for JSON responses
 * - Handle Express.js response object validation
 * - Provide error recovery for malformed response data
 * - Log response details for debugging and monitoring
 * 
 * RESPONSE FORMAT STANDARDIZATION:
 * - Always returns valid JSON (never plain text or HTML)
 * - Consistent status code setting before sending response
 * - Proper Content-Type header for JSON responses
 * - Handles both success and error response patterns
 * 
 * ERROR HANDLING:
 * - Validates Express response object before use
 * - Handles JSON serialization errors gracefully
 * - Provides fallback responses for invalid data
 * - Logs all response operations for troubleshooting
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, 400, 500, etc.)
 * @param {any} data - Response data to send (will be JSON.stringify'd)
 * @returns {object} Express response object for method chaining
 * @throws Never throws - handles all errors gracefully with fallback responses
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');

function sendJsonResponse(res, statusCode, data) {
  console.log(`sendJsonResponse sending ${statusCode} response`);
  logger.debug('sendJsonResponse preparing response', { 
    statusCode, 
    dataType: typeof data,
    hasData: data !== null && data !== undefined
  });

  try {
    // Validate Express response object
    if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
      console.error('sendJsonResponse received invalid response object');
      qerrors(new Error('Invalid response object provided'), 'sendJsonResponse', {
        hasRes: !!res,
        resType: typeof res,
        hasStatus: res && typeof res.status === 'function',
        hasJson: res && typeof res.json === 'function'
      });
      
      // Cannot send response without valid res object
      return null;
    }

    // Validate status code
    if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
      console.warn(`sendJsonResponse received invalid status code: ${statusCode}, defaulting to 500`);
      logger.warn('sendJsonResponse: invalid status code provided', { 
        providedStatusCode: statusCode,
        statusCodeType: typeof statusCode
      });
      statusCode = 500; // Default to internal server error for invalid codes
    }

    // Handle undefined/null data gracefully
    if (data === undefined) {
      console.log('sendJsonResponse: data is undefined, sending empty object');
      logger.debug('sendJsonResponse: undefined data converted to empty object');
      data = {};
    }

    if (data === null) {
      console.log('sendJsonResponse: data is null, preserving null value');
      logger.debug('sendJsonResponse: null data preserved');
    }

    // Attempt to serialize data to catch any JSON issues early
    try {
      JSON.stringify(data);
    } catch (serializationError) {
      console.error('sendJsonResponse: data serialization failed, sending error response');
      qerrors(serializationError, 'sendJsonResponse-serialization', { 
        dataType: typeof data,
        statusCode 
      });
      logger.error('sendJsonResponse: JSON serialization failed', { 
        error: serializationError.message,
        dataType: typeof data
      });
      
      // Send error response for unserializable data
      data = {
        error: 'Internal server error',
        message: 'Response data could not be serialized'
      };
      statusCode = 500;
    }

    // Set status code and send JSON response
    const result = res.status(statusCode).json(data);
    
    console.log(`sendJsonResponse successfully sent ${statusCode} response`);
    logger.debug('sendJsonResponse: response sent successfully', { 
      statusCode,
      responseSize: JSON.stringify(data).length
    });
    
    return result;

  } catch (error) {
    // Handle any unexpected errors during response sending
    console.error('sendJsonResponse encountered unexpected error:', error.message);
    qerrors(error, 'sendJsonResponse', { 
      statusCode, 
      dataType: typeof data,
      errorMessage: error.message
    });
    logger.error('sendJsonResponse failed with error', { 
      error: error.message,
      statusCode,
      stack: error.stack
    });

    // Attempt emergency fallback response
    try {
      if (res && typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Unable to send response'
        });
      }
    } catch (fallbackError) {
      console.error('sendJsonResponse: fallback response also failed:', fallbackError.message);
      qerrors(fallbackError, 'sendJsonResponse-fallback');
    }

    return null;
  }
}

module.exports = sendJsonResponse;
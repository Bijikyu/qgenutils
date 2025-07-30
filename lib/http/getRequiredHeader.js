/**
 * Extract and Validate Required HTTP Headers
 * 
 * RATIONALE: Many API operations require specific headers (authorization, content-type,
 * custom API keys). This function centralizes the pattern of "get header or return error"
 * to avoid repetitive code throughout the application.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use optional chaining (?.) to safely access headers even if undefined
 * - Return null to indicate failure (allows caller to handle appropriately)
 * - Send error response immediately (fail-fast approach)
 * - Use provided error message for custom error descriptions
 * 
 * ERROR HANDLING STRATEGY:
 * When a required header is missing, we immediately send an error response
 * rather than throwing an exception. This prevents the request from continuing
 * with invalid state and provides clear feedback to the client.
 * 
 * WHY OPTIONAL CHAINING:
 * In some edge cases, req.headers might be undefined or malformed.
 * Optional chaining prevents "Cannot read property of undefined" errors.
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} headerName - Name of the required header (case-insensitive)
 * @param {number} statusCode - Status code to send if header is missing
 * @param {string} errorMessage - Error message to send if header is missing
 * @returns {string|null} The header value or null if missing/error
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');
const sendJsonResponse = require('../response/sendJsonResponse');

function getRequiredHeader(req, res, headerName, statusCode, errorMessage) {
  const normalizedName = typeof headerName === 'string' ? headerName.toLowerCase() : '';
  console.log(`getRequiredHeader is running with ${normalizedName}`);
  logger.debug(`getRequiredHeader is running with ${normalizedName}`);
  
  try {
    // Safely access header value even if headers object is undefined
    // Express normalizes header names to lowercase, so this handles case variations
    const headerValue = req?.headers?.[normalizedName];

    if (!headerValue) {
      // Send appropriate error response based on status code
      if (statusCode === 401) {
        // For auth errors, use a more appropriate function if available
        sendJsonResponse(res, statusCode, { error: errorMessage });
      } else {
        sendJsonResponse(res, statusCode, { error: errorMessage });
      }
      console.log(`getRequiredHeader is returning null due to missing header`);
      logger.debug(`getRequiredHeader is returning null due to missing header`);
      return null;
    }

    console.log(`getRequiredHeader is returning ${headerValue}`);
    logger.debug(`getRequiredHeader is returning ${headerValue}`);
    return headerValue;
  } catch (error) {
    // Handle unexpected errors in header processing
    qerrors(error, 'getRequiredHeader', { headerName: normalizedName, statusCode, errorMessage });
    sendJsonResponse(res, 500, { error: 'Internal server error' });
    return null;
  }
}

module.exports = getRequiredHeader;
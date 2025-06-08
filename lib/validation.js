
const { sendJsonResponse } = require('./http');

/**
 * Validate required fields in an object
 * @param {object} res - Express response object
 * @param {object} obj - Object to validate
 * @param {string[]} fieldNames - Array of required field names
 * @returns {boolean} True if all fields are present, false otherwise
 */
function requireFields(res, obj, fieldNames) {
  console.log(`requireFields is running with ${fieldNames}`); // Log validation attempt for debugging
  try {
    // Filter to find fields that are missing or falsy
    // This catches undefined, null, empty string, 0, false, etc.
    const missing = fieldNames.filter(name => !obj[name]);

    if (missing.length > 0) {
      // Send detailed error message listing all missing fields
      // This helps developers fix multiple validation issues at once
      sendJsonResponse(res, 400, {
        error: `Missing required fields: ${missing.join(', ')}`
      });
      console.log(`requireFields is returning false`); // Log validation failure
      return false; // Indicate validation failure to caller
    }

    console.log(`requireFields is returning true`); // Log validation success
    return true; // All required fields are present
  } catch (error) {
    // Handle unexpected errors during validation (malformed objects, etc.)
    // Send generic error to client while logging specific error for debugging
    sendJsonResponse(res, 500, { error: 'Validation error' });
    console.log(`requireFields error ${error.message}`); // Log specific error details
    return false; // Treat errors as validation failures for safety
  }
}

module.exports = {
  requireFields
};


/**
 * Field Validation Module
 * 
 * This module provides utilities for validating required fields in request objects.
 * It's designed to handle common API validation scenarios with clear error messaging
 * and consistent response formatting.
 * 
 * The validation approach prioritizes:
 * 1. Clear error messages that list all missing fields at once
 * 2. Consistent HTTP response formatting
 * 3. Fail-safe behavior (errors treated as validation failures)
 * 4. Developer-friendly debugging information
 */

const { sendJsonResponse } = require('./http');

/**
 * Validate required fields in an object
 * 
 * This function checks that all required fields are present and truthy in an object,
 * typically used for validating API request payloads. It follows a fail-fast approach
 * while providing comprehensive error messages.
 * 
 * Rationale for validation approach:
 * 1. Uses falsy check (!obj[name]) to catch undefined, null, empty string, 0, false
 * 2. Lists ALL missing fields in error message (not just first one found)
 * 3. Returns boolean to allow caller to decide what to do after validation
 * 4. Sends HTTP response immediately on failure for API convenience
 * 5. Treats any unexpected errors as validation failures for security
 * 
 * Why falsy checking matters:
 * - Catches undefined (field not provided)
 * - Catches null (field explicitly set to null)  
 * - Catches empty string (user left field blank)
 * - Catches 0 (could be unintentional for required numeric fields)
 * - Catches false (could be unintentional for required boolean fields)
 * 
 * Error messaging strategy:
 * - Lists all missing fields to help developers fix multiple issues at once
 * - Uses clear, actionable language ("Missing required fields: name, email")
 * - Provides specific field names to avoid guessing
 * - Returns 400 Bad Request (client error) for missing fields
 * - Returns 500 Internal Server Error for unexpected validation errors
 * 
 * Usage pattern:
 * if (!requireFields(res, req.body, ['name', 'email'])) return;
 * // Continue processing knowing all fields are present
 * 
 * @param {object} res - Express response object for sending error responses
 * @param {object} obj - Object to validate (typically req.body or req.query)
 * @param {string[]} fieldNames - Array of required field names to check
 * @returns {boolean} True if all fields are present and truthy, false otherwise
 */
function requireFields(res, obj, fieldNames) {
  console.log(`requireFields is running with ${fieldNames}`); // Log validation attempt for API debugging
  try {
    // Find all fields that are missing or falsy
    // Using filter() creates an array of all missing fields for comprehensive error messaging
    // The !obj[name] check catches undefined, null, empty string, 0, false, etc.
    const missing = fieldNames.filter(name => !obj[name]);

    // If any fields are missing, send detailed error response
    if (missing.length > 0) {
      // List all missing fields in the error message so developers can fix multiple issues at once
      // Using join(', ') creates readable comma-separated list
      sendJsonResponse(res, 400, {
        error: `Missing required fields: ${missing.join(', ')}`
      });
      console.log(`requireFields is returning false`); // Log validation failure for debugging
      return false; // Signal validation failure to caller
    }

    console.log(`requireFields is returning true`); // Log validation success for debugging
    return true; // All required fields are present and truthy
  } catch (error) {
    // Handle unexpected errors during validation (e.g., obj is not an object, fieldNames malformed)
    // Send generic error to client to avoid leaking internal details
    sendJsonResponse(res, 500, { error: 'Validation error' });
    console.log(`requireFields error ${error.message}`); // Log specific error for debugging
    return false; // Treat any errors as validation failures for fail-safe behavior
  }
}

module.exports = {
  requireFields
};

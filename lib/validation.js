
/*
 * Validation Utility Module
 * 
 * This module provides field validation utilities for API endpoints that need to
 * verify required fields are present and properly formatted before processing.
 * 
 * DESIGN PHILOSOPHY:
 * - Fail fast: Return detailed errors immediately when validation fails
 * - Developer friendly: List all missing fields at once (not just the first)
 * - Consistent responses: Use standardized error format across all endpoints
 * - Security minded: Validate input thoroughly before any processing
 * 
 * COMMON USE CASES:
 * - API endpoint parameter validation
 * - Form submission verification
 * - Database input sanitization
 * - User registration field checking
 */

const { sendJsonResponse } = require('./http');

/**
 * Validate required fields in an object
 * 
 * RATIONALE: API endpoints often require specific fields to be present before
 * processing can continue. Rather than checking each field individually with
 * repetitive if statements, this function centralizes the validation logic
 * and provides consistent error responses.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use filter() to collect ALL missing fields, not just the first one
 * - Treat falsy values (null, '', 0, false) as "missing" for strict validation
 * - Return boolean to indicate success/failure to calling code
 * - Send error response immediately rather than throwing exceptions
 * 
 * WHY FALSY VALUE CHECKING:
 * We check !obj[name] which catches:
 * - undefined (field not present)
 * - null (explicitly set to null)
 * - '' (empty string)
 * - 0 (zero number - might be valid in some contexts)
 * - false (boolean false - might be valid in some contexts)
 * 
 * This is intentionally strict. If 0 or false are valid values for your use case,
 * use a different validation approach or modify the logic here.
 * 
 * DEVELOPER EXPERIENCE BENEFITS:
 * - Lists ALL missing fields in one response (saves round trips)
 * - Clear error messages that specify exactly what's missing
 * - Consistent error format across all API endpoints
 * - Debugging logs show validation attempts and results
 * 
 * ALTERNATIVE APPROACHES CONSIDERED:
 * - Schema validation libraries (Joi, Yup) - rejected for simplicity
 * - Throwing exceptions - rejected to avoid try/catch boilerplate
 * - Individual field checks - rejected to reduce code duplication
 * 
 * @param {object} res - Express response object for sending error responses
 * @param {object} obj - Object to validate (typically req.body or req.query)
 * @param {string[]} fieldNames - Array of required field names to check
 * @returns {boolean} True if all fields are present and truthy, false otherwise
 */
function requireFields(res, obj, fieldNames) {
  console.log(`requireFields is running with ${fieldNames}`); // Log validation attempt for debugging API issues
  try {
    // Filter to find fields that are missing or falsy
    // This catches undefined, null, empty string, 0, false, etc.
    // Array.filter() creates a new array with only the elements that pass the test
    const missing = fieldNames.filter(name => !obj[name]);

    if (missing.length > 0) {
      // Send detailed error message listing all missing fields
      // This helps developers fix multiple validation issues at once rather than
      // discovering them one at a time through multiple API calls
      sendJsonResponse(res, 400, {
        error: `Missing required fields: ${missing.join(', ')}`
      });
      console.log(`requireFields is returning false`); // Log validation failure for debugging
      return false; // Indicate validation failure to caller
    }

    console.log(`requireFields is returning true`); // Log validation success
    return true; // All required fields are present and truthy
  } catch (error) {
    // Handle unexpected errors during validation (malformed objects, etc.)
    // This could happen if obj is null/undefined or fieldNames is malformed
    sendJsonResponse(res, 500, { error: 'Validation error' }); // Generic error message to client
    console.log(`requireFields error ${error.message}`); // Log specific error details for debugging
    return false; // Treat any validation errors as failure for safety
  }
}

/*
 * Module Export Strategy:
 * 
 * We export only the requireFields function because:
 * 1. This module has a single, focused responsibility
 * 2. The function encapsulates all the validation logic needed
 * 3. Future validation functions can be added to this module
 * 4. Named export makes the API intention clear
 * 
 * FUTURE ENHANCEMENTS:
 * - Add functions for specific field types (email, phone, etc.)
 * - Add support for custom validation rules
 * - Add support for conditional required fields
 * - Add field format validation (length, regex patterns)
 */
module.exports = {
  requireFields
};

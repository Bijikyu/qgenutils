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

const { qerrors } = require('qerrors');

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
 * - Individual field checking - rejected due to code duplication
 * - Generic validation messages - rejected for poor developer experience
 * 
 * ERROR RESPONSE FORMAT:
 * The error response follows a standard format that client applications can
 * reliably parse:
 * {
 *   "error": "Missing required fields: field1, field2"
 * }
 * 
 * This format allows clients to programmatically detect validation errors
 * and potentially highlight specific missing fields in their UI.
 * 
 * @param {object} res - Express response object for sending error responses
 * @param {object} obj - The object to validate (typically req.body or req.query)
 * @param {Array<string>} requiredFields - Array of field names that must be present and truthy
 * @returns {boolean} True if all fields are present and valid, false if validation failed
 */
function requireFields(obj, requiredFields, res) {
  console.log(`requireFields is running with ${requiredFields ? requiredFields.join(',') : 'undefined'}`); // Log validation attempt with field list
  try {
    // Validate input parameters
    if (!requiredFields || !Array.isArray(requiredFields)) {
      console.log(`requireFields is returning false - invalid requiredFields parameter`);
      if (res && typeof res.status === 'function') {
        res.status(500).json({ error: 'Internal validation error' });
      }
      return false;
    }
    
    if (!obj || typeof obj !== 'object') {
      console.log(`requireFields is returning false - invalid obj parameter`);
      if (res && typeof res.status === 'function') {
        res.status(500).json({ error: 'Internal validation error' });
      }
      return false;
    }

    // Find all fields that are missing or have falsy values
    // Using filter() to collect all issues at once for better user experience
    const missingFields = requiredFields.filter(field => !obj[field]);

    // If any fields are missing, send detailed error response and return false
    if (missingFields.length > 0) {
      // Send standardized error response with detailed field information
      if (res && typeof res.status === 'function') {
        res.status(400).json({
          error: 'Missing required fields',
          missing: missingFields
        });
      }

      console.log(`requireFields is returning false`);
      return false;
    }

    // All required fields are present and truthy
    console.log(`requireFields is returning true`); // Log validation success
    return true; // Signal to calling code that validation passed
  } catch (error) {
    // Handle unexpected errors during validation (malformed objects, etc.)
    qerrors(error, 'requireFields', { requiredFields, obj }); // Log error with context

    // Send generic server error to client (don't expose internal details)
    res.status(500).json({ error: 'Internal validation error' });

    return false; // Default to validation failed for security
  }
}

/*
 * Module Export Strategy:
 * 
 * We export the requireFields function as the primary validation utility.
 * This function covers the most common validation scenario: ensuring required
 * fields are present in request objects.
 * 
 * FUTURE ENHANCEMENTS:
 * - Add type validation (string, number, email format, etc.)
 * - Add length validation (min/max string length, array size)
 * - Add custom validation rules support
 * - Add nested object validation
 * - Add conditional field validation (field X required if field Y is present)
 */
module.exports = {
  requireFields
};
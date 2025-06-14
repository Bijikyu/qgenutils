/*
 * WHY THIS MODULE EXISTS:
 * - Provide a single place for request field validation logic.
 * - Avoid repeated manual checks in multiple Express controllers.
 *
 * MAIN PROBLEMS SOLVED:
 * - Ensures consistent error messaging when required fields are missing.
 * - Simplifies controllers by returning boolean success instead of throwing.
 *
 * EXPRESS ASSUMPTIONS:
 * - Functions are called from route handlers with an Express `res` object.
 */
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

const { qerrors } = require('qerrors'); // central error logging integration
const logger = require('./logger'); // structured logger
const { isValidObject } = require('./input-validation'); // utility to validate plain objects
const { sendValidationError, sendServerError } = require('./response-utils'); // unified response helpers

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
* @param {object} obj - The object to validate (typically req.body or req.query) // first param clarifies target object
* @param {Array<string>} requiredFields - Array of field names that must be present and truthy // second param describes required fields
* @param {object} res - Express response object for sending error responses // third param is response object for error handling
 * @returns {boolean} True if all fields are present and valid, false if validation failed
 */
function requireFields(obj, requiredFields, res) {
  console.log(`requireFields is running with ${requiredFields && Array.isArray(requiredFields) ? requiredFields.join(',') : 'undefined'}`); logger.debug(`requireFields is running with ${requiredFields && Array.isArray(requiredFields) ? requiredFields.join(',') : 'undefined'}`); // log invocation with field list
  try { // start validation
    if (!requiredFields || !Array.isArray(requiredFields)) { // verify requiredFields parameter
      console.log(`requireFields is returning false - invalid requiredFields parameter`); logger.debug(`requireFields is returning false - invalid requiredFields parameter`); // trace failure reason
      sendServerError(res, 'Internal validation error'); // consistent 500 response avoids exposing internals
      return false; // stop processing on invalid parameters
    }

    if (!isValidObject(obj)) { // ensure provided object is valid
      console.log(`requireFields is returning false - invalid obj parameter`); logger.debug(`requireFields is returning false - invalid obj parameter`); // trace object validation failure
      sendServerError(res, 'Internal validation error'); // uniform handling keeps client logic simple
      return false; // halt on invalid object
    }

    const missingFields = requiredFields.filter(field => !obj[field]); // collect all missing or falsy fields

    if (missingFields.length > 0) { // if any field is missing respond immediately
      sendValidationError(res, 'Missing required fields', { missing: missingFields }); // detailed failure feedback

      console.log(`requireFields is returning false`); logger.debug(`requireFields is returning false`); // record validation failure
      return false; // signal failed validation
    }

    console.log(`requireFields is returning true`); logger.debug(`requireFields is returning true`); // record successful validation
    return true; // validation passed
  } catch (error) {
    qerrors(error, 'requireFields', { requiredFields, obj }); // central logging preserves stack trace for post-mortem analysis

    sendServerError(res, 'Internal validation error', error, 'requireFields'); // one path for all unexpected issues

    return false; // safe default on error
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
module.exports = { // expose validator for reuse
  requireFields // export main field validator
};
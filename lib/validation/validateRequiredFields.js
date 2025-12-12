/**
 * Validate that all required fields exist in an object, throwing on failure.
 *
 * PURPOSE: Framework-agnostic required field validation that throws on missing
 * fields. Unlike requireFields which is Express-coupled, this function can be
 * used in any context including batch processing, form validation, and testing.
 *
 * VALIDATION RULES:
 * - Field must exist in the object
 * - Field must not be undefined, null, or empty string
 *
 * @param {Record<string, unknown>} obj - Object to validate
 * @param {string[]} requiredFields - Array of field names that must be present
 * @throws {Error} If any required fields are missing or invalid
 */

const isValidObject = require('./isValidObject');

function validateRequiredFields(obj, requiredFields) {
  if (!isValidObject(obj)) {
    throw new Error('Invalid input: must be a plain object');
  }

  if (!Array.isArray(requiredFields) || requiredFields.length === 0) {
    return;
  }

  const missing = requiredFields.filter(field => 
    !(field in obj) || obj[field] === undefined || obj[field] === null || obj[field] === ''
  );

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

module.exports = validateRequiredFields;

/**
 * Validate Required Text Fields with Optional Minimum Length
 * 
 * RATIONALE: Form validation requires consistent handling of required fields
 * with appropriate length validation. This function provides standardized
 * validation for text inputs with customizable minimum length requirements.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Sanitize input to remove potentially dangerous characters
 * - Check for presence and non-empty values after sanitization
 * - Support configurable minimum length requirements
 * - Provide descriptive error messages with field names
 * - Log validation attempts for debugging and monitoring
 * 
 * VALIDATION RULES:
 * - Field must be present (not null/undefined)
 * - Field must be a string type
 * - Field must have content after sanitization and trimming
 * - Field must meet minimum length requirement if specified
 * - Length is measured after trimming whitespace
 * 
 * ERROR MESSAGE PATTERNS:
 * - Missing field: "{fieldName} is required"
 * - Too short: "{fieldName} must be at least {N} character(s) long"
 * - Grammatically correct pluralization for length requirements
 * 
 * @param {string} value - Value to validate
 * @param {string} fieldName - Human-readable field name for error messages
 * @param {number} minLength - Minimum required length (default: 1)
 * @returns {string} Empty string if valid, descriptive error message if invalid
 * @throws Never throws - returns error message on validation failure
 */

const { qerrors } = require('qerrors');
const sanitizeString = require('../utilities/string/sanitizeString');
const isValidString = require('./isValidString');

function validateRequired(value, fieldName, minLength = 1) {
  console.log(`validateRequired is running with value: ${value}, fieldName: ${fieldName}, minLength: ${minLength}`);
  
  if (!isValidString(value)) {
    const errorMsg = `${fieldName} is required`;
    console.log(`validateRequired is returning error: ${errorMsg}`);
    qerrors(new Error('Required field validation failed - missing or invalid input'), 'validateRequired', {
      value,
      fieldName,
      minLength,
      inputType: typeof value,
      errorMsg
    });
    return errorMsg;
  }
  
  const sanitizedValue = sanitizeString(value);
  
  if (!sanitizedValue.trim()) {
    const errorMsg = `${fieldName} is required`;
    console.log(`validateRequired is returning error: ${errorMsg}`);
    qerrors(new Error('Required field validation failed - empty after sanitization'), 'validateRequired', {
      originalValue: value,
      sanitizedValue,
      fieldName,
      minLength,
      errorMsg
    });
    return errorMsg;
  }
  
  if (sanitizedValue.trim().length < minLength) {
    const errorMsg = `${fieldName} must be at least ${minLength} character${minLength === 1 ? '' : 's'} long`;
    console.log(`validateRequired is returning error: ${errorMsg}`);
    qerrors(new Error('Required field validation failed - insufficient length'), 'validateRequired', {
      sanitizedValue,
      fieldName,
      actualLength: sanitizedValue.trim().length,
      minLength,
      errorMsg
    });
    return errorMsg;
  }
  
  console.log(`validateRequired is returning success (empty string)`);
  qerrors(new Error('Required field validation succeeded'), 'validateRequired', {
    sanitizedValue,
    fieldName,
    actualLength: sanitizedValue.trim().length,
    minLength
  });
  
  return ""; // Empty string indicates successful validation
}

module.exports = validateRequired;
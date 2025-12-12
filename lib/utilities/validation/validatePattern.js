'use strict';

/**
 * Validates that a field matches a regex pattern
 * @param {string} value - Value to validate
 * @param {RegExp} pattern - Regex pattern to match
 * @param {string} fieldName - Name of field for error messages
 * @param {string} [customMessage] - Custom error message
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validatePattern('ABC123', /^[A-Z0-9]+$/, 'code'); // null
 */
function validatePattern(value, pattern, fieldName, customMessage) { // check value matches pattern
  if (typeof value !== 'string') { // must be string
    return {
      error: `${fieldName || 'Value'} must be a string`
    };
  }

  if (!(pattern instanceof RegExp)) { // pattern must be regex
    throw new Error('Pattern must be a RegExp');
  }

  if (!pattern.test(value)) { // pattern doesn't match
    return {
      error: customMessage || `${fieldName || 'Value'} format is invalid`
    };
  }

  return null; // valid
}

module.exports = validatePattern;

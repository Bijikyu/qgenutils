'use strict';

/**
 * Validates string length is within bounds
 * @param {string} value - String value to validate
 * @param {number} minLength - Minimum allowed length
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateStringLength('hello', 1, 100, 'name'); // null
 */
function validateStringLength(value, minLength, maxLength, fieldName) { // check string length
  if (typeof value !== 'string') { // must be string
    return {
      error: `${fieldName || 'Value'} must be a string`
    };
  }

  if (value.length < minLength) { // too short
    return {
      error: `${fieldName || 'Value'} must be at least ${minLength} characters long`
    };
  }

  if (value.length > maxLength) { // too long
    return {
      error: `${fieldName || 'Value'} must be no more than ${maxLength} characters long`
    };
  }

  return null; // valid
}

module.exports = validateStringLength;

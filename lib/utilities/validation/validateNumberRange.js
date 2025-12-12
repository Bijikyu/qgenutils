'use strict';

/**
 * Validates numeric value is within range
 * @param {number} value - Numeric value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateNumberRange(50, 1, 100, 'quantity'); // null
 * validateNumberRange(150, 1, 100, 'quantity'); // { error: '...' }
 */
function validateNumberRange(value, min, max, fieldName) { // check number is in range
  const numValue = Number(value); // convert to number

  if (isNaN(numValue)) { // not a valid number
    return {
      error: `${fieldName || 'Value'} must be a number`
    };
  }

  if (numValue < min || numValue > max) { // out of range
    return {
      error: `${fieldName || 'Value'} must be between ${min} and ${max}`
    };
  }

  return null; // valid
}

module.exports = validateNumberRange;

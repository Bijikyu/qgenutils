'use strict';

/**
 * Validates that a value is in allowed enum values
 * @param {*} value - Value to validate
 * @param {Array} validValues - Array of valid values
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string, validOptions: Array}|null} Validation error or null if valid
 * @example
 * validateEnum('pending', ['pending', 'active', 'inactive'], 'status');
 */
function validateEnum(value, validValues, fieldName) { // check value is in allowed list
  if (!Array.isArray(validValues)) { // validate validValues
    throw new Error('validValues must be an array');
  }

  if (validValues.includes(value)) { // value is valid
    return null;
  }

  return { // value not in allowed list
    error: `Invalid ${fieldName || 'value'}`,
    validOptions: validValues
  };
}

module.exports = validateEnum;

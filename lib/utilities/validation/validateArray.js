'use strict';

/**
 * Validates array length is within bounds
 * @param {*} value - Value to validate as array
 * @param {number} [minLength=0] - Minimum array length
 * @param {number} [maxLength=Infinity] - Maximum array length
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateArray([1, 2, 3], 1, 10, 'items'); // null
 */
function validateArray(value, minLength = 0, maxLength = Infinity, fieldName) { // check array bounds
  if (!Array.isArray(value)) { // must be array
    return {
      error: `${fieldName || 'Value'} must be an array`
    };
  }

  if (value.length < minLength) { // too few items
    return {
      error: `${fieldName || 'Value'} must contain at least ${minLength} items`
    };
  }

  if (value.length > maxLength) { // too many items
    return {
      error: `${fieldName || 'Value'} must contain no more than ${maxLength} items`
    };
  }

  return null; // valid
}

module.exports = validateArray;

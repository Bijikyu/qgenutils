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
const validateArray = (value: any, minLength: any = 0, maxLength: any = Infinity, fieldName: any): any => { // check array bounds
  if (!Array.isArray(value)) return {
    error: `${fieldName || 'Value'} must be an array`
  };

  if (value.length < minLength) return {
    error: `${fieldName || 'Value'} must contain at least ${minLength} items`
  };

  if (value.length > maxLength) {
    return {
      error: `${fieldName || 'Value'} must contain at most ${maxLength} items`
    };
  }

  return null;
};

export default validateArray;

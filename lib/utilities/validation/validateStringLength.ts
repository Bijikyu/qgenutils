'use strict';

import validator from 'validator';

/**
 * Validates string length is within bounds using validator.isLength()
 * @param {string} value - String value to validate
 * @param {number} minLength - Minimum allowed length
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateStringLength('hello', 1, 100, 'name'); // null
 */
function validateStringLength(value: any, minLength: number, maxLength: number, fieldName?: string) {
  if (typeof value !== 'string') {
    return {
      error: `${fieldName || 'Value'} must be a string`
    };
  }

  if (!validator.isLength(value, { min: minLength, max: maxLength })) {
    // Determine specific error based on actual length
    if (value.length < minLength) {
      return {
        error: `${fieldName || 'Value'} must be at least ${minLength} characters long`
      };
    } else {
      return {
        error: `${fieldName || 'Value'} must be no more than ${maxLength} characters long`
      };
    }
  }

  return null;
}

export default validateStringLength;

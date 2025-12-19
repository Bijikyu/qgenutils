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
const validatePattern = (value: any, pattern: any, fieldName: any, customMessage: any): any => { // check value matches pattern
  if (typeof value !== 'string') return {
    error: `${fieldName || 'Value'} must be a string`
  };

  if (!(pattern instanceof RegExp)) throw new Error('Pattern must be a RegExp');

  if (!pattern.test(value)) {
    return {
      error: customMessage || `${fieldName || 'Value'} does not match required pattern`
    };
  }

  return null;
};

export default validatePattern;

/**
 * Advanced type detection and validation utilities
 */

import { isString } from './stringValidators';
import { isNumber } from './numberValidators';
import { isArray } from './arrayValidators';
import { isObject } from './objectValidators';
import { isDate } from './primitiveValidators';

/**
 * Gets type of a value in a more detailed way than typeof
 * @param {*} value - Value to check
 * @returns {string} Detailed type string
 */
function getDetailedType(value) {
  if (value === null) return `null`;
  if (value === undefined) return `undefined`;
  if (Array.isArray(value)) return `array`;
  if (value instanceof Date) return `date`;
  if (value instanceof RegExp) return `regexp`;
  if (value instanceof Error) return `error`;
  return typeof value;
}

/**
 * Validates type against multiple allowed types
 * @param {*} value - Value to validate
 * @param {Array} allowedTypes - Array of allowed type strings
 * @returns {boolean} True if value matches any allowed type
 */
function isValidType(value, allowedTypes) {
  const actualType: any = getDetailedType(value);
  return allowedTypes.includes(actualType);
}

/**
 * Creates a type validator function
 * @param {string|Array} type - Type(s) to validate against
 * @param {Object} options - Validation options
 * @returns {Function} Validator function
 */
function createTypeValidator(type, options = {}) {
  const allowedTypes: any = Array.isArray(type) ? type : [type];
  
  return function(value, customOptions = {}) {
    const mergedOptions: any = { ...options, ...customOptions };
    const actualType: any = getDetailedType(value);
    
    if (!allowedTypes.includes(actualType)) {
      return {
        valid: false,
        actualType,
        expectedTypes: allowedTypes
      };
    }
    
    // Additional type-specific validation
    switch (actualType) {
      case `string`:
        return {
          valid: isString(value, mergedOptions),
          value
        };
      case `number`:
        return {
          valid: isNumber(value, mergedOptions),
          value
        };
      case `array`:
        return {
          valid: isArray(value, mergedOptions),
          value
        };
      case `object`:
        return {
          valid: isObject(value, mergedOptions),
          value
        };
      case `date`:
        return {
          valid: isDate(value, mergedOptions),
          value
        };
      default:
        return {
          valid: true,
          value
        };
    }
  };
}

export default {
  getDetailedType,
  isValidType,
  createTypeValidator
};
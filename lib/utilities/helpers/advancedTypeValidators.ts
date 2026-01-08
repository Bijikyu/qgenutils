/**
 * Advanced type detection and validation utilities
 */

import stringValidators from './stringValidators.js';
import numberValidators from './numberValidators.js';
import arrayValidators from './arrayValidators.js';
import objectValidators from './objectValidators.js';
import primitiveValidators from './primitiveValidators.js';

/**
 * Gets type of a value in a more detailed way than typeof
 * @param {*} value - Value to check
 * @returns {string} Detailed type string
 */
function getDetailedType(value: any): string {
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
function isValidType(value: any, allowedTypes: string[]): boolean {
  const actualType: any = getDetailedType(value);
  return allowedTypes.includes(actualType);
}

/**
 * Creates a type validator function
 * @param {string|Array} type - Type(s) to validate against
 * @param {Object} options - Validation options
 * @returns {Function} Validator function
 */
function createTypeValidator(type: string | string[], options: Record<string, any> = {}) {
  const allowedTypes: string[] = Array.isArray(type) ? type : [type];
  
  return function(value: any, customOptions: Record<string, any> = {}) {
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
          valid: stringValidators.isString(value, mergedOptions),
          value
        };
      case `number`:
        return {
          valid: numberValidators.isNumber(value, mergedOptions),
          value
        };
      case `array`:
        return {
          valid: arrayValidators.isArray(value, mergedOptions),
          value
        };
      case `object`:
        return {
          valid: objectValidators.isObject(value, mergedOptions),
          value
        };
      case `date`:
        return {
          valid: primitiveValidators.isDate(value, mergedOptions),
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

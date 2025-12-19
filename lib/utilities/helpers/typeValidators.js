/**
 * Type validation utilities for common type checking patterns
 */

/**
 * Checks if a value is null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} True if value is null or undefined
 */
function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * Checks if a value is NOT null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} True if value is not null or undefined
 */
function isNotNullOrUndefined(value) {
  return value !== null && value !== undefined;
}

/**
 * Checks if a value is a string
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowEmpty - Whether empty strings are allowed
 * @param {boolean} options.allowWhitespaceOnly - Whether whitespace-only strings are allowed
 * @returns {boolean} True if value is a valid string
 */
function isString(value, options = {}) {
  const { allowEmpty = true, allowWhitespaceOnly = false } = options;
  
  if (typeof value !== 'string') {
    return false;
  }
  
  if (!allowEmpty && value === '') {
    return false;
  }
  
  if (!allowWhitespaceOnly && value.trim() === '') {
    return false;
  }
  
  return true;
}

/**
 * Checks if a value is a number
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowNaN - Whether NaN is allowed
 * @param {boolean} options.allowInfinity - Whether Infinity is allowed
 * @returns {boolean} True if value is a valid number
 */
function isNumber(value, options = {}) {
  const { allowNaN = false, allowInfinity = false } = options;
  
  if (typeof value !== 'number') {
    return false;
  }
  
  if (!allowNaN && isNaN(value)) {
    return false;
  }
  
  if (!allowInfinity && (value === Infinity || value === -Infinity)) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a value is a boolean
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a boolean
 */
function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is an array
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowEmpty - Whether empty arrays are allowed
 * @param {number} options.minLength - Minimum array length
 * @param {number} options.maxLength - Maximum array length
 * @returns {boolean} True if value is a valid array
 */
function isArray(value, options = {}) {
  const { allowEmpty = true, minLength = null, maxLength = null } = options;
  
  if (!Array.isArray(value)) {
    return false;
  }
  
  if (!allowEmpty && value.length === 0) {
    return false;
  }
  
  if (minLength !== null && value.length < minLength) {
    return false;
  }
  
  if (maxLength !== null && value.length > maxLength) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a value is an object (excluding arrays)
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowEmpty - Whether empty objects are allowed
 * @param {boolean} options.allowArray - Whether arrays should be considered objects
 * @returns {boolean} True if value is a valid object
 */
function isObject(value, options = {}) {
  const { allowEmpty = true, allowArray = false } = options;
  
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  if (!allowArray && Array.isArray(value)) {
    return false;
  }
  
  if (value !== null && !allowEmpty && Object.keys(value).length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a value is a function
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a function
 */
function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Checks if a value is a Date object
 * @param {*} value - Value to check
 * @param {boolean} options.allowInvalid - Whether invalid dates are allowed
 * @returns {boolean} True if value is a valid Date
 */
function isDate(value, options = {}) {
  const { allowInvalid = false } = options;
  
  if (!(value instanceof Date)) {
    return false;
  }
  
  if (!allowInvalid && isNaN(value.getTime())) {
    return false;
  }
  
  return true;
}

/**
 * Gets the type of a value in a more detailed way than typeof
 * @param {*} value - Value to check
 * @returns {string} Detailed type string
 */
function getDetailedType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regexp';
  if (value instanceof Error) return 'error';
  return typeof value;
}

/**
 * Validates type against multiple allowed types
 * @param {*} value - Value to validate
 * @param {Array} allowedTypes - Array of allowed type strings
 * @returns {boolean} True if value matches any allowed type
 */
function isValidType(value, allowedTypes) {
  const actualType = getDetailedType(value);
  return allowedTypes.includes(actualType);
}

/**
 * Creates a type validator function
 * @param {string|Array} type - Type(s) to validate against
 * @param {Object} options - Validation options
 * @returns {Function} Validator function
 */
function createTypeValidator(type, options = {}) {
  const allowedTypes = Array.isArray(type) ? type : [type];
  
  return function(value, customOptions = {}) {
    const mergedOptions = { ...options, ...customOptions };
    const actualType = getDetailedType(value);
    
    if (!allowedTypes.includes(actualType)) {
      return {
        valid: false,
        actualType,
        expectedTypes: allowedTypes
      };
    }
    
    // Additional type-specific validation
    switch (actualType) {
      case 'string':
        return {
          valid: isString(value, mergedOptions),
          value
        };
      case 'number':
        return {
          valid: isNumber(value, mergedOptions),
          value
        };
      case 'array':
        return {
          valid: isArray(value, mergedOptions),
          value
        };
      case 'object':
        return {
          valid: isObject(value, mergedOptions),
          value
        };
      case 'date':
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

module.exports = {
  isNullOrUndefined,
  isNotNullOrUndefined,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isDate,
  getDetailedType,
  isValidType,
  createTypeValidator
};
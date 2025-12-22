/**
 * Function and primitive type validation utilities
 */

/**
 * Checks if a value is a function
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a function
 */
function isFunction(value: any): boolean {
  return typeof value === `function`;
}

/**
 * Checks if a value is a boolean
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a boolean
 */
function isBoolean(value: any): boolean {
  return typeof value === `boolean`;
}

/**
 * Checks if a value is a Date object
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowInvalid - Whether invalid dates are allowed
 * @returns {boolean} True if value is a valid Date
 */
function isDate(value: any, options: Record<string, any> = {}): boolean {
  const { allowInvalid = false }: any = options;
  
  if (!(value instanceof Date)) {
    return false;
  }
  
  if (!allowInvalid && isNaN(value.getTime())) {
    return false;
  }
  
  return true;
}

export default {
  isFunction,
  isBoolean,
  isDate
};
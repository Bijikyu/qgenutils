/**
 * Object validation utilities
 */

/**
 * Checks if a value is an object (excluding arrays)
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowEmpty - Whether empty objects are allowed
 * @param {boolean} options.allowArray - Whether arrays should be considered objects
 * @returns {boolean} True if value is a valid object
 */
function isObject(value: any, options: Record<string, any> = {}) {
  const { allowEmpty = true, allowArray = false }: any = options;
  
  if (typeof value !== `object` || value === null) {
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

export default {
  isObject
};
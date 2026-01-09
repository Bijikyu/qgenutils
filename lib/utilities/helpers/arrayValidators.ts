/**
 * Array validation utilities
 */

/**
 * Checks if a value is an array
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowEmpty - Whether empty arrays are allowed
 * @param {number} options.minLength - Minimum array length
 * @param {number} options.maxLength - Maximum array length
 * @returns {boolean} True if value is a valid array
 */
function isArray(value: any, options: Record<string, any> = {}) {
  const { allowEmpty = true, minLength = null, maxLength = null }: any = options;

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

export default {
  isArray
};

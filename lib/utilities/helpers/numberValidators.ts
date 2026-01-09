/**
 * Number validation utilities
 */

/**
 * Checks if a value is a number
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowNaN - Whether NaN is allowed
 * @param {boolean} options.allowInfinity - Whether Infinity is allowed
 * @returns {boolean} True if value is a valid number
 */
function isNumber(value: any, options: Record<string, any> = {}) {
  const { allowNaN = false, allowInfinity = false }: any = options;

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

export default {
  isNumber
};

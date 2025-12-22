/**
 * String validation utilities
 */

/**
 * Checks if a value is a string
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowEmpty - Whether empty strings are allowed
 * @param {boolean} options.allowWhitespaceOnly - Whether whitespace-only strings are allowed
 * @returns {boolean} True if value is a valid string
 */
function isString(value: any, options: Record<string, any> = {}) {
  const { allowEmpty = true, allowWhitespaceOnly = false }: any = options;
  
  if (typeof value !== `string`) {
    return false;
  }
  
  if (!allowEmpty && value === ``) {
    return false;
  }
  
  if (!allowWhitespaceOnly && value.trim() === ``) {
    return false;
  }
  
  return true;
}

export default {
  isString
};
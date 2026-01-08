/**
 * String validation utilities - refactored to use lodash and validator modules
 */

import lodash from 'lodash';
const { isString: lodashIsString } = lodash as any;
import validator from 'validator';

/**
 * Checks if a value is a string using lodash.isString for consistency
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowEmpty - Whether empty strings are allowed
 * @param {boolean} options.allowWhitespaceOnly - Whether whitespace-only strings are allowed
 * @returns {boolean} True if value is a valid string
 */
function isString(value: any, options: Record<string, any> = {}) {
  const { allowEmpty = true, allowWhitespaceOnly = false }: any = options;
  
  // Use lodash.isString for consistent type checking across the codebase
  if (!lodashIsString(value)) {
    return false;
  }
  
  if (!allowEmpty && value === '') {
    return false;
  }
  
  if (!allowWhitespaceOnly && validator.isEmpty(value, { ignore_whitespace: false })) {
    return false;
  }
  
  return true;
}

export default {
  isString
};

/**
 * JSON utility factory for creating customized JSON utilities
 */

import { safeJsonParse } from './jsonParsing';
import { safeJsonStringify } from './jsonStringification';
import { safeDeepClone } from './jsonManipulation';
import { isValidJson } from './jsonParsing';
import { getJsonSize } from './jsonSizeUtils';

/**
 * Creates a JSON utility object with custom defaults
 * @param {Object} defaults - Custom default values
 * @returns {Object} JSON utility object with custom defaults
 */
function createJsonUtils(defaults = {}) {
  const {
    parseDefault = null,
    stringifyDefault = '{}',
    cloneDefault = null
  } = defaults;
  
  return {
    parse: (jsonString, defaultValue = parseDefault) => 
      safeJsonParse(jsonString, defaultValue),
    stringify: (value, defaultValue = stringifyDefault, options = {}) => 
      safeJsonStringify(value, defaultValue, options),
    clone: (value, defaultValue = cloneDefault) => 
      safeDeepClone(value, defaultValue),
    isValid: isValidJson,
    getSize: getJsonSize
  };
}

export default {
  createJsonUtils
};
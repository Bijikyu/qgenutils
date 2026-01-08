/**
 * JSON utility factory for creating customized JSON utilities
 */

import jsonParsing from './jsonParsing.js';
import jsonStringification from './jsonStringification.js';
import jsonManipulation from './jsonManipulation.js';
import jsonSizeUtils from './jsonSizeUtils.js';

/**
 * Creates a JSON utility object with custom defaults
 * @param {Object} defaults - Custom default values
 * @returns {Object} JSON utility object with custom defaults
 */
function createJsonUtils(defaults: Record<string, any> = {}) {
  const {
    parseDefault = null,
    stringifyDefault = '{}',
    cloneDefault = null
  }: Record<string, any> = defaults;
  
  return {
    parse: (jsonString: string, defaultValue = parseDefault) => 
      jsonParsing.safeJsonParse(jsonString, defaultValue),
    stringify: (value: any, defaultValue = stringifyDefault, options = {}) => 
      jsonStringification.safeJsonStringify(value, defaultValue, options),
    clone: (value: any, defaultValue = cloneDefault) => 
      jsonManipulation.safeDeepClone(value, defaultValue),
    isValid: jsonParsing.isValidJson,
    getSize: jsonSizeUtils.getJsonSize
  };
}

export default {
  createJsonUtils
};

/**
 * JSON utility factory for creating customized JSON utilities
 */

const { safeJsonParse } = require('./jsonParsing');
const { safeJsonStringify } = require('./jsonStringification');
const { safeDeepClone } = require('./jsonManipulation');
const { isValidJson } = require('./jsonParsing');
const { getJsonSize } = require('./jsonSizeUtils');

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

module.exports = {
  createJsonUtils
};
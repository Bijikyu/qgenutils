/**
 * Safe JSON utilities for common JSON operations with error handling
 */

/**
 * Safely parses JSON string with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safely stringifies value to JSON with error handling
 * @param {*} value - Value to stringify
 * @param {string} defaultValue - Default value if stringification fails
 * @param {Object} replacerOptions - JSON.stringify options
 * @param {number} replacerOptions.space - Indentation for pretty printing
 * @param {Function|Array} replacerOptions.replacer - JSON replacer function
 * @returns {string} JSON string or default value
 */
function safeJsonStringify(value, defaultValue = '{}', replacerOptions = {}) {
  const { space = null, replacer = null } = replacerOptions;
  
  try {
    if (space !== null || replacer !== null) {
      return JSON.stringify(value, replacer, space);
    }
    return JSON.stringify(value);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safely deep clones an object using JSON
 * @param {*} value - Value to clone
 * @param {*} defaultValue - Default value if cloning fails
 * @returns {*} Deep cloned value or default value
 */
function safeDeepClone(value, defaultValue = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Parses JSON string and validates it against expected type
 * @param {string} jsonString - JSON string to parse
 * @param {string|Array} expectedType - Expected type(s) ('object', 'array', 'string', etc.)
 * @param {*} defaultValue - Default value if validation fails
 * @returns {*} Validated parsed value or default value
 */
function parseAndValidateJson(jsonString, expectedType = 'object', defaultValue = null) {
  const parsed = safeJsonParse(jsonString, defaultValue);
  
  if (parsed === defaultValue) {
    return defaultValue;
  }
  
  const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
  const actualType = Array.isArray(parsed) ? 'array' : typeof parsed;
  
  return expectedTypes.includes(actualType) ? parsed : defaultValue;
}

/**
 * Stringifies value with size limits
 * @param {*} value - Value to stringify
 * @param {number} maxSize - Maximum size in bytes (default: 1MB)
 * @param {*} defaultValue - Default value if size exceeds limit
 * @returns {string} JSON string or default value
 */
function safeJsonStringifyWithSize(value, maxSize = 1024 * 1024, defaultValue = '{}') {
  try {
    const jsonString = JSON.stringify(value);
    return Buffer.byteLength(jsonString, 'utf8') <= maxSize ? jsonString : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Merges multiple JSON objects safely
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object or empty object if merge fails
 */
function safeJsonMerge(...objects) {
  try {
    return objects.reduce((merged, obj) => {
      if (obj && typeof obj === 'object') {
        return { ...merged, ...obj };
      }
      return merged;
    }, {});
  } catch (error) {
    return {};
  }
}

/**
 * Validates if a string is valid JSON
 * @param {string} jsonString - String to validate
 * @returns {boolean} True if string is valid JSON
 */
function isValidJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets JSON string size in bytes
 * @param {string} jsonString - JSON string
 * @returns {number} Size in bytes
 */
function getJsonSize(jsonString) {
  return Buffer.byteLength(jsonString, 'utf8');
}

/**
 * Truncates JSON string to fit within size limit
 * @param {string} jsonString - JSON string to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated JSON string
 */
function truncateJson(jsonString, maxSize) {
  if (getJsonSize(jsonString) <= maxSize) {
    return jsonString;
  }
  
  try {
    // Try to parse and truncate the object
    const parsed = JSON.parse(jsonString);
    return truncateObject(parsed, maxSize);
  } catch (error) {
    // If parsing fails, just truncate the string
    return jsonString.substring(0, Math.max(0, maxSize - 3)) + '...';
  }
}

/**
 * Recursively truncates an object to fit within size limit
 * @param {*} obj - Object to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated JSON string
 */
function truncateObject(obj, maxSize) {
  // Simple truncation: remove properties until it fits
  let truncated = { ...obj };
  const keys = Object.keys(truncated).reverse();
  
  for (const key of keys) {
    if (getJsonSize(JSON.stringify(truncated)) <= maxSize) {
      break;
    }
    delete truncated[key];
  }
  
  const jsonString = JSON.stringify(truncated);
  if (getJsonSize(jsonString) <= maxSize) {
    return jsonString;
  }
  
  // If still too big, return truncated string representation
  return JSON.stringify({ truncated: true, size: getJsonSize(JSON.stringify(obj)) })
    .substring(0, Math.max(0, maxSize - 3)) + '...';
}

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
  safeJsonParse,
  safeJsonStringify,
  safeDeepClone,
  parseAndValidateJson,
  safeJsonStringifyWithSize,
  safeJsonMerge,
  isValidJson,
  getJsonSize,
  truncateJson,
  createJsonUtils
};
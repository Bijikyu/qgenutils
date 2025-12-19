/**
 * JSON stringification utilities with error handling
 */

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

module.exports = {
  safeJsonStringify,
  safeJsonStringifyWithSize
};
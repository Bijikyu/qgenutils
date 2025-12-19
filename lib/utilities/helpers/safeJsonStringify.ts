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
  const { space = null, replacer = null }: any = replacerOptions;
  
  try {
    if (space !== null || replacer !== null) {
      return JSON.stringify(value, replacer, space);
    }
    return JSON.stringify(value);
  } catch (error) {
    return defaultValue;
  }
}

export default safeJsonStringify;
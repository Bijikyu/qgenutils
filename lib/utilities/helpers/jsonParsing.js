/**
 * JSON parsing utilities with error handling
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

module.exports = {
  safeJsonParse,
  parseAndValidateJson,
  isValidJson
};
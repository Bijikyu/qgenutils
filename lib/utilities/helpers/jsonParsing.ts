/**
 * JSON parsing utilities with error handling
 */

/**
 * Safely parses JSON string with error handling and prototype pollution protection
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJsonParse(jsonString: string, defaultValue: any = null): any {
  try {
    const parsed = JSON.parse(jsonString);

    // Protect against prototype pollution
    if (parsed && typeof parsed === 'object') {
      return sanitizeObject(parsed);
    }

    return parsed;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Sanitizes object to prevent prototype pollution
 * @param {any} obj - Object to sanitize
 * @returns {any} Sanitized object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Create a clean object without prototype chain
  const sanitized = Array.isArray(obj) ? [] : Object.create(null);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Skip dangerous prototype properties
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      const value = obj[key];
      if (value && typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Parses JSON string and validates it against expected type
 * @param {string} jsonString - JSON string to parse
 * @param {string|Array} expectedType - Expected type(s) ('object', 'array', 'string', etc.)
 * @param {*} defaultValue - Default value if validation fails
 * @returns {*} Validated parsed value or default value
 */
function parseAndValidateJson(jsonString: string, expectedType: string | string[] = 'object', defaultValue: any = null): any {
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
function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  safeJsonParse,
  parseAndValidateJson,
  isValidJson
};

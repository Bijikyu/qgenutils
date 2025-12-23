/**
 * Safely parses JSON string with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJsonParse(jsonString: string, defaultValue: any = null): any {
  if (typeof jsonString !== 'string') {
    return defaultValue;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    // Prevent prototype pollution by checking dangerous properties
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.__proto__ !== Object.prototype || 
          parsed.constructor !== Object || 
          parsed.prototype !== undefined ||
          Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
          Object.prototype.hasOwnProperty.call(parsed, 'constructor') ||
          Object.prototype.hasOwnProperty.call(parsed, 'prototype')) {
        return defaultValue;
      }
    }
    return parsed;
  } catch (error) {
    return defaultValue;
  }
}

export default safeJsonParse;
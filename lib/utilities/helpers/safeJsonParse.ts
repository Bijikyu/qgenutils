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
      if (parsed.hasOwnProperty('__proto__') || 
          parsed.hasOwnProperty('constructor') || 
          parsed.hasOwnProperty('prototype')) {
        return defaultValue;
      }
    }
    return parsed;
  } catch (error) {
    return defaultValue;
  }
}

export default safeJsonParse;
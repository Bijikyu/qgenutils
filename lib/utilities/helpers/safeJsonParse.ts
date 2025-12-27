/**
 * Recursively checks for prototype pollution in an object
 * @param {any} obj - Object to check
 * @param {Set} visited - Set of visited objects to prevent infinite recursion
 * @returns {boolean} True if prototype pollution is detected
 */
function checkPrototypePollution(obj: any, visited = new WeakSet()): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  if (visited.has(obj)) {
    return false;
  }
  
  visited.add(obj);
  
  // Check for dangerous properties
  if (obj.hasOwnProperty('__proto__') || 
      obj.hasOwnProperty('constructor') || 
      obj.hasOwnProperty('prototype')) {
    return true;
  }
  
  // Recursively check nested objects
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
      if (checkPrototypePollution(obj[key], visited)) {
        return true;
      }
    }
  }
  
  return false;
}

import { qerrors } from 'qerrors';

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
    // Prevent prototype pollution by recursively checking dangerous properties
    if (typeof parsed === 'object' && parsed !== null) {
      const hasDangerousProps = checkPrototypePollution(parsed);
      if (hasDangerousProps) {
        const prototypeError = new Error('Prototype pollution detected in JSON');
        qerrors(prototypeError, 'safeJsonParse', `JSON parsing blocked due to prototype pollution for string length: ${jsonString.length}`);
        return defaultValue;
      }
    }
    return parsed;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeJsonParse', `JSON parsing failed for string length: ${jsonString.length}`);
    return defaultValue;
  }
}

export default safeJsonParse;
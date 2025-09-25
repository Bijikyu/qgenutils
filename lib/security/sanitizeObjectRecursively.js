/**
 * Recursively Sanitize Object Properties to Prevent Injection Attacks
 * 
 * RATIONALE: Complex data structures from user input (JSON payloads, form data)
 * may contain malicious content in nested properties. This function provides
 * deep sanitization while preserving data structure and types.
 * 
 * SECURITY APPROACH:
 * - Recursively traverse all object properties and array elements
 * - Apply string sanitization to all string values and property keys
 * - Preserve non-string data types (numbers, booleans, null)
 * - Handle circular references and deep nesting gracefully
 * - Maintain original object structure for compatibility
 * 
 * @param {any} obj - Object, array, or primitive to sanitize recursively
 * @returns {any} Sanitized copy with same structure but safe string values
 * @throws Never throws - returns sanitized version or empty object on error
 */

// Defensive require for qerrors to prevent test environment failures
let qerrors;
try {
  const qerrorsModule = require('qerrors');
  qerrors = qerrorsModule && qerrorsModule.qerrors ? qerrorsModule.qerrors : (qerrorsModule && qerrorsModule.default) ? qerrorsModule.default : qerrorsModule;
} catch (err) {
  // Provide a no-op fallback so tests won't fail if qerrors is absent
  qerrors = function () { /* no-op error reporter for test envs */ };
}

const logger = require('../logger');
const sanitizeString = require('../utilities/string/sanitizeString');

function sanitizeObjectRecursively(obj, seen = new WeakSet()) {
  try {
    // Handle string values directly
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    // Handle arrays by mapping over elements
    if (Array.isArray(obj)) {
      // Check for circular references
      if (seen.has(obj)) {
        logger.warn('sanitizeObjectRecursively detected circular reference in array');
        return '[circular]';
      }
      seen.add(obj);
      
      const result = obj.map(item => sanitizeObjectRecursively(item, seen));
      seen.delete(obj);
      return result;
    }
    
    // Handle objects by sanitizing both keys and values
    if (typeof obj === 'object' && obj !== null) {
      // Check for circular references
      if (seen.has(obj)) {
        logger.warn('sanitizeObjectRecursively detected circular reference in object');
        return '[circular]';
      }
      seen.add(obj);
      
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObjectRecursively(value, seen);
      }
      seen.delete(obj);
      return sanitized;
    }
    
    // Return primitives (numbers, booleans, null, undefined) unchanged
    return obj;
    
  } catch (error) {
    qerrors(error, 'sanitizeObjectRecursively', { 
      objType: typeof obj,
      isArray: Array.isArray(obj),
      errorMessage: error.message
    });
    
    logger.error('sanitizeObjectRecursively failed with unexpected error', { 
      error: error.message,
      stack: error.stack,
      objType: typeof obj
    });
    
    // Return empty object as safe fallback for objects, empty string for others
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj) ? {} : '';
  }
}

module.exports = sanitizeObjectRecursively;
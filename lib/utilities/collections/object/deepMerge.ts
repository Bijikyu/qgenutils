/**
 * Deep merges multiple objects recursively.
 *
 * PURPOSE: Combines configuration objects, default values with overrides,
 * or nested data structures without losing nested properties.
 *
 * @param {...object} objects - Objects to merge (later objects override earlier)
 * @returns {object} New deeply merged object
 */
const isPlainObject: any = require('./isPlainObject');

function deepMerge(...objects: any[]) {
  return objects.reduce((result, obj: any): any => {
    if (!obj || typeof obj !== 'object') return result;
    
  // Prevent prototype pollution by using Object.getOwnPropertyNames and filtering
  const ownKeys = Object.getOwnPropertyNames(obj);
  
  ownKeys.forEach(key => {
    // Prevent prototype pollution by blocking dangerous keys
    const dangerousKeys = [
      '__proto__', 'constructor', 'prototype',
      '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
      '__eval__', '__function__', '__script__', 'constructor.prototype',
      'constructor.prototype', '__proto__', '__defineGetter__', '__defineSetter__'
    ];
    
    // Additional protection: check if key would modify prototype
    if (dangerousKeys.includes(key) || 
        key === '__proto__' || 
        key === 'constructor' || 
        key === 'prototype' ||
        key.startsWith('__') ||
        key.includes('proto') ||
        key.includes('constructor')) {
      return;
    }
      
      // Ensure we only work with own properties, not prototype properties
      if (!obj.hasOwnProperty(key)) {
        return;
      }
      
      const value: any = obj[key];
      const existingValue: any = result[key];
      
      // Additional check to prevent prototype pollution through Object.defineProperty
      if (typeof value === 'function' && (key === '__defineGetter__' || key === '__defineSetter__')) {
        return;
      }
      
      if (isPlainObject(value) && isPlainObject(existingValue)) {
        result[key] = deepMerge(existingValue, value);
      } else {
        result[key] = value;
      }
    });
    
    return result;
  }, {});
}

export default deepMerge;

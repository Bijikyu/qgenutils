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

function deepMerge(...objects) {
  return objects.reduce((result, obj: any): any => {
    if (!obj || typeof obj !== 'object') return result;
    
    Object.keys(obj).forEach(key => {
      // Prevent prototype pollution by blocking dangerous keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      
      const value: any = obj[key];
      const existingValue: any = result[key];
      
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

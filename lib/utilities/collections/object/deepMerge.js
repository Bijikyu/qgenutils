/**
 * Deep merges multiple objects recursively.
 *
 * PURPOSE: Combines configuration objects, default values with overrides,
 * or nested data structures without losing nested properties.
 *
 * @param {...object} objects - Objects to merge (later objects override earlier)
 * @returns {object} New deeply merged object
 */
const isPlainObject = require('./isPlainObject');

function deepMerge(...objects) {
  return objects.reduce((result, obj) => {
    if (!obj || typeof obj !== 'object') return result;
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const existingValue = result[key];
      
      if (isPlainObject(value) && isPlainObject(existingValue)) {
        result[key] = deepMerge(existingValue, value);
      } else {
        result[key] = value;
      }
    });
    
    return result;
  }, {});
}

module.exports = deepMerge;

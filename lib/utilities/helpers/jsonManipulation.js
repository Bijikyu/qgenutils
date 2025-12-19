/**
 * JSON cloning and manipulation utilities
 */

/**
 * Safely deep clones an object using JSON
 * @param {*} value - Value to clone
 * @param {*} defaultValue - Default value if cloning fails
 * @returns {*} Deep cloned value or default value
 */
function safeDeepClone(value, defaultValue = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Merges multiple JSON objects safely
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object or empty object if merge fails
 */
function safeJsonMerge(...objects) {
  try {
    return objects.reduce((merged, obj) => {
      if (obj && typeof obj === 'object') {
        return { ...merged, ...obj };
      }
      return merged;
    }, {});
  } catch (error) {
    return {};
  }
}

module.exports = {
  safeDeepClone,
  safeJsonMerge
};
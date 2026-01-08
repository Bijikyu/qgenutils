/**
 * JSON cloning and manipulation utilities
 */

import lodash from 'lodash';
const { cloneDeep } = lodash as any;

/**
 * Safely deep clones an object using lodash.cloneDeep
 * @param {*} value - Value to clone
 * @param {*} defaultValue - Default value if cloning fails
 * @returns {*} Deep cloned value or default value
 */
function safeDeepClone(value: any, defaultValue: any = null) {
  try {
    return cloneDeep(value);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Merges multiple JSON objects safely
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object or empty object if merge fails
 */
function safeJsonMerge(...objects: any[]) {
  try {
    return objects.reduce((merged, obj: any): any => {
      if (obj && typeof obj === 'object') {
        return { ...merged, ...obj };
      }
      return merged;
    }, {});
  } catch (error) {
    return {};
  }
}

export default {
  safeDeepClone,
  safeJsonMerge
};

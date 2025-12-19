/**
 * Omits specific keys from an object.
 *
 * PURPOSE: Removes sensitive or unwanted properties for API responses,
 * logging, or data transformation.
 *
 * @param {object} obj - Source object
 * @param {Array<string>} keys - Keys to exclude
 * @returns {object} New object without specified keys
 */
function omit(obj, keys) {
  if (!obj || typeof obj !== 'object') return {};
  if (!Array.isArray(keys)) return { ...obj };
  
  const keySet: any = new Set(keys);
  const result: any = {};
  
  Object.keys(obj).forEach(key => {
    if (!keySet.has(key)) {
      result[key] = obj[key];
    }
  });
  
  return result;
}

export default omit;

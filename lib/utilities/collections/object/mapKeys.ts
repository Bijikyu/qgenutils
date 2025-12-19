/**
 * Transforms object keys using a mapper function.
 *
 * PURPOSE: Renames keys for API compatibility, case conversion,
 * or normalization (e.g., camelCase to snake_case).
 *
 * @param {object} obj - Source object
 * @param {Function} keyMapper - Function (key, value) => newKey
 * @returns {object} New object with transformed keys
 */
function mapKeys(obj, keyMapper) {
  if (!obj || typeof obj !== 'object') return {};
  if (typeof keyMapper !== 'function') return { ...obj };
  
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const newKey: any = keyMapper(key, obj[key]);
    result[newKey] = obj[key];
  });
  return result;
}

export default mapKeys;

/**
 * Filters object keys based on predicate.
 *
 * PURPOSE: Removes properties conditionally, such as filtering
 * out null values, empty strings, or specific patterns.
 *
 * @param {object} obj - Source object
 * @param {Function} predicate - Function (key, value) => boolean
 * @returns {object} New object with filtered keys
 */
function filterKeys(obj, predicate) {
  if (!obj || typeof obj !== 'object') return {};
  if (typeof predicate !== 'function') return { ...obj };
  
  const result = {};
  Object.keys(obj).forEach(key => {
    if (predicate(key, obj[key])) {
      result[key] = obj[key];
    }
  });
  return result;
}

module.exports = filterKeys;

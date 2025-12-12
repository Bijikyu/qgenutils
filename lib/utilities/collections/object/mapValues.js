/**
 * Transforms object values using a mapper function.
 *
 * PURPOSE: Applies transformations to all values for
 * data conversion, formatting, or computation.
 *
 * @param {object} obj - Source object
 * @param {Function} valueMapper - Function (value, key) => newValue
 * @returns {object} New object with transformed values
 */
function mapValues(obj, valueMapper) {
  if (!obj || typeof obj !== 'object') return {};
  if (typeof valueMapper !== 'function') return { ...obj };
  
  const result = {};
  Object.keys(obj).forEach(key => {
    result[key] = valueMapper(obj[key], key);
  });
  return result;
}

module.exports = mapValues;

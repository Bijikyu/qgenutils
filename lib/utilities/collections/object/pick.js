/**
 * Picks specific keys from an object.
 *
 * PURPOSE: Extracts subset of object properties for API responses,
 * form data extraction, or security filtering.
 *
 * @param {object} obj - Source object
 * @param {Array<string>} keys - Keys to include
 * @returns {object} New object with only specified keys
 */
const pick = (obj, keys) => (!obj || typeof obj !== 'object' || !Array.isArray(keys)) ? {} : (() => {
  const result = {};
  keys.forEach(key => key in obj && (result[key] = obj[key]));
  return result;
})();

module.exports = pick;

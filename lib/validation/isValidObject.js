/**
 * Determine if the supplied value is a plain object.
 *
 * PURPOSE: Used by various validation helpers to confirm an argument is an
 * actual object before attempting to access its properties. Returning a simple
 * boolean allows the calling code to branch quickly without throwing errors.
 *
 * ASSUMPTIONS: Any type may be passed in. The function must therefore handle
 * null, undefined and Array values safely without throwing.
 *
 * EDGE CASES: We explicitly check for null and arrays so they are not treated
 * as valid objects. This prevents false positives when validating request
 * bodies or configuration parameters.
 *
 * @param {*} obj - Value to check
 * @returns {boolean} True if valid object, false otherwise
 */
function isValidObject(obj) {
  return obj !== null && obj !== undefined && typeof obj === `object` && !Array.isArray(obj); // reject null and arrays so only plain objects pass
}

module.exports = isValidObject;
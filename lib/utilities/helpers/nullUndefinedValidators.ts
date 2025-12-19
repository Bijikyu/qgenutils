/**
 * Null and undefined validation utilities
 */

/**
 * Checks if a value is null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} True if value is null or undefined
 */
function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * Checks if a value is NOT null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} True if value is not null or undefined
 */
function isNotNullOrUndefined(value) {
  return value !== null && value !== undefined;
}

export default {
  isNullOrUndefined,
  isNotNullOrUndefined
};
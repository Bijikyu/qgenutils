/**
 * Checks if a value is a plain object (not array, Date, Map, etc).
 *
 * PURPOSE: Distinguishes plain objects from other object types
 * for recursive operations like deep merge and deep clone.
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if plain object
 */
function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp) &&
    !(value instanceof Map) &&
    !(value instanceof Set)
  );
}

module.exports = isPlainObject;

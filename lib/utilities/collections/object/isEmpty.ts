/**
 * Checks if a value is empty (null, empty array, empty object).
 *
 * PURPOSE: Validates input for conditional logic, form validation,
 * or filtering empty data.
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (typeof value === 'string') return value.length === 0;
  return false;
}

export default isEmpty;

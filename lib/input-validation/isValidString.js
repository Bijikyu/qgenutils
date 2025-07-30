/**
 * Validate that the provided value is a non-empty string.
 *
 * PURPOSE: Many modules rely on simple string parameters such as IDs or
 * messages. A boolean return keeps caller logic straightforward.
 *
 * ASSUMPTIONS: Any value may be passed, so we handle non-string types and trim
 * whitespace to ensure that strings containing only spaces are rejected.
 *
 * EDGE CASES: null, numbers or objects are all rejected. Trimming prevents
 * "  " from being considered a valid string.
 *
 * @param {*} str - Value to check
 * @returns {boolean} True if valid string, false otherwise
 */
function isValidString(str) {
  return typeof str === 'string' && str.trim().length > 0; // empty or whitespace strings are treated as missing
}

module.exports = isValidString;
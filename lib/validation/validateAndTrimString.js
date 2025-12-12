/**
 * Validates and trims a string input, returning empty string for invalid inputs.
 *
 * PURPOSE: Provides a silent, non-throwing validation that normalizes string
 * inputs by trimming whitespace. Returns empty string for non-string inputs,
 * making it safe for use in contexts where missing values should be handled
 * gracefully rather than throwing errors.
 *
 * DIFFERENCE FROM validateInputString: This function never throws - it returns
 * an empty string for invalid inputs, while validateInputString throws an error.
 * Use validateAndTrimString for optional fields or form inputs; use
 * validateInputString for required fields where missing values are errors.
 *
 * @param {unknown} input - The input value to validate and trim
 * @param {string} [fieldName] - Optional field name (reserved for future logging)
 * @returns {string} Trimmed string or empty string if input is invalid
 */
function validateAndTrimString(input, fieldName) {
  if (typeof input === 'string') {
    return input.trim();
  }
  return '';
}

module.exports = validateAndTrimString;

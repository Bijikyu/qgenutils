/**
 * Validates array input with common validation patterns
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether the value is required
 * @param {Array} options.defaultValue - Default value if input is invalid
 * @param {number} options.minLength - Minimum array length
 * @param {number} options.maxLength - Maximum array length
 * @param {string} options.fieldName - Name of the field for error messages
 * @returns {Object} Validation result with valid, value, and error properties
 */
function validateArrayInput(value, options = {}) {
  const {
    required = false,
    defaultValue = [],
    minLength = null,
    maxLength = null,
    fieldName = `array`
  } = options;

  // Handle null/undefined cases
  if (value === null || value === undefined) {
    if (required) {
      return {
        valid: false,
        error: `${fieldName} is required`,
        value: null
      };
    }
    return {
      valid: true,
      value: defaultValue,
      skip: true
    };
  }

  // Check type
  if (!Array.isArray(value)) {
    return {
      valid: false,
      error: `${fieldName} must be an array`,
      value: defaultValue
    };
  }

  // Check minimum length
  if (minLength !== null && value.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must have at least ${minLength} item(s)`,
      value: defaultValue
    };
  }

  // Check maximum length
  if (maxLength !== null && value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must have at most ${maxLength} item(s)`,
      value: defaultValue
    };
  }

  return {
    valid: true,
    value: value
  };
}

module.exports = {
  validateArrayInput
};
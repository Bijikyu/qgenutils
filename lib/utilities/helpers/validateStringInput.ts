/**
 * Validates string input with common validation patterns
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether the value is required
 * @param {boolean} options.allowNull - Whether null values are allowed
 * @param {boolean} options.trim - Whether to trim whitespace
 * @param {string} options.fieldName - Name of the field for error messages
 * @returns {Object} Validation result with valid, value, and error properties
 */
function validateStringInput(value, options = {}) {
  const {
    required = false,
    allowNull = false,
    trim = false,
    fieldName = 'value'
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
    if (allowNull) {
      return {
        valid: true,
        value: null,
        skip: true
      };
    }
    return {
      valid: false,
      error: `${fieldName} cannot be null or undefined`,
      value: null
    };
  }

  // Check type
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string`,
      value: null
    };
  }

  // Process value
  const processedValue: any = trim ? value.trim() : value;

  // Check empty string
  if (required && processedValue === '') {
    return {
      valid: false,
      error: `${fieldName} cannot be empty`,
      value: null
    };
  }

  return {
    valid: true,
    value: processedValue
  };
}

export default {
  validateStringInput
};
/**
 * Validates required field patterns commonly used across validation utilities
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {string} options.fieldName - Name of the field for error messages
 * @param {boolean} options.allowEmptyString - Whether empty strings are allowed
 * @param {boolean} options.allowEmptyArray - Whether empty arrays are allowed
 * @param {boolean} options.allowEmptyObject - Whether empty objects are allowed
 * @returns {Object} Validation result with valid, errors, and value properties
 */
function validateRequired(value, options = {}) {
  const {
    fieldName = 'value',
    allowEmptyString = false,
    allowEmptyArray = true,
    allowEmptyObject = true
  } = options;

  const errors = [];

  // Check for null or undefined
  if (value === undefined || value === null) {
    errors.push(`${fieldName} is required`);
    return {
      valid: false,
      errors,
      value: null
    };
  }

  // Check for empty string
  if (typeof value === 'string' && !allowEmptyString && value.trim() === '') {
    errors.push(`${fieldName} cannot be empty`);
  }

  // Check for empty array
  if (Array.isArray(value) && !allowEmptyArray && value.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
  }

  // Check for empty object
  if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
      !allowEmptyObject && Object.keys(value).length === 0) {
    errors.push(`${fieldName} cannot be empty`);
  }

  return {
    valid: errors.length === 0,
    errors,
    value
  };
}

/**
 * Creates a required field validator function with custom options
 * @param {Object} defaultOptions - Default validation options
 * @returns {Function} Validator function
 */
function createRequiredValidator(defaultOptions = {}) {
  return function(value, options = {}) {
    const mergedOptions = { ...defaultOptions, ...options };
    return validateRequired(value, mergedOptions);
  };
}

/**
 * Validates multiple required fields at once
 * @param {Object} data - Object containing fields to validate
 * @param {Array} fieldConfigs - Array of field configuration objects
 * @returns {Object} Validation result with all field errors
 */
function validateMultipleRequired(data, fieldConfigs) {
  const allErrors = {};
  let isValid = true;

  for (const config of fieldConfigs) {
    const { field, options = {} } = config;
    const result = validateRequired(data[field], { fieldName: field, ...options });
    
    if (!result.valid) {
      allErrors[field] = result.errors;
      isValid = false;
    }
  }

  return {
    valid: isValid,
    errors: allErrors,
    data
  };
}

module.exports = {
  validateRequired,
  createRequiredValidator,
  validateMultipleRequired
};
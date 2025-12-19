'use strict';

/**
 * Common validation result builder utilities
 * Standardizes validation error handling across all validation functions
 */

/**
 * Creates a successful validation result
 * @param {*} [value] - The validated value (optional)
 * @returns {Object} Success result object
 */
const createSuccessResult = (value) => ({
  isValid: true,
  errors: [],
  value
});

/**
 * Creates a failed validation result with single error
 * @param {string} error - Error message or key
 * @param {*} [value] - The invalid value (optional)
 * @returns {Object} Failure result object
 */
const createErrorResult = (error, value) => ({
  isValid: false,
  errors: [error],
  value
});

/**
 * Creates a failed validation result with multiple errors
 * @param {Array<string>} errors - Array of error messages or keys
 * @param {*} [value] - The invalid value (optional)
 * @returns {Object} Failure result object
 */
const createMultiErrorResult = (errors, value) => ({
  isValid: false,
  errors,
  value
});

/**
 * Checks if a result is successful
 * @param {Object} result - Validation result object
 * @returns {boolean} True if validation passed
 */
const isSuccess = (result) => result && result.isValid === true;

/**
 * Checks if a result failed validation
 * @param {Object} result - Validation result object
 * @returns {boolean} True if validation failed
 */
const isFailure = (result) => !isSuccess(result);

/**
 * Gets the first error from a validation result
 * @param {Object} result - Validation result object
 * @returns {string|null} First error message or null if successful
 */
const getFirstError = (result) => {
  if (isSuccess(result)) return null;
  return result.errors && result.errors.length > 0 ? result.errors[0] : null;
};

/**
 * Common error messages for validation
 */
const ERROR_MESSAGES = {
  REQUIRED: 'required',
  INVALID_TYPE: 'invalid_type',
  NOT_STRING: 'not_string',
  NOT_NUMBER: 'not_number',
  NOT_BOOLEAN: 'not_boolean',
  TOO_SHORT: 'too_short',
  TOO_LONG: 'too_long',
  INVALID_EMAIL: 'invalid_email',
  WEAK_PASSWORD: 'weak_password',
  OUT_OF_RANGE: 'out_of_range',
  NEGATIVE_VALUE: 'negative_value',
  ZERO_VALUE: 'zero_value'
};

/**
 * Creates type validation functions
 * @param {string} type - Expected type name
 * @param {string} [errorKey] - Custom error key
 * @returns {Function} Type validator function
 */
const createTypeValidator = (type, errorKey) => (value) => {
  const typeCheck = {
    string: typeof value === 'string',
    number: typeof value === 'number' && !isNaN(value),
    boolean: typeof value === 'boolean',
    object: value !== null && typeof value === 'object' && !Array.isArray(value),
    array: Array.isArray(value)
  };

  return typeCheck[type] 
    ? createSuccessResult(value)
    : createErrorResult(errorKey || `not_${type}`, value);
};

module.exports = {
  createSuccessResult,
  createErrorResult,
  createMultiErrorResult,
  isSuccess,
  isFailure,
  getFirstError,
  ERROR_MESSAGES,
  createTypeValidator
};
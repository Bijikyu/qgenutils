/**
 * Validation result creation utilities
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

module.exports = {
  createSuccessResult,
  createErrorResult,
  createMultiErrorResult
};
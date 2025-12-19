/**
 * Validation result analysis utilities
 */

/**
 * Checks if a result is successful
 * @param {Object} result - Validation result object
 * @returns {boolean} True if validation passed
 */
const isSuccess: any = (result) => result && result.isValid === true;

/**
 * Checks if a result failed validation
 * @param {Object} result - Validation result object
 * @returns {boolean} True if validation failed
 */
const isFailure: any = (result) => !isSuccess(result);

/**
 * Gets the first error from a validation result
 * @param {Object} result - Validation result object
 * @returns {string|null} First error message or null if successful
 */
const getFirstError = (result: any): any => {
  if (!result || isSuccess(result)) return null;
  return result.errors && result.errors.length > 0 ? result.errors[0] : null;
};

export default {
  isSuccess,
  isFailure,
  getFirstError
};
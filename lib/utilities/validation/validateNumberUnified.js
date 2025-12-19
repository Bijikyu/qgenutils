'use strict';

const { createSuccessResult, createErrorResult, ERROR_MESSAGES } = require('./validationResultBuilder');

/**
 * Unified number validation utility
 * Combines functionality from validateNumberRange and validateNumberInRange
 */

/**
 * Core number validation logic
 * @param {*} value - Value to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.min] - Minimum allowed value
 * @param {number} [options.max] - Maximum allowed value
 * @param {boolean} [options.required=false] - Whether value is required
 * @param {*} [options.defaultValue=null] - Default value for missing fields
 * @returns {Object} Validation result
 */
const validateNumberCore = (value, options = {}) => {
  const { min, max, required = false, defaultValue = null } = options;

  // Handle missing values
  if (value === undefined || value === null) {
    if (required) {
      return createErrorResult(ERROR_MESSAGES.REQUIRED, value);
    }
    return defaultValue !== null 
      ? createSuccessResult(defaultValue)
      : createSuccessResult(null);
  }

  // Convert to number
  const numValue = Number(value);

  // Check if valid number
  if (!Number.isFinite(numValue)) {
    return createErrorResult(ERROR_MESSAGES.NOT_NUMBER, value);
  }

  // Range validation
  if (min !== undefined && numValue < min) {
    return createErrorResult(`${ERROR_MESSAGES.OUT_OF_RANGE}_min`, numValue);
  }

  if (max !== undefined && numValue > max) {
    return createErrorResult(`${ERROR_MESSAGES.OUT_OF_RANGE}_max`, numValue);
  }

  return createSuccessResult(numValue);
};

/**
 * Simple number range validation (like original validateNumberRange)
 * @param {number} value - Numeric value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Name of field for error messages
 * @returns {Object|null} Validation error or null if valid
 */
const validateNumberRange = (value, min, max, fieldName) => {
  const result = validateNumberCore(value, { min, max, required: true });

  if (result.isValid) {
    return null;
  }

  if (result.errors.includes(ERROR_MESSAGES.NOT_NUMBER)) {
    return { error: `${fieldName || 'Value'} must be a number` };
  }

  if (result.errors.includes(`${ERROR_MESSAGES.OUT_OF_RANGE}_min`)) {
    return { error: `${fieldName || 'Value'} must be at least ${min}` };
  }

  if (result.errors.includes(`${ERROR_MESSAGES.OUT_OF_RANGE}_max`)) {
    return { error: `${fieldName || 'Value'} must be at most ${max}` };
  }

  return { error: `${fieldName || 'Value'} is invalid` };
};

/**
 * Express request field number validation with range constraints (like original validateNumberInRange)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} fieldName - Name of field to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.min] - Minimum allowed value
 * @param {number} [options.max] - Maximum allowed value
 * @param {boolean} [options.required=false] - Whether field is required
 * @param {Function} handler - Validation error handler
 * @returns {Promise<number|null>} Validated number or null if validation failed/missing
 */
async function validateNumberInRange(req, res, fieldName, options = {}, handler) {
  const value = req.body?.[fieldName];
  const result = validateNumberCore(value, options);

  if (result.isValid && result.value !== null) {
    return result.value;
  }

  // Handle validation failure
  if (handler && result.errors.length > 0) {
    const error = result.errors[0];
    let errorMessage = `${fieldName} must be a number`;
    let errorDetails = { receivedValue: value, receivedType: typeof value };

    if (error === ERROR_MESSAGES.REQUIRED) {
      errorMessage = `Missing required field: ${fieldName}`;
    } else if (error.includes('out_of_range_min')) {
      errorMessage = `${fieldName} must be at least ${options.min}`;
      errorDetails = { receivedValue: result.value, min: options.min };
    } else if (error.includes('out_of_range_max')) {
      errorMessage = `${fieldName} must be at most ${options.max}`;
      errorDetails = { receivedValue: result.value, max: options.max };
    }

    await handler(res, errorMessage, fieldName, errorDetails);
  }

  return null;
}

module.exports = {
  validateNumberCore,
  validateNumberRange,
  validateNumberInRange
};
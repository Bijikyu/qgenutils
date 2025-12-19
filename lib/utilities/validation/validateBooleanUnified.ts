'use strict';

const { createSuccessResult, createErrorResult } = require('./validationResultBuilder');
const { ERROR_MESSAGES } = require('./validationConstants');

/**
 * Unified boolean validation utility
 * Combines functionality from validateBoolean and validateBooleanField
 */

/**
 * Core boolean validation logic
 * @param {*} value - Value to validate
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.allowStringBooleans=true] - Allow string representations ('true', 'false', '1', '0')
 * @param {boolean} [options.defaultValue=null] - Default value for missing fields
 * @returns {Object} Validation result
 */
const validateBooleanCore = (value: any, options: any = {}): any => {
  const { allowStringBooleans = true, defaultValue = null }: any = options;

  // Handle missing values
  if (value === undefined || value === null) {
    return defaultValue !== null 
      ? createSuccessResult(defaultValue)
      : createErrorResult(ERROR_MESSAGES.REQUIRED, value);
  }

  // Direct boolean check
  if (typeof value === 'boolean') {
    return createSuccessResult(value);
  }

  // String boolean conversion if allowed
  if (allowStringBooleans && typeof value === 'string') {
    const lowerValue: any = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1') {
      return createSuccessResult(true);
    }
    if (lowerValue === 'false' || lowerValue === '0') {
      return createSuccessResult(false);
    }
  }

  return createErrorResult(ERROR_MESSAGES.NOT_BOOLEAN, value);
};

/**
 * Simple boolean validation (like original validateBoolean)
 * @param {*} value - Value to validate
 * @param {string} [fieldName] - Field name for error messages
 * @returns {Object|null} Validation error or null if valid
 */
const validateBoolean = (value, fieldName: any): any => {
  const result: any = validateBooleanCore(value, { allowStringBooleans: false });
  
  if (result.isValid) {
    return null;
  }
  
  return {
    error: `${fieldName || 'Value'} must be true or false`
  };
};

/**
 * Express request field boolean validation (like original validateBooleanField)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} fieldName - Name of field to validate
 * @param {Function} handler - Validation error handler
 * @param {boolean} [defaultValue=false] - Default value if field not present
 * @returns {Promise<boolean>} Validated boolean value or default
 */
async function validateBooleanField(req, res, fieldName, handler, defaultValue = false) {
  const value: any = req.body?.[fieldName];
  const result: any = validateBooleanCore(value, { defaultValue });

  if (result.isValid) {
    return result.value;
  }

  // Handle validation failure
  if (handler) {
    await handler(res, `${fieldName} must be a boolean`, fieldName, {
      receivedValue: value,
      receivedType: typeof value
    });
  }

  return defaultValue;
}

export default {
  validateBooleanCore,
  validateBoolean,
  validateBooleanField
};
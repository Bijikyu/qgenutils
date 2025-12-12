'use strict';

/**
 * Common validation utilities without Zod dependency
 * Provides standalone validation functions with error throwing
 * @module zodValidationUtils
 */
const zodValidationUtils = {
  /**
   * Validates and trims string input
   * @param {unknown} input - Value to validate
   * @param {string} fieldName - Name of field for error messages
   * @returns {string} Validated and trimmed string
   * @throws {Error} If input is not a valid non-empty string
   */
  validateString: (input, fieldName) => { // validate and trim string
    if (typeof input !== 'string') {
      throw new Error(`${fieldName} must be a string, received ${typeof input}`);
    }
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error(`${fieldName} must not be empty`);
    }
    return trimmed;
  },

  /**
   * Validates API key with format checking
   * @param {unknown} apiKey - API key to validate
   * @param {string} serviceName - Name of service for error messages
   * @returns {string} Validated API key
   * @throws {Error} If API key is invalid
   */
  validateApiKey: (apiKey, serviceName) => { // validate API key
    return zodValidationUtils.validateString(apiKey, `${serviceName} API key`);
  },

  /**
   * Validates email format
   * @param {unknown} email - Email to validate
   * @param {string} [fieldName='email'] - Name of field for error messages
   * @returns {string} Validated email
   * @throws {Error} If email format is invalid
   */
  validateEmail: (email, fieldName = 'email') => { // validate email format
    const validated = zodValidationUtils.validateString(email, fieldName);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(validated)) {
      throw new Error(`${fieldName} must be a valid email address`);
    }
    return validated;
  },

  /**
   * Validates required object fields
   * @param {Object} obj - Object to validate
   * @param {string[]} requiredFields - Array of required field names
   * @param {string} context - Context name for error messages
   * @throws {Error} If any required fields are missing
   */
  validateRequiredFields: (obj, requiredFields, context) => { // validate required fields
    if (!obj || typeof obj !== 'object') {
      throw new Error(`${context} must be an object`);
    }
    const missing = requiredFields.filter(field => {
      const value = obj[field];
      return value === undefined || value === null ||
        (typeof value === 'string' && !value.trim());
    });
    if (missing.length) {
      throw new Error(`Missing required fields for ${context}: ${missing.join(', ')}`);
    }
  },

  /**
   * Validates choice among allowed values
   * @param {unknown} value - Value to validate
   * @param {Array} allowedValues - Array of allowed values
   * @param {string} fieldName - Name of field for error messages
   * @returns {*} Validated value
   * @throws {Error} If value is not in allowed list
   */
  validateChoice: (value, allowedValues, fieldName) => { // validate value in allowed list
    if (!allowedValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
    return value;
  },

  /**
   * Validates number within range
   * @param {unknown} value - Value to validate
   * @param {string} fieldName - Name of field for error messages
   * @param {Object} [options] - Validation options
   * @param {number} [options.min] - Minimum value
   * @param {number} [options.max] - Maximum value
   * @param {boolean} [options.integer] - Must be integer
   * @returns {number} Validated number
   * @throws {Error} If validation fails
   */
  validateNumber: (value, fieldName, options = {}) => { // validate number with options
    const num = Number(value);
    if (!Number.isFinite(num)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
    if (options.integer && !Number.isInteger(num)) {
      throw new Error(`${fieldName} must be an integer`);
    }
    if (options.min !== undefined && num < options.min) {
      throw new Error(`${fieldName} must be at least ${options.min}`);
    }
    if (options.max !== undefined && num > options.max) {
      throw new Error(`${fieldName} must be at most ${options.max}`);
    }
    return num;
  }
};

module.exports = zodValidationUtils;

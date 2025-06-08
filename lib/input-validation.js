
/*
 * Input Validation Utility Module
 * 
 * This module provides common input validation functions used across multiple
 * modules to avoid code duplication and ensure consistent validation logic.
 * 
 * DESIGN PHILOSOPHY:
 * - Centralize validation logic to reduce duplication
 * - Provide consistent validation behavior across modules
 * - Return boolean values for simple integration
 * - Handle edge cases gracefully
 */

const { qerrors } = require('qerrors');

/**
 * Check if value is a valid object (not null, not array, is object)
 * 
 * @param {*} obj - Value to check
 * @returns {boolean} True if valid object, false otherwise
 */
function isValidObject(obj) {
  return obj !== null && obj !== undefined && typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * Check if value is a valid non-empty string
 * 
 * @param {*} str - Value to check
 * @returns {boolean} True if valid string, false otherwise
 */
function isValidString(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Check if object has a specific method
 * 
 * @param {*} obj - Object to check
 * @param {string} methodName - Name of method to check for
 * @returns {boolean} True if object has method, false otherwise
 */
function hasMethod(obj, methodName) {
  try {
    return obj && typeof obj[methodName] === 'function';
  } catch (error) {
    qerrors(error, 'hasMethod', { obj: typeof obj, methodName });
    return false;
  }
}

/**
 * Check if value is a valid Express response object
 * 
 * @param {*} res - Value to check
 * @returns {boolean} True if valid Express response, false otherwise
 */
function isValidExpressResponse(res) {
  return hasMethod(res, 'status') && hasMethod(res, 'json');
}

module.exports = {
  isValidObject,
  isValidString,
  hasMethod,
  isValidExpressResponse
};

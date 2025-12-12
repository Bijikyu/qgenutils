/**
 * Non-throwing string validation returning structured result.
 *
 * PURPOSE: Provides a non-throwing validation interface that returns a
 * structured result object. Suitable for API responses, form validation,
 * and batch processing scenarios where throwing is not appropriate.
 *
 * @param {object} input - Input object containing validation parameters
 * @param {*} input.str - Value to validate
 * @param {string} [input.fieldName] - Optional field name for context
 * @returns {{isValid: boolean}} Validation result object
 */

const validateInputString = require('./validateInputString');

function validateInputStringObj(input) {
  try {
    validateInputString(input.str, input.fieldName);
    return { isValid: true };
  } catch (error) {
    return { isValid: false };
  }
}

module.exports = validateInputStringObj;

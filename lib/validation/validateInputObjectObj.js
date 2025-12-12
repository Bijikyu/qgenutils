/**
 * Non-throwing object validation returning structured result.
 *
 * PURPOSE: Provides a non-throwing validation interface that returns a
 * structured result object. Suitable for API responses, form validation,
 * and batch processing scenarios where throwing is not appropriate.
 *
 * @param {object} input - Input object containing validation parameters
 * @param {*} input.obj - Value to validate
 * @param {string} [input.fieldName] - Optional field name for context
 * @returns {{isValid: boolean}} Validation result object
 */

const validateInputObject = require('./validateInputObject');

function validateInputObjectObj(input) {
  try {
    validateInputObject(input.obj, input.fieldName);
    return { isValid: true };
  } catch (error) {
    return { isValid: false };
  }
}

module.exports = validateInputObjectObj;

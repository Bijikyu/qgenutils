/**
 * Validate that input is a non-empty string, throwing on failure.
 *
 * PURPOSE: Provides a throwing validation interface for string validation,
 * complementing the boolean-returning isValidString. Useful for fail-fast
 * validation in API endpoints and business logic where invalid input should
 * halt execution immediately.
 *
 * DESIGN: Uses isValidString internally to maintain consistency with existing
 * validation logic. The fieldName parameter allows customizing error messages
 * for better debugging context.
 *
 * @param {*} str - Value to validate
 * @param {string} [fieldName='input'] - Name to include in error message
 * @throws {Error} If str is not a valid non-empty string
 */

const isValidString = require('./isValidString');

function validateInputString(str, fieldName = 'input') {
  if (!isValidString(str)) {
    throw new Error(`Invalid ${fieldName}: must be a non-empty string`);
  }
}

module.exports = validateInputString;

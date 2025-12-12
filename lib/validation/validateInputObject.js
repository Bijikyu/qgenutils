/**
 * Validate that input is a plain object, throwing on failure.
 *
 * PURPOSE: Provides a throwing validation interface for object validation,
 * complementing the boolean-returning isValidObject. Useful for fail-fast
 * validation in API endpoints and business logic where invalid input should
 * halt execution immediately.
 *
 * DESIGN: Uses isValidObject internally to maintain consistency with existing
 * validation logic. The fieldName parameter allows customizing error messages
 * for better debugging context.
 *
 * @param {*} obj - Value to validate
 * @param {string} [fieldName='input'] - Name to include in error message
 * @throws {Error} If obj is not a valid plain object
 */

const isValidObject = require('./isValidObject');

function validateInputObject(obj, fieldName = 'input') {
  if (!isValidObject(obj)) {
    throw new Error(`Invalid ${fieldName}: must be a plain object`);
  }
}

module.exports = validateInputObject;

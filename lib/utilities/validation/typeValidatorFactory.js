/**
 * Type validation factory utilities
 */

const { createSuccessResult, createErrorResult } = require('./resultCreators');

/**
 * Creates type validation functions
 * @param {string} type - Expected type name
 * @param {string} [errorKey] - Custom error key
 * @returns {Function} Type validator function
 */
const createTypeValidator = (type, errorKey) => (value) => {
  const typeCheck = {
    string: typeof value === 'string',
    number: typeof value === 'number' && !isNaN(value),
    boolean: typeof value === 'boolean',
    object: value !== null && typeof value === 'object' && !Array.isArray(value),
    array: Array.isArray(value)
  };

  return typeCheck[type] 
    ? createSuccessResult(value)
    : createErrorResult(errorKey || `not_${type}`, value);
};

module.exports = {
  createTypeValidator
};
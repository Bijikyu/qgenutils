'use strict';

/**
 * Validates required fields in request data
 * @param {Object} data - Request data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {{error: string, required: Array}|null} Validation error or null if valid
 * @example
 * validateRequired({ name: 'John' }, ['name', 'email']);
 * // { error: 'Missing required fields', required: ['email'] }
 */
function validateRequired(data, requiredFields) { // check all required fields are present
  if (!data || typeof data !== 'object') { // validate data is an object
    return {
      error: 'Invalid data object provided',
      required: requiredFields
    };
  }

  if (!Array.isArray(requiredFields)) { // validate requiredFields is array
    return {
      error: 'Required fields must be an array',
      required: []
    };
  }

  const missing = requiredFields.filter(field => // find missing fields
    data[field] === undefined || data[field] === null || data[field] === ''
  );

  if (missing.length > 0) { // return error if any missing
    return {
      error: 'Missing required fields',
      required: missing
    };
  }

  return null; // all fields present
}

module.exports = validateRequired;

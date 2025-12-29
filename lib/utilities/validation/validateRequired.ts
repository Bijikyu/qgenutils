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
import { createFieldValidator } from './createFieldValidator.js';

const isNonEmpty: any = (value) => value !== undefined && value !== null && value !== '';

const validateRequiredField = createFieldValidator(
  isNonEmpty,
  'is required',
  { allowEmptyStrings: false }
);

const validateRequired = (data, requiredFields: any): any => { // check all required fields are present
  if (!data || typeof data !== 'object') return {
    error: 'Invalid data object provided',
    required: requiredFields
  };

  if (!Array.isArray(requiredFields)) return {
    error: 'Required fields must be an array',
    required: []
  };

  const missing = requiredFields.filter(field => {
    const result: any = validateRequiredField(data[field], field);
    return result !== null;
  });

  return missing.length > 0 ? {
    error: 'Missing required fields',
    required: missing
  } : null;
};

export default validateRequired;

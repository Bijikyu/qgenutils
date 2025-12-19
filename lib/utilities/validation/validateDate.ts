'use strict';

import { createFieldValidator } from './createFieldValidator';

/**
 * Validates date field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateDate('2024-01-15', 'startDate'); // null
 * validateDate('invalid', 'startDate'); // { error: '...' }
 */
const validateDate = createFieldValidator(
  (value) => !isNaN(new Date(value).getTime()),
  'must be a valid date'
);

export default validateDate;

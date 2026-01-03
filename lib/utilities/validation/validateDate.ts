'use strict';

import validator from 'validator';
import { createFieldValidator } from './createFieldValidator.js';

/**
 * Validates date field using validator library
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateDate('2024-01-15', 'startDate'); // null
 * validateDate('invalid', 'startDate'); // { error: '...' }
 */
const validateDate = createFieldValidator(
  (value) => {
    if (typeof value !== 'string') {
      value = value.toString();
    }
    return validator.isDate(value) || validator.isISO8601(value);
  },
  'must be a valid date'
);

export default validateDate;

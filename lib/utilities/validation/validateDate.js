'use strict';

/**
 * Validates date field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateDate('2024-01-15', 'startDate'); // null
 * validateDate('invalid', 'startDate'); // { error: '...' }
 */
function validateDate(value, fieldName) { // check value is valid date
  const date = new Date(value); // parse date

  if (!isNaN(date.getTime())) { // valid date
    return null;
  }

  return { // invalid date
    error: `${fieldName || 'Value'} must be a valid date`
  };
}

module.exports = validateDate;

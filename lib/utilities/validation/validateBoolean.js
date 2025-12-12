'use strict';

/**
 * Validates boolean field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateBoolean(true, 'active'); // null
 * validateBoolean('yes', 'active'); // { error: '...' }
 */
function validateBoolean(value, fieldName) { // check value is boolean
  if (typeof value === 'boolean') { // valid boolean
    return null;
  }

  return { // not a boolean
    error: `${fieldName || 'Value'} must be true or false`
  };
}

module.exports = validateBoolean;

'use strict';

const { createTypeValidator } = require('./createFieldValidator');

/**
 * Validates boolean field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateBoolean(true, 'active'); // null
 * validateBoolean('yes', 'active'); // { error: '...' }
 */
const validateBoolean = createTypeValidator('boolean', 'must be true or false');

module.exports = validateBoolean;

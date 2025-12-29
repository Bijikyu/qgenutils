'use strict';

import { createTypeValidator } from './createFieldValidator.js';

/**
 * Validates boolean field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validateBoolean(true, 'active'); // null
 * validateBoolean('yes', 'active'); // { error: '...' }
 */
const validateBoolean: any = createTypeValidator('boolean', 'must be true or false');

export default validateBoolean;

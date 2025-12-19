'use strict';

const validator: any = require('validator'); // email validation library for industry-standard patterns

/**
 * Validate email address format and structure using RFC 5322 compliant validation
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 * @example
 * validateEmail('user@example.com') // returns true
 * validateEmail('invalid-email') // returns false
 */
import { createFieldValidator } from './createFieldValidator';

const validateEmail = createFieldValidator(
  (email: any): any => {
    if (!email || typeof email !== 'string') return false;
    const trimmedEmail: any = email.trim();
    return trimmedEmail.length === 0 || trimmedEmail.length > 254 ? false : validator.isEmail(trimmedEmail);
  },
  'must be a valid email address'
);

export default validateEmail;

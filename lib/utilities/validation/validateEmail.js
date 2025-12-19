'use strict';

const validator = require('validator'); // email validation library for industry-standard patterns

/**
 * Validate email address format and structure using RFC 5322 compliant validation
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 * @example
 * validateEmail('user@example.com') // returns true
 * validateEmail('invalid-email') // returns false
 */
const validateEmail = (email) => !email || typeof email !== 'string' ? false : (() => {const trimmedEmail = email.trim();return trimmedEmail.length === 0 || trimmedEmail.length > 254 ? false : validator.isEmail(trimmedEmail);})();

module.exports = validateEmail;

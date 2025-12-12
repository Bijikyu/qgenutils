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
function validateEmail(email) { // comprehensive email validation using validator library
  if (!email || typeof email !== 'string') { // check for email presence and string type
    return false; // invalid input rejection
  }

  const trimmedEmail = email.trim(); // normalize whitespace

  if (trimmedEmail.length === 0 || trimmedEmail.length > 254) { // RFC 5321 length limit
    return false; // reject empty or too-long emails
  }

  return validator.isEmail(trimmedEmail); // RFC 5322 email validation
}

module.exports = validateEmail;

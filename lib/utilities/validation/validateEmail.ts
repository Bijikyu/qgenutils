import validator from 'validator'; // email validation library for industry-standard patterns
import { createFieldValidator } from './createFieldValidator';
import { qerrors } from 'qerrors';

/**
 * Validate email address format and structure using RFC 5322 compliant validation
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 * @example
 * validateEmail('user@example.com') // returns true
 * validateEmail('invalid-email') // returns false
 */

const validateEmail = createFieldValidator(
  (email: string): boolean => {
    try {
      if (!email || typeof email !== 'string') return false;
      const trimmedEmail: string = email.trim();
      if (trimmedEmail.length === 0 || trimmedEmail.length > 254) return false;
      return validator.isEmail(trimmedEmail);
    } catch (err) {
      qerrors(err, 'validateEmail', `Email validation failed for input length: ${email?.length}`);
      return false;
    }
  },
  'must be a valid email address'
);

export default validateEmail;

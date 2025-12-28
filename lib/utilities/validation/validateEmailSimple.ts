/**
 * Direct Email Validation Implementation
 * Simplified without complex field validator abstraction
 */

import validator from 'validator'; // email validation library for industry-standard patterns
import { qerrors } from 'qerrors';
import logger from '../../logger.js';

/**
 * Validate email address format and structure using RFC 5322 compliant validation
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 * @example
 * validateEmail('user@example.com') // returns true
 * validateEmail('invalid-email') // returns false
 */
function validateEmail(email: any): boolean {
  logger.debug(`validateEmail is running with ${email}`);
  
  try {
    if (!email || typeof email !== 'string') {
      logger.debug(`validateEmail is returning false (invalid input type)`);
      return false;
    }
    
    const trimmedEmail: string = email.trim();
    
    if (trimmedEmail.length === 0) {
      logger.debug(`validateEmail is returning false (empty string)`);
      return false;
    }
    
    if (trimmedEmail.length > 254) {
      logger.debug(`validateEmail is returning false (too long: ${trimmedEmail.length})`);
      return false;
    }
    
    const isValid: boolean = validator.isEmail(trimmedEmail);
    
    logger.debug(`validateEmail is returning ${isValid}`);
    return isValid;
    
  } catch (err) {
    qerrors(err instanceof Error ? err : new Error(String(err)), 'validateEmail', `Email validation failed for input: ${email}`);
    logger.error(`validateEmail failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

export default validateEmail;
export { validateEmail };
/**
 * Email Validation - Direct validator.isEmail() wrapper
 * 
 * PURPOSE: Provides email validation using the validator library's RFC 5322
 * compliant implementation. This simplified wrapper maintains the existing
 * API while eliminating redundant code.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */

import validator from 'validator';

function validateEmail(email: any): boolean {
  // Input validation - validator handles most cases but we ensure string type
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Trim whitespace and let validator handle the rest
  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    return false;
  }
  
  // Direct call to validator.isEmail() - RFC 5322 compliant
  return validator.isEmail(trimmedEmail);
}

export default validateEmail;
export { validateEmail as validateEmailFormat };
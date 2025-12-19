'use strict';

/**
 * Validate password strength and complexity requirements
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, errors: string[], strength: string}} Validation result with details
 * @example
 * validatePassword('Weak') // returns { isValid: false, errors: ['too_short', ...], strength: 'very_weak' }
 * validatePassword('SecureP@ss1') // returns { isValid: true, errors: [], strength: 'strong' }
 */
function validatePassword(password) { // comprehensive password validation with strength requirements
  if (!password || typeof password !== 'string') { // check for password presence and string type
    return { isValid: false, errors: ['invalid_input'], strength: 'invalid' }; // invalid input rejection
  }

  const errors: any = []; // collect validation errors for user feedback

  const hasMinLength: any = password.length >= 8; // minimum 8 character requirement
  const hasMaxLength: any = password.length <= 128; // maximum 128 character limit
  const hasUpperCase: any = /[A-Z]/.test(password); // uppercase letter requirement
  const hasLowerCase: any = /[a-z]/.test(password); // lowercase letter requirement
  const hasNumbers: any = /\d/.test(password); // numeric character requirement
  const hasSpecialChar: any = /[!@#$%^&*(),.?":{}|<>]/.test(password); // special character requirement

  if (!hasMinLength) errors.push('too_short'); // add length error
  if (!hasMaxLength) errors.push('too_long'); // add max length error
  if (!hasUpperCase) errors.push('no_uppercase'); // add uppercase error
  if (!hasLowerCase) errors.push('no_lowercase'); // add lowercase error
  if (!hasNumbers) errors.push('no_number'); // add number error
  if (!hasSpecialChar) errors.push('no_special'); // add special character error

  const isValid: any = errors.length === 0; // password is valid if no errors

  let strength = 'strong'; // default to strong if valid
  if (!isValid) {
    strength = errors.length <= 2 ? 'weak' : 'very_weak'; // assess password strength based on error count
  }

  return { isValid, errors, strength }; // return comprehensive validation result
}

export default validatePassword;

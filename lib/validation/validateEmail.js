/**
 * Validate Email Address Format Using Standard Email Regex
 * 
 * RATIONALE: Email validation is critical for user registration, notifications,
 * and authentication systems. This function provides consistent email format
 * validation with security-first sanitization and detailed error reporting.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use standard email regex that handles most common valid email formats
 * - Sanitize input to remove potentially dangerous characters
 * - Provide clear error messages for different validation failures
 * - Log validation attempts for security monitoring and debugging
 * - Follow established codebase patterns for error handling
 * 
 * EMAIL VALIDATION RULES:
 * - Must contain exactly one @ symbol
 * - Must have characters before and after @ symbol
 * - Domain must contain at least one dot
 * - No whitespace characters allowed
 * - Basic format: localpart@domain.extension
 * 
 * SECURITY CONSIDERATIONS:
 * - Input sanitization prevents injection attacks
 * - Logging helps detect validation bypass attempts
 * - Consistent error messages prevent email enumeration
 * - Fail-fast approach stops invalid data early
 * 
 * @param {string} email - Email address to validate
 * @returns {string} Empty string if valid, descriptive error message if invalid
 * @throws Never throws - returns error message on validation failure
 */

// 🔗 Tests: validateEmail → email format validation → regex matching
// Defensive require for qerrors to prevent test environment failures
let qerrors;
try {
  const qerrorsModule = require('qerrors');
  qerrors = qerrorsModule && qerrorsModule.qerrors ? qerrorsModule.qerrors : (qerrorsModule && qerrorsModule.default) ? qerrorsModule.default : qerrorsModule;
} catch (err) {
  // Provide a no-op fallback so tests won't fail if qerrors is absent
  qerrors = function () { /* no-op error reporter for test envs */ };
}

const sanitizeString = require('../utilities/string/sanitizeString');
const isValidString = require('./isValidString');
const localVars = require('../../config/localVars');

function validateEmail(email) {
  if (!isValidString(email)) {
    const errorMsg = `Email address is required`;
    qerrors(new Error(`Email validation failed - missing or invalid input`), `validateEmail`, {
      email,
      inputType: typeof email,
      errorMsg
    });
    return errorMsg;
  }
  
  const sanitizedEmail = sanitizeString(email);
  
  if (!sanitizedEmail.trim()) {
    const errorMsg = `Email address is required`;
    qerrors(new Error(`Email validation failed - empty after sanitization`), `validateEmail`, {
      originalEmail: email,
      sanitizedEmail,
      errorMsg
    });
    return errorMsg;
  }
  
  // Use centralized email regex from localVars
  const emailRegex = localVars.EMAIL_REGEX;
  
  if (!emailRegex.test(sanitizedEmail)) {
    const errorMsg = `Please enter a valid email address`;
    qerrors(new Error(`Email validation failed - invalid format`), `validateEmail`, {
      email: sanitizedEmail,
      regexPattern: emailRegex.source,
      errorMsg
    });
    return errorMsg;
  }
  
  // Email is valid
  return ``;
}

module.exports = validateEmail;
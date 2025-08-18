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

const { qerrors } = require('qerrors');
const sanitizeString = require('../../utilities/string/sanitizeString');

function validateEmail(email) {
  console.log(`validateEmail is running with email: ${email}`);
  
  if (!email || typeof email !== 'string') {
    const errorMsg = "Email address is required";
    console.log(`validateEmail is returning error: ${errorMsg}`);
    qerrors(new Error('Email validation failed - missing or invalid input'), 'validateEmail', {
      email,
      inputType: typeof email,
      errorMsg
    });
    return errorMsg;
  }
  
  const sanitizedEmail = sanitizeString(email);
  
  if (!sanitizedEmail.trim()) {
    const errorMsg = "Email address is required";
    console.log(`validateEmail is returning error: ${errorMsg}`);
    qerrors(new Error('Email validation failed - empty after sanitization'), 'validateEmail', {
      originalEmail: email,
      sanitizedEmail,
      errorMsg
    });
    return errorMsg;
  }
  
  // Standard email regex pattern that handles most common valid email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    const errorMsg = "Please enter a valid email address";
    console.log(`validateEmail is returning error: ${errorMsg}`);
    qerrors(new Error('Email validation failed - invalid format'), 'validateEmail', {
      sanitizedEmail,
      errorMsg,
      pattern: emailRegex.toString()
    });
    return errorMsg;
  }
  
  console.log(`validateEmail is returning success (empty string)`);
  qerrors(new Error('Email validation succeeded'), 'validateEmail', {
    sanitizedEmail
  });
  
  return ""; // Empty string indicates successful validation
}

module.exports = validateEmail;
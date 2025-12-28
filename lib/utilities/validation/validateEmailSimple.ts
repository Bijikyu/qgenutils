/**
 * Direct Email Validation Implementation - Simplified RFC 5322 Compliant Validation
 * 
 * PURPOSE: Provides straightforward email address validation without the complexity
 * of field validator abstractions. This implementation focuses on reliability,
 * performance, and comprehensive error handling for production use.
 * 
 * SIMPLIFIED ARCHITECTURE: By avoiding complex abstractions, this implementation
 * reduces the attack surface and potential points of failure. The direct approach
 * makes the code more maintainable and easier to audit for security issues.
 * 
 * VALIDATION STANDARDS: Uses the validator library which implements RFC 5322
 * compliant email validation. This ensures industry-standard pattern recognition
 * while maintaining compatibility with international email formats.
 * 
 * SECURITY CONSIDERATIONS:
 * - Input type checking prevents injection attacks
 * - Length validation prevents buffer overflow attacks
 * - Trimming removes potential whitespace-based attacks
 * - Fail-safe approach returns false for all error conditions
 * - Comprehensive logging for security monitoring and debugging
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Early returns for invalid input types
 * - Length validation before expensive regex operations
 * - Minimal object creation and memory allocation
 * - Efficient string operations with built-in methods
 * 
 * @param {string} email - Email address to validate (must be string type)
 * @returns {boolean} True if email is valid according to RFC 5322 standards, false otherwise
 * 
 * @example
 * // Valid email addresses
 * validateEmail('user@example.com') // returns true
 * validateEmail('user.name@domain.co.uk') // returns true
 * validateEmail('user+tag@example.org') // returns true
 * 
 * @example
 * // Invalid email addresses
 * validateEmail('invalid-email') // returns false
 * validateEmail('') // returns false
 * validateEmail(null) // returns false
 * validateEmail(123) // returns false
 */

import validator from 'validator'; // email validation library for industry-standard patterns and RFC 5322 compliance
import { qerrors } from 'qerrors'; // standardized error reporting and logging across the application
import logger from '../../logger.js'; // centralized logging for debugging and monitoring

function validateEmail(email: any): boolean {
  // Log the start of validation for debugging and monitoring purposes
  logger.debug(`validateEmail is running with ${email}`);
  
  try {
    // Input type validation - ensure we're working with a string
    if (!email || typeof email !== 'string') {
      logger.debug(`validateEmail is returning false (invalid input type)`);
      return false;
    }
    
    // Remove leading/trailing whitespace to prevent whitespace-based attacks
    const trimmedEmail: string = email.trim();
    
    // Empty string validation after trimming
    if (trimmedEmail.length === 0) {
      logger.debug(`validateEmail is returning false (empty string)`);
      return false;
    }
    
    // Length validation - RFC 5321 specifies maximum email length of 254 characters
    // This prevents buffer overflow attacks and ensures compatibility with email systems
    if (trimmedEmail.length > 254) {
      logger.debug(`validateEmail is returning false (too long: ${trimmedEmail.length})`);
      return false;
    }
    
    // Use validator library for RFC 5322 compliant email validation
    // This handles complex email patterns including international domains
    const isValid: boolean = validator.isEmail(trimmedEmail);
    
    // Log the result for debugging and monitoring
    logger.debug(`validateEmail is returning ${isValid}`);
    return isValid;
    
  } catch (err) {
    // Comprehensive error handling with standardized error reporting
    qerrors(err instanceof Error ? err : new Error(String(err)), 'validateEmail', `Email validation failed for input: ${email}`);
    
    // Log the error for debugging and monitoring
    logger.error(`validateEmail failed: ${err instanceof Error ? err.message : String(err)}`);
    
    // Fail-safe approach - always return false on errors to prevent security issues
    return false;
  }
}

export default validateEmail;
export { validateEmail };
/**
 * EMAIL VALIDATION UTILITY
 * 
 * PURPOSE: Provides comprehensive email address validation following RFC 5322 standards.
 * This utility is designed to be robust, secure, and production-ready with proper error
 * handling and extensive input sanitization.
 * 
 * SECURITY CONSIDERATIONS:
 * - Never throws exceptions, always returns boolean for consistent behavior
 * - Handles malicious input gracefully without exposing internal details
 * - Uses industry-standard validation patterns to prevent edge cases
 * - Includes length limits to prevent DoS attacks via extremely long inputs
 * 
 * VALIDATION CRITERIA:
 * - RFC 5322 compliant email format validation
 * - Length restrictions (max 254 characters per RFC 5322)
 * - Proper handling of whitespace and empty inputs
 * - Type safety for TypeScript usage
 * 
 * PERFORMANCE NOTES:
 * - Uses optimized validator library for industry-standard patterns
 * - Early returns for common invalid cases to minimize processing
 * - Minimal string operations for better performance
 */

import validator from 'validator'; // Email validation library implementing RFC 5322 standards
import { qerrors } from 'qerrors'; // Centralized error handling system
import logger from '../../logger.js'; // Structured logging for debugging and monitoring

/**
 * Validates an email address format and structure using RFC 5322 compliant validation.
 * 
 * This function performs comprehensive email validation including format checking,
 * length validation, and proper handling of edge cases. It's designed to be
 * defensive against malicious input while providing clear feedback about validity.
 * 
 * @param email - The email address to validate. Can be any type but only strings
 *                can be valid. Non-string inputs are automatically rejected.
 * 
 * @returns boolean - Returns true if the email is valid according to RFC 5322 standards,
 *                    false otherwise. Never throws exceptions.
 * 
 * @example
 * ```typescript
 * // Valid emails
 * validateEmail('user@example.com')        // returns true
 * validateEmail('john.doe+tag@domain.co.uk') // returns true
 * validateEmail('   spaced@example.com   ') // returns true (whitespace trimmed)
 * 
 * // Invalid emails
 * validateEmail('invalid-email')           // returns false
 * validateEmail('')                        // returns false
 * validateEmail(null)                      // returns false
 * validateEmail(undefined)                 // returns false
 * validateEmail(123)                       // returns false
 * validateEmail('a'.repeat(300))           // returns false (too long)
 * ```
 * 
 * @see RFC 5322 for email address specifications
 * @see validator library for implementation details
 */
const validateEmail = (email: any): boolean => {
  logger.debug(`validateEmail is running with input of type: ${typeof email}`);
  try {
    if (!email || typeof email !== 'string') {
      logger.debug(`validateEmail is returning false (invalid input type: ${typeof email})`);
      return false;
    }
    const trimmedEmail: string = email.trim();
    if (trimmedEmail.length === 0) {
      logger.debug(`validateEmail is returning false (empty string after trimming)`);
      return false;
    }
    if (trimmedEmail.length > 254) {
      logger.debug(`validateEmail is returning false (too long: ${trimmedEmail.length} chars, max 254)`);
      return false;
    }
    const isValid: boolean = validator.isEmail(trimmedEmail);
    logger.debug(`validateEmail is returning ${isValid} for email: ${trimmedEmail.substring(0, 50)}${trimmedEmail.length > 50 ? '...' : ''}`);
    return isValid;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    qerrors(err instanceof Error ? err : new Error(String(err)), 'validateEmail', `Email validation failed for input: ${typeof email === 'string' ? email.substring(0, 50) : String(email)}`);
    logger.error(`validateEmail failed: ${errorMessage}`);
    return false;
  }
};

export default validateEmail;

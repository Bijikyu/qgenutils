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

// Cache for validated emails to improve performance
const emailCache = new Map<string, boolean>();
const MAX_CACHE_SIZE = 1000;

function validateEmail(email: any): boolean {
  try {
    // Input type validation - ensure we're working with a string
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // Remove leading/trailing whitespace to prevent whitespace-based attacks
    const trimmedEmail: string = email.trim();
    
    // Empty string validation after trimming
    if (trimmedEmail.length === 0) {
      return false;
    }
    
    // Length validation - RFC 5321 specifies maximum email length of 254 characters
    // This prevents buffer overflow attacks and ensures compatibility with email systems
    if (trimmedEmail.length > 254) {
      return false;
    }

    // Check cache first for performance
    if (emailCache.has(trimmedEmail)) {
      return emailCache.get(trimmedEmail)!;
    }
    
    // Use validator library for RFC 5322 compliant email validation
    // This handles complex email patterns including international domains
    const isValid: boolean = validator.isEmail(trimmedEmail);
    
    // Cache result (with size limit to prevent memory issues)
    if (emailCache.size >= MAX_CACHE_SIZE) {
      // Clear oldest entries when cache is full
      const firstKey = emailCache.keys().next().value;
      emailCache.delete(firstKey);
    }
    emailCache.set(trimmedEmail, isValid);
    
    return isValid;
    
  } catch (err) {
    // Comprehensive error handling with standardized error reporting
    qerrors(err instanceof Error ? err : new Error(String(err)), 'validateEmail', `Email validation failed for input: ${email}`);
    
    // Fail-safe approach - always return false on errors to prevent security issues
    return false;
  }
}

export default validateEmail;
export { validateEmail as validateEmailFormat };
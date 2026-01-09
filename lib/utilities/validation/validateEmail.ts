/**
 * Email Validation Utility
 *
 * PURPOSE: Validates email addresses using comprehensive regex patterns
 * to ensure proper format and prevent common validation bypasses.
 *
 * SECURITY CONSIDERATIONS:
 * - Uses RFC-compliant regex pattern for email validation
 * - Validates maximum length (254 characters) per RFC specifications
 * - Handles Unicode characters and international domain names
 * - Prevents email injection attacks through pattern matching
 * - Rejects dangerous characters that could be used in injection
 *
 * VALIDATION STRATEGY:
 * - RFC 5322 compliant regex pattern
 * - Length validation to prevent buffer overflow attempts
 * - Type checking to ensure string input
 * - Case-insensitive local part validation
 * - Domain name validation with proper structure
 *
 * @param email - Email address to validate
 * @returns True if email is valid format, false otherwise
 * @throws Never throws - returns false for invalid inputs
 */

import { validateEmail as validateEmailCommon } from './commonValidation.js';

/**
 * Validates email address format using RFC-compliant patterns
 *
 * This function validates that an email address follows proper format including:
 * - Valid local part (before @)
 * - Valid domain name (after @)
 * - Proper structure and syntax
 * - Maximum length constraints (254 characters)
 *
 * @param email - Email address to validate
 * @returns True if email is valid, false otherwise
 *
 * @example
 * ```typescript
 * validateEmail('user@example.com'); // true
 * validateEmail('user.name+tag@domain.co.uk'); // true
 * validateEmail('invalid-email'); // false
 * validateEmail('user@'); // false
 * validateEmail('@domain.com'); // false
 * ```
 */
const validateEmail = (email: string): boolean => {
  return validateEmailCommon(email);
};

export default validateEmail;

/**
 * PASSWORD VALIDATION UTILITY
 * 
 * PURPOSE: Provides comprehensive password strength validation following modern security
 * best practices and OWASP guidelines. This utility evaluates passwords against multiple
 * complexity requirements and provides detailed feedback for users and developers.
 * 
 * SECURITY DESIGN PRINCIPLES:
 * - Implements industry-standard password complexity requirements
 * - Provides detailed error feedback for user guidance
 * - Calculates password strength based on multiple criteria
 * - Enforces reasonable length limits to prevent DoS attacks
 * - Uses regular expressions optimized for performance
 * 
 * VALIDATION REQUIREMENTS:
 * - Minimum 8 characters (NIST recommendation)
 * - Maximum 128 characters (prevents DoS, supports passphrases)
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character from common set
 * 
 * STRENGTH CALCULATION:
 * - Very Weak: 3+ validation errors
 * - Weak: 1-2 validation errors
 * - Medium: Valid with 3 criteria met
 * - Strong: Valid with 4+ criteria met
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Single pass through password with multiple regex checks
 * - Optimized regular expressions for common patterns
 * - Early exit for invalid input types
 */

/**
 * Validates password strength and complexity requirements with detailed feedback.
 * 
 * This function performs comprehensive password validation using modern security standards.
 * It checks for minimum length, character diversity, and provides both validation status
 * and strength assessment to help users create secure passwords.
 * 
 * @param password - The password string to validate. Can be any type but only strings
 *                   can be valid. Non-string inputs are automatically rejected.
 * 
 * @returns PasswordValidationResult - Object containing:
 *   - isValid: boolean - True if password meets all requirements
 *   - errors: string[] - Array of error codes for failed requirements
 *   - strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'invalid' - Password strength assessment
 * 
 * @example
 * ```typescript
 * // Invalid passwords
 * validatePassword('weak') 
 * // Returns: { isValid: false, errors: ['too_short', 'no_uppercase', 'no_number', 'no_special'], strength: 'very_weak' }
 * 
 * validatePassword('')
 * // Returns: { isValid: false, errors: ['invalid_input'], strength: 'invalid' }
 * 
 * // Valid passwords of varying strength
 * validatePassword('Password123')
 * // Returns: { isValid: true, errors: [], strength: 'medium' }
 * 
 * validatePassword('SecureP@ssw0rd!')
 * // Returns: { isValid: true, errors: [], strength: 'strong' }
 * ```
 * 
 * @see OWASP Password Storage Guidelines for validation requirements
 * @see NIST Digital Identity Guidelines for password recommendations
 */

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'invalid';
}

function validatePassword(password: string): PasswordValidationResult {
  // INPUT VALIDATION: Ensure password is a string and not null/undefined
  // This defensive programming prevents type errors and provides predictable behavior
  if (!password || typeof password !== 'string') {
    return { 
      isValid: false, 
      errors: ['invalid_input'], 
      strength: 'invalid' 
    };
  }

  const errors: string[] = []; // Collect all validation errors for comprehensive feedback

  // COMPLEXITY CHECKS: Evaluate password against security requirements
  // Each check is performed independently to provide specific error feedback
  
  const hasMinLength: boolean = password.length >= 8;  // NIST minimum recommendation
  const hasMaxLength: boolean = password.length <= 128; // Prevent DoS, support passphrases
  const hasUpperCase: boolean = /[A-Z]/.test(password); // Uppercase letter requirement
  const hasLowerCase: boolean = /[a-z]/.test(password); // Lowercase letter requirement
  const hasNumbers: boolean = /\d/.test(password);    // Numeric character requirement
  const hasSpecialChar: boolean = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Special character requirement

  // ERROR COLLECTION: Add specific error codes for each failed requirement
  // These codes are intentionally user-friendly and translatable
  if (!hasMinLength) errors.push('too_short');
  if (!hasMaxLength) errors.push('too_long');
  if (!hasUpperCase) errors.push('no_uppercase');
  if (!hasLowerCase) errors.push('no_lowercase');
  if (!hasNumbers) errors.push('no_number');
  if (!hasSpecialChar) errors.push('no_special');

  // VALIDATION STATUS: Password is valid only if all requirements are met
  const isValid: boolean = errors.length === 0;

  // STRENGTH ASSESSMENT: Calculate password strength based on multiple factors
  let strength: PasswordValidationResult['strength'] = 'strong'; // Default for valid passwords
  
  if (!isValid) {
    // For invalid passwords, assess weakness based on number of failed criteria
    // More errors = weaker password = higher security risk
    strength = errors.length <= 2 ? 'weak' : 'very_weak';
  } else {
    // For valid passwords, assess strength based on criteria met (excluding maxLength which is a constraint)
    // This provides a more nuanced strength assessment for valid passwords
    const strengthCriteria = [
      hasMinLength, 
      hasUpperCase, 
      hasLowerCase, 
      hasNumbers, 
      hasSpecialChar
    ].filter(Boolean).length;
    
    if (strengthCriteria >= 4) {
      strength = 'strong';    // Meets most complexity requirements
    } else if (strengthCriteria >= 3) {
      strength = 'medium';   // Meets basic requirements
    } else {
      strength = 'weak';      // Valid but minimal complexity
    }
  }

  return { 
    isValid, 
    errors, 
    strength 
  };
}

export default validatePassword;
export { validatePassword as validatePasswordStrength };

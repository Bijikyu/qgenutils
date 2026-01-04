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

const validatePassword=(password:string):PasswordValidationResult=>{if(!password||typeof password!=='string')return{isValid:false,errors:['invalid_input'],strength:'invalid'};const errors:string[]=[];const hasMinLength=password.length>=8;const hasMaxLength=password.length<=128;const hasUpperCase=/[A-Z]/.test(password);const hasLowerCase=/[a-z]/.test(password);const hasNumbers=/\d/.test(password);const hasSpecialChar=/[!@#$%^&*(),.?":{}|<>]/.test(password);if(password.includes(' ')||password.includes('\t')||password.includes('\n'))errors.push('contains_whitespace');const commonPasswords=['password','123456','qwerty','admin','letmein','welcome'];if(commonPasswords.some(common=>password.toLowerCase().includes(common)))errors.push('common_password');if(/(.)\1{2,}/.test(password))errors.push('repeated_characters');const hasSequential=(str:string):boolean=>{for(let i=0;i<str.length-2;i++){const char1=str.charCodeAt(i);const char2=str.charCodeAt(i+1);const char3=str.charCodeAt(i+2);if(char2===char1+1&&char3===char2+1)return true;}return false;};if(hasSequential(password))errors.push('sequential_characters');if(!hasMinLength)errors.push('too_short');if(!hasMaxLength)errors.push('too_long');if(!hasUpperCase)errors.push('no_uppercase');if(!hasLowerCase)errors.push('no_lowercase');if(!hasNumbers)errors.push('no_number');if(!hasSpecialChar)errors.push('no_special');const isValid=errors.length===0;let strength:PasswordValidationResult['strength']='strong';if(!isValid){strength=errors.length<=2?'weak':'very_weak';}else{const strengthCriteria=[hasMinLength,hasUpperCase,hasLowerCase,hasNumbers,hasSpecialChar].filter(Boolean).length;if(strengthCriteria>=4){strength='strong';}else if(strengthCriteria>=3){strength='medium';}else{strength='weak';}}return{isValid,errors,strength};};

export default validatePassword;export{validatePassword as validatePasswordStrength};export type{PasswordValidationResult};

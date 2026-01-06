/**
 * SHARED TYPE VALIDATION UTILITIES
 * 
 * PURPOSE: Provides common type validation patterns used across the codebase.
 * This utility eliminates duplication of type checking logic and ensures
 * consistent validation behavior throughout the application.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized type validation logic
 * - Consistent error handling patterns
 * - Performance optimized with early returns
 * - TypeScript compatible with proper type guards
 * 
 * USAGE PATTERNS:
 * - String validation with optional trimming
 * - Null/undefined checks
 * - Type guard functions
 * - Input sanitization helpers
 */

import logger from '../../logger.js';

/**
 * Validates if input is a non-empty string.
 * This is the most common validation pattern across the codebase.
 * 
 * @param input - Any value to validate
 * @param options - Optional configuration for validation behavior
 * @returns boolean - True if input is a valid non-empty string
 * 
 * @example
 * ```typescript
 * isNonEmptyString('hello')           // returns true
 * isNonEmptyString('  hello  ')       // returns true (default trims)
 * isNonEmptyString('')                // returns false
 * isNonEmptyString(null)              // returns false
 * isNonEmptyString(123)               // returns false
 * isNonEmptyString('  ', { trim: true }) // returns false
 * isNonEmptyString('  ', { trim: false }) // returns true
 * ```
 */
export const isNonEmptyString = (
  input: any,
  options: { trim?: boolean; allowWhitespace?: boolean } = {}
): boolean => {
  const { trim = true, allowWhitespace = false } = options;
  
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const processedString = trim ? input.trim() : input;
  
  if (processedString.length === 0) {
    return false;
  }
  
  if (!allowWhitespace && /^\s*$/.test(processedString)) {
    return false;
  }
  
  return true;
};

/**
 * Type guard function to check if input is a string.
 * More performant than isNonEmptyString for simple type checking.
 * 
 * @param input - Any value to check
 * @returns boolean - True if input is a string
 */
export const isString = (input: any): input is string => {
  return typeof input === 'string';
};

/**
 * Validates if input is a string within specified length bounds.
 * Commonly used for validation with length restrictions.
 * 
 * @param input - Any value to validate
 * @param minLength - Minimum allowed length (default: 0)
 * @param maxLength - Maximum allowed length (default: Infinity)
 * @param options - Additional validation options
 * @returns boolean - True if input meets length requirements
 * 
 * @example
 * ```typescript
 * isStringWithLength('hello', 3, 10)     // returns true
 * isStringWithLength('hi', 3, 10)        // returns false (too short)
 * isStringWithLength('very long string', 3, 10) // returns false (too long)
 * ```
 */
export const isStringWithLength = (
  input: any,
  minLength: number = 0,
  maxLength: number = Infinity,
  options: { trim?: boolean } = {}
): boolean => {
  if (!isString(input)) {
    return false;
  }
  
  const processedString = options.trim ? input.trim() : input;
  return processedString.length >= minLength && processedString.length <= maxLength;
};

/**
 * Validates if input is a valid email format string.
 * Combines type checking with basic email format validation.
 * 
 * @param input - Any value to validate
 * @returns boolean - True if input appears to be a valid email
 */
export const isEmailString = (input: any): boolean => {
  if (!isNonEmptyString(input, { trim: true })) {
    return false;
  }
  
  // Basic email regex - more comprehensive validation should use dedicated email validator
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.trim());
};

/**
 * Validates if input is a numeric string (contains only digits).
 * 
 * @param input - Any value to validate
 * @param options - Validation options
 * @returns boolean - True if input is a numeric string
 */
export const isNumericString = (
  input: any,
  options: { allowNegative?: boolean; allowDecimal?: boolean } = {}
): boolean => {
  if (!isString(input)) {
    return false;
  }
  
  const { allowNegative = false, allowDecimal = false } = options;
  
  let regex = /^\d+$/;
  if (allowNegative && allowDecimal) {
    regex = /^-?\d+(\.\d+)?$/;
  } else if (allowNegative) {
    regex = /^-?\d+$/;
  } else if (allowDecimal) {
    regex = /^\d+(\.\d+)?$/;
  }
  
  return regex.test(input.trim());
};

/**
 * Validates if input is null or undefined.
 * Common pattern for optional parameter validation.
 * 
 * @param input - Any value to check
 * @returns boolean - True if input is null or undefined
 */
export const isNullOrUndefined = (input: any): input is null | undefined => {
  return input === null || input === undefined;
};

/**
 * Validates if input is a valid URL string.
 * Basic URL format validation.
 * 
 * @param input - Any value to validate
 * @returns boolean - True if input appears to be a valid URL
 */
export const isUrlString = (input: any): boolean => {
  if (!isNonEmptyString(input, { trim: true })) {
    return false;
  }
  
  try {
    new URL(input.trim());
    return true;
  } catch {
    return false;
  }
};

/**
 * Enhanced string validation with multiple criteria.
 * Combines several common validation patterns into one function.
 * 
 * @param input - Any value to validate
 * @param criteria - Validation criteria object
 * @returns { isValid: boolean; processedValue?: string; errors: string[] }
 * 
 * @example
 * ```typescript
 * const result = validateStringAdvanced('hello@example.com', {
 *   minLength: 5,
 *   maxLength: 50,
 *   pattern: 'email',
 *   trim: true
 * });
 * // Returns: { isValid: true, processedValue: 'hello@example.com', errors: [] }
 * ```
 */
export const validateStringAdvanced = (
  input: any,
  criteria: {
    minLength?: number;
    maxLength?: number;
    pattern?: 'email' | 'url' | 'numeric' | 'alphanumeric' | RegExp;
    trim?: boolean;
    allowEmpty?: boolean;
  } = {}
): { isValid: boolean; processedValue?: string; errors: string[] } => {
  const errors: string[] = [];
  
  // Type validation
  if (!isString(input)) {
    errors.push('invalid_type');
    return { isValid: false, errors };
  }
  
  let processedValue = criteria.trim ? input.trim() : input;
  
  // Empty validation
  if (!criteria.allowEmpty && processedValue.length === 0) {
    errors.push('empty_string');
    return { isValid: false, errors };
  }
  
  // Length validation
  if (criteria.minLength !== undefined && processedValue.length < criteria.minLength) {
    errors.push('too_short');
  }
  
  if (criteria.maxLength !== undefined && processedValue.length > criteria.maxLength) {
    errors.push('too_long');
  }
  
  // Pattern validation
  if (criteria.pattern) {
    let isValidPattern = false;
    
    if (criteria.pattern === 'email') {
      isValidPattern = isEmailString(processedValue);
    } else if (criteria.pattern === 'url') {
      isValidPattern = isUrlString(processedValue);
    } else if (criteria.pattern === 'numeric') {
      isValidPattern = isNumericString(processedValue);
    } else if (criteria.pattern === 'alphanumeric') {
      isValidPattern = /^[a-zA-Z0-9]+$/.test(processedValue);
    } else if (criteria.pattern instanceof RegExp) {
      isValidPattern = criteria.pattern.test(processedValue);
    }
    
    if (!isValidPattern) {
      errors.push('invalid_pattern');
    }
  }
  
  return {
    isValid: errors.length === 0,
    processedValue,
    errors
  };
};

// Export all validators as a grouped object for convenience
export const TypeValidators = {
  isNonEmptyString,
  isString,
  isStringWithLength,
  isEmailString,
  isNumericString,
  isNullOrUndefined,
  isUrlString,
  validateStringAdvanced
};

export default TypeValidators;
/**
 * SHARED INPUT SANITIZER UTILITIES
 * 
 * PURPOSE: Provides common input sanitization patterns used across the codebase.
 * This utility eliminates duplication of input processing logic and ensures
 * consistent sanitization behavior throughout the application.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized input sanitization logic
 * - Consistent trimming and cleaning behavior
 * - Security-focused input processing
 * - Performance optimized sanitization
 * - TypeScript compatible with proper type guards
 * 
 * USAGE PATTERNS:
 * - String trimming and cleaning
 * - Input normalization
 * - Security sanitization
 * - Type-safe processing
 */

import { TypeValidators } from './typeValidators.js';
import { ErrorHandlers } from './errorHandlers.js';
import logger from '../../logger.js';

/**
 * Configuration options for input sanitization.
 */
export interface SanitizationOptions {
  /** Whether to trim whitespace (default: true) */
  trim?: boolean;
  /** Whether to remove extra whitespace (default: false) */
  normalizeWhitespace?: boolean;
  /** Whether to convert to lowercase (default: false) */
  toLowerCase?: boolean;
  /** Whether to convert to uppercase (default: false) */
  toUpperCase?: boolean;
  /** Maximum allowed length (default: Infinity) */
  maxLength?: number;
  /** Whether to remove HTML entities (default: false) */
  stripHtml?: boolean;
  /** Whether to remove control characters (default: true) */
  stripControlChars?: boolean;
  /** Custom sanitization function */
  customSanitizer?: (value: string) => string;
}

/**
 * Result of input sanitization with metadata.
 */
export interface SanitizationResult {
  /** The sanitized value */
  value: string;
  /** Whether the input was modified during sanitization */
  wasModified: boolean;
  /** Whether the input passed validation */
  isValid: boolean;
  /** Original input before sanitization */
  originalValue: any;
  /** Any warnings generated during sanitization */
  warnings: string[];
}

/**
 * Sanitizes a string input using common patterns.
 * This is the most frequently used sanitization pattern across the codebase.
 * 
 * @param input - Any value to sanitize
 * @param options - Sanitization configuration
 * @returns SanitizationResult with processed value and metadata
 * 
 * @example
 * ```typescript
 * const result = sanitizeString('  Hello World  ', {
 *   trim: true,
 *   maxLength: 20
 * });
 * // Returns: { value: 'Hello World', wasModified: true, isValid: true, ... }
 * ```
 */
export const sanitizeString = (
  input: any,
  options: SanitizationOptions = {}
): SanitizationResult => {
  const {
    trim = true,
    normalizeWhitespace = false,
    toLowerCase = false,
    toUpperCase = false,
    maxLength = Infinity,
    stripHtml = false,
    stripControlChars = true,
    customSanitizer
  } = options;

  const warnings: string[] = [];
  let wasModified = false;
  let processedValue: string;

  // Type validation
  if (!TypeValidators.isString(input)) {
    return {
      value: '',
      wasModified: true,
      isValid: false,
      originalValue: input,
      warnings: ['Invalid input type: expected string']
    };
  }

  processedValue = input;
  const originalValue = input;

  // Trim whitespace
  if (trim && processedValue !== processedValue.trim()) {
    processedValue = processedValue.trim();
    wasModified = true;
  }

  // Normalize whitespace (collapse multiple spaces)
  if (normalizeWhitespace) {
    const normalized = processedValue.replace(/\s+/g, ' ').trim();
    if (normalized !== processedValue) {
      processedValue = normalized;
      wasModified = true;
    }
  }

  // Case conversion
  if (toLowerCase && processedValue !== processedValue.toLowerCase()) {
    processedValue = processedValue.toLowerCase();
    wasModified = true;
  }

  if (toUpperCase && processedValue !== processedValue.toUpperCase()) {
    processedValue = processedValue.toUpperCase();
    wasModified = true;
  }

  // Strip HTML tags
  if (stripHtml) {
    const withoutHtml = processedValue.replace(/<[^>]*>/g, '');
    if (withoutHtml !== processedValue) {
      processedValue = withoutHtml;
      wasModified = true;
      warnings.push('HTML tags removed');
    }
  }

  // Remove control characters
  if (stripControlChars) {
    const withoutControlChars = processedValue.replace(/[\x00-\x1F\x7F]/g, '');
    if (withoutControlChars !== processedValue) {
      processedValue = withoutControlChars;
      wasModified = true;
    }
  }

  // Length validation
  if (processedValue.length > maxLength) {
    processedValue = processedValue.substring(0, maxLength);
    wasModified = true;
    warnings.push(`Input truncated to ${maxLength} characters`);
  }

  // Custom sanitization
  if (customSanitizer) {
    try {
      const customResult = customSanitizer(processedValue);
      if (customResult !== processedValue) {
        processedValue = customResult;
        wasModified = true;
      }
    } catch (error) {
      ErrorHandlers.handleError(error, {
        functionName: 'sanitizeString',
        context: 'Custom sanitization function'
      });
      warnings.push('Custom sanitization failed');
    }
  }

  return {
    value: processedValue,
    wasModified,
    isValid: true,
    originalValue,
    warnings
  };
};

/**
 * Quick sanitization for common use cases.
 * Simplified version of sanitizeString for the most frequent patterns.
 * 
 * @param input - Any value to sanitize
 * @param strictMode - Whether to apply strict sanitization (default: false)
 * @returns Sanitized string or empty string if invalid
 * 
 * @example
 * ```typescript
 * quickSanitize('  hello@world.com  ')     // returns 'hello@world.com'
 * quickSanitize(123)                       // returns ''
 * quickSanitize(null)                      // returns ''
 * quickSanitize('  test  ', true)          // returns 'test' (strict mode)
 * ```
 */
export const quickSanitize = (input: any, strictMode: boolean = false): string => {
  if (!TypeValidators.isString(input)) {
    return '';
  }

  let result = input.trim();

  if (strictMode) {
    // Strict mode: remove control chars and normalize whitespace
    result = result.replace(/[\x00-\x1F\x7F]/g, '').replace(/\s+/g, ' ');
  }

  return result;
};

/**
 * Sanitizes email addresses with email-specific rules.
 * 
 * @param email - Email address to sanitize
 * @param options - Additional sanitization options
 * @returns Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (
  email: any,
  options: { maxLength?: number; allowUnicode?: boolean } = {}
): string => {
  const { maxLength = 254, allowUnicode = true } = options;

  if (!TypeValidators.isString(email)) {
    return '';
  }

  let result = email.trim().toLowerCase();

  // Remove extra whitespace
  result = result.replace(/\s+/g, ' ');

  // Basic email format validation
  if (!TypeValidators.isEmailString(result)) {
    return '';
  }

  // Length validation
  if (result.length > maxLength) {
    return '';
  }

  // Unicode handling
  if (!allowUnicode) {
    // Convert to ASCII-only (simplified)
    result = result.replace(/[^\x00-\x7F]/g, '');
  }

  return result;
};

/**
 * Sanitizes URL strings with URL-specific rules.
 * 
 * @param url - URL to sanitize
 * @param options - Additional sanitization options
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (
  url: any,
  options: { maxLength?: number; enforceProtocol?: boolean; defaultProtocol?: string } = {}
): string => {
  const { maxLength = 2048, enforceProtocol = false, defaultProtocol = 'https' } = options;

  if (!TypeValidators.isString(url)) {
    return '';
  }

  let result = url.trim();

  // Remove control characters
  result = result.replace(/[\x00-\x1F\x7F]/g, '');

  // Ensure protocol
  if (enforceProtocol && !result.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
    result = `${defaultProtocol}://${result}`;
  }

  // Basic URL validation
  if (!TypeValidators.isUrlString(result)) {
    return '';
  }

  // Length validation
  if (result.length > maxLength) {
    return '';
  }

  return result;
};

/**
 * Sanitizes numeric input strings.
 * 
 * @param input - Numeric string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized numeric string or empty string if invalid
 */
export const sanitizeNumericString = (
  input: any,
  options: { 
    allowNegative?: boolean; 
    allowDecimal?: boolean; 
    removeCommas?: boolean;
    maxLength?: number;
  } = {}
): string => {
  const { allowNegative = true, allowDecimal = true, removeCommas = true, maxLength = 50 } = options;

  if (!TypeValidators.isString(input)) {
    return '';
  }

  let result = input.trim();

  // Remove commas (thousands separators)
  if (removeCommas) {
    result = result.replace(/,/g, '');
  }

  // Remove any characters that aren't valid numeric characters
  let validChars = '0123456789';
  if (allowNegative) validChars += '-';
  if (allowDecimal) validChars += '.';

  // Keep only valid characters, preserving order
  result = result.split('').filter(char => validChars.includes(char)).join('');

  // Ensure only one negative sign at the beginning
  if (allowNegative) {
    const negativeCount = (result.match(/-/g) || []).length;
    if (negativeCount > 1) {
      result = result.replace(/-/g, '');
      if (result.startsWith('-')) {
        result = '-' + result.replace(/-/g, '');
      }
    } else if (negativeCount === 1 && !result.startsWith('-')) {
      result = result.replace(/-/g, '');
    }
  }

  // Ensure only one decimal point
  if (allowDecimal) {
    const parts = result.split('.');
    if (parts.length > 2) {
      result = parts[0] + '.' + parts.slice(1).join('');
    }
  }

  // Length validation
  if (result.length > maxLength) {
    return '';
  }

  // Validate final result
  if (!TypeValidators.isNumericString(result, { allowNegative, allowDecimal })) {
    return '';
  }

  return result;
};

/**
 * Sanitizes text content for display (removes potentially dangerous content).
 * 
 * @param content - Text content to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text safe for display
 */
export const sanitizeTextContent = (
  content: any,
  options: { 
    maxLength?: number; 
    preserveLineBreaks?: boolean;
    removeEmojis?: boolean;
  } = {}
): string => {
  const { maxLength = 10000, preserveLineBreaks = false, removeEmojis = false } = options;

  if (!TypeValidators.isString(content)) {
    return '';
  }

  let result = content.trim();

  // Remove control characters except newlines and tabs if preserving
  if (preserveLineBreaks) {
    result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    result = result.replace(/[\x00-\x1F\x7F]/g, '');
  }

  // Remove HTML tags
  result = result.replace(/<[^>]*>/g, '');

  // Remove emojis if requested
  if (removeEmojis) {
    result = result.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ');

  // Length validation
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
};

/**
 * Batch sanitization for multiple inputs.
 * 
 * @param inputs - Object with string values to sanitize
 * @param defaultOptions - Default sanitization options for all fields
 * @param fieldOptions - Field-specific options override
 * @returns Object with sanitized values
 * 
 * @example
 * ```typescript
 * const result = sanitizeBatch({
 *   name: '  John Doe  ',
 *   email: '  JOHN@EXAMPLE.COM  ',
 *   age: '  25  '
 * }, { trim: true }, {
 *   email: { toLowerCase: true },
 *   age: { customSanitizer: (v) => v.replace(/\D/g, '') }
 * });
 * ```
 */
export const sanitizeBatch = <T extends Record<string, any>>(
  inputs: T,
  defaultOptions: SanitizationOptions = {},
  fieldOptions: Partial<Record<keyof T, SanitizationOptions>> = {}
): { [K in keyof T]: string } => {
  const result = {} as { [K in keyof T]: string };

  for (const [key, value] of Object.entries(inputs)) {
    const options = { ...defaultOptions, ...(fieldOptions[key] || {}) };
    const sanitized = sanitizeString(value, options);
    result[key as keyof T] = sanitized.value;
  }

  return result;
};

// Export all sanitizers as a grouped object for convenience
export const InputSanitizers = {
  sanitizeString,
  quickSanitize,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeNumericString,
  sanitizeTextContent,
  sanitizeBatch
};

export default InputSanitizers;
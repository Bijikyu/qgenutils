'use strict';

/**
 * Unified masking utilities
 * Consolidates functionality from maskString and maskSensitiveValue
 */

/**
 * Default sensitive key patterns to detect sensitive data
 */
const SENSITIVE_KEYS = [
  'api_key', 'password', 'secret', 'token', 'key', 
  'credential', 'auth', 'private', 'confidential'
];

/**
 * Core string masking logic with flexible options
 * @param {string} value - The string to mask
 * @param {Object} [options] - Configuration options
 * @param {number} [options.visibleStart=4] - Characters visible at start
 * @param {number} [options.visibleEnd=4] - Characters visible at end
 * @param {string} [options.maskChar='*'] - Character to use for masking
 * @param {number} [options.maxMaskLength=12] - Maximum masked characters
 * @param {number} [options.minLength] - Minimum length to mask (defaults to visibleStart + visibleEnd + 1)
 * @returns {string} Masked string or original if criteria not met
 */
const maskStringCore = (value: any, options: any = {}): any => {
  if (!value || typeof value !== 'string') {
    return '[REDACTED]';
  }

  const {
    visibleStart = 4,
    visibleEnd = 4, 
    maskChar = '*',
    maxMaskLength = 12,
    minLength = visibleStart + visibleEnd + 1
  } = options;

  // Return original if too short to mask meaningfully
  if (value.length <= minLength) {
    return '[REDACTED]';
  }

  const start: any = value.slice(0, visibleStart);
  const end: any = value.slice(-visibleEnd);
  const maskedLength: any = value.length - visibleStart - visibleEnd;
  const masked: any = maskChar.repeat(Math.min(maskedLength, maxMaskLength));

  return `${start}${masked}${end}`;
};

/**
 * Enhanced maskString with backward compatibility
 * @param {string} value - The string to mask
 * @param {Object} [options] - Configuration options
 * @returns {string} Masked string
 */
const maskString = (value: any, options: any = {}): any => {
  return maskStringCore(value, options);
};

/**
 * Enhanced maskSensitiveValue with backward compatibility
 * @param {string} value - Value to mask
 * @param {string} key - Configuration key name
 * @param {Object} [options] - Additional masking options
 * @returns {string} Masked value safe for logging
 */
const maskSensitiveValue = (value: any, key: any, options: any = {}): any => {
  // Input validation
  if (typeof value !== 'string' || !value) {
    return value;
  }

  if (typeof key !== 'string') {
    return value;
  }

  // Check if key indicates sensitive data
  const isSensitive = SENSITIVE_KEYS.some(sensitive => 
    key.toLowerCase().includes(sensitive)
  );

  if (!isSensitive) {
    return value;
  }

  // Use simple masking for very short strings
  if (value.length <= 4) {
    return '*'.repeat(value.length);
  }

  // Use pattern-based masking with reduced visibility for sensitive data
  const sensitiveOptions = {
    visibleStart: 2,
    visibleEnd: 2,
    ...options
  };

  return maskStringCore(value, sensitiveOptions);
};

/**
 * Check if a key name suggests sensitive data
 * @param {string} key - Key name to check
 * @param {Array<string>} [customSensitiveKeys] - Custom sensitive key patterns
 * @returns {boolean} True if key appears to be sensitive
 */
const isSensitiveKey = (key: any, customSensitiveKeys: any = SENSITIVE_KEYS): any => {
  if (typeof key !== 'string') {
    return false;
  }

  return customSensitiveKeys.some(sensitive => 
    key.toLowerCase().includes(sensitive)
  );
};

/**
 * Mask object properties recursively for safe logging
 * @param {Object} obj - Object to mask
 * @param {Object} [options] - Masking options
 * @returns {Object} Object with sensitive values masked
 */
const maskObject = (obj: any, options: any = {}): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const masked: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key, options.sensitiveKeys)) {
      masked[key] = maskSensitiveValue(String(value), key, options);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      masked[key] = maskObject(value, options);
    } else {
      masked[key] = value;
    }
  }

  return masked;
};

export default {
  maskStringCore,
  maskString,
  maskSensitiveValue,
  isSensitiveKey,
  maskObject,
  SENSITIVE_KEYS
};
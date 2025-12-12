'use strict';

const SENSITIVE_PATTERNS = [ // patterns indicating sensitive data
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /auth/i,
  /credential/i,
  /ssn/i,
  /credit.*card/i,
  /bank.*account/i
];

/**
 * Sanitizes a value by redacting sensitive information
 * @param {*} value - The value to sanitize
 * @returns {string} Sanitized string representation
 * @example
 * sanitizeLogValue('password123'); // Returns '[REDACTED_SENSITIVE]'
 * sanitizeLogValue('hello'); // Returns 'hello'
 */
function sanitizeLogValue(value) { // sanitize value for safe logging
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'string') {
    for (const pattern of SENSITIVE_PATTERNS) { // check for sensitive patterns
      if (pattern.test(value)) {
        return '[REDACTED_SENSITIVE]';
      }
    }

    if (value.split('.').length === 3) { // check for JWT tokens (3 base64 parts)
      const parts = value.split('.');
      const isBase64Like = parts.every(p => /^[A-Za-z0-9_-]+$/.test(p));
      if (isBase64Like && parts[0].length > 10 && parts[1].length > 10) {
        return '[REDACTED_TOKEN]';
      }
    }

    return value;
  }

  if (typeof value === 'object') {
    return '[Object]'; // don't stringify objects here, use sanitizeObject
  }

  return String(value);
}

sanitizeLogValue.SENSITIVE_PATTERNS = SENSITIVE_PATTERNS; // expose patterns for extension

module.exports = sanitizeLogValue;

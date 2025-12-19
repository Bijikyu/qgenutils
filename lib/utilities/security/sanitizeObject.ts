'use strict';

const sanitizeLogValue: any = require('./sanitizeLogValue');

const REDACTED_FIELDS = [ // fields that should always be redacted
  'password', 'secret', 'token', 'apiKey', 'authToken',
  'accessToken', 'refreshToken', 'idToken', 'authorization',
  'cookie', 'session', 'csrf', 'nonce', 'signature', 'hash', 'salt',
  'privateKey', 'secretKey', 'credentials', 'bearer'
];

/**
 * Recursively sanitizes an object by redacting sensitive fields
 * @param {*} obj - The object to sanitize
 * @param {Object} [options] - Configuration options
 * @param {string[]} [options.additionalFields] - Additional fields to redact
 * @param {number} [options.maxDepth=10] - Maximum recursion depth
 * @returns {*} Sanitized object
 * @example
 * sanitizeObject({ user: 'john', password: '123' });
 * // Returns: { user: 'john', password: '[REDACTED]' }
 */
function sanitizeObject(obj, options = {}, depth = 0) { // recursively sanitize object
  const additionalFields: any = options.additionalFields || [];
  const maxDepth: any = options.maxDepth || 10;
  const allRedactedFields: any = [...REDACTED_FIELDS, ...additionalFields];

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (depth > maxDepth) { // prevent infinite recursion
    return '[MAX_DEPTH_EXCEEDED]';
  }

  if (Array.isArray(obj)) { // handle arrays
    return obj.map(item => sanitizeObject(item, options, depth + 1));
  }

  if (typeof obj === 'object') { // handle objects
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey: any = key.toLowerCase();
      const shouldRedact = allRedactedFields.some(field => 
        lowerKey === field.toLowerCase() || lowerKey.includes(field.toLowerCase())
      );

      if (shouldRedact) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value, options, depth + 1);
      }
    }

    return sanitized;
  }

  return sanitizeLogValue(obj);
}

sanitizeObject.REDACTED_FIELDS = REDACTED_FIELDS; // expose for extension

export default sanitizeObject;

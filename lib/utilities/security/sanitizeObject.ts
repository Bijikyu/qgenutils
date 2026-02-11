'use strict';

import qerrorsMod from '@bijikyu/qerrors';
const qerrors = (qerrorsMod as any).qerr || (qerrorsMod as any).qerrors || qerrorsMod;

import sanitizeLogValue from './sanitizeLogValue.js';

const REDACTED_FIELDS = [ // fields that should always be redacted
  'password', 'secret', 'token', 'apiKey', 'authToken',
  'accessToken', 'refreshToken', 'idToken', 'authorization',
  'cookie', 'session', 'csrf', 'nonce', 'signature', 'hash', 'salt',
  'privateKey', 'secretKey', 'credentials', 'bearer'
];

interface SanitizeOptions {
  additionalFields?: string[];
  maxDepth?: number;
}

/**
 * Recursively sanitizes an object by redacting sensitive fields
 * @param {*} obj - The object to sanitize
 * @param {SanitizeOptions} [options] - Configuration options
 * @param {string[]} [options.additionalFields] - Additional fields to redact
 * @param {number} [options.maxDepth=10] - Maximum recursion depth
 * @returns {*} Sanitized object
 * @example
 * sanitizeObject({ user: 'john', password: '123' });
 * // Returns: { user: 'john', password: '[REDACTED]' }
 */
function sanitizeObject(obj: any, options: SanitizeOptions = {}, depth: number = 0, visited: WeakSet<any> = new WeakSet()) { // recursively sanitize object
  try {
    const additionalFields: any = options.additionalFields || [];
    const maxDepth: any = options.maxDepth || 10;
    const allRedactedFields: any = [...REDACTED_FIELDS, ...additionalFields];

    if (obj === null || obj === undefined) {
      return obj;
    }

    // Prevent circular reference infinite recursion
    if (visited.has(obj)) {
      return '[CIRCULAR_REFERENCE]';
    }
    visited.add(obj);

    if (depth > maxDepth) { // prevent infinite recursion
      return '[MAX_DEPTH_EXCEEDED]';
    }

    if (Array.isArray(obj)) { // handle arrays
      return obj.map(item => sanitizeObject(item, options, depth + 1, visited));
    }

    if (typeof obj === 'object') { // handle objects
      const sanitized: any = {};

      for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution by checking for dangerous keys
        if (typeof key !== 'string' ||
          key === '__proto__' ||
          key === 'constructor' ||
          key === 'prototype' ||
          key.startsWith('__') ||
          key.includes('proto') ||
          key.includes('constructor')) {
          continue;
        }

        const lowerKey: any = key.toLowerCase();
        const shouldRedact = allRedactedFields.some(field =>
          lowerKey === field.toLowerCase() || lowerKey.includes(field.toLowerCase())
        );

        if (shouldRedact) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitizeObject(value, options, depth + 1, visited);
        }
      }

      return sanitized;
    }

    return sanitizeLogValue(obj);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'sanitizeObject', { message: `Object sanitization failed at depth: ${depth}` });
    return '[SANITIZATION_ERROR]';
  }
}

sanitizeObject.REDACTED_FIELDS = REDACTED_FIELDS; // expose for extension

export default sanitizeObject;

'use strict';

const SENSITIVE_KEYS = ['api_key', 'password', 'secret', 'token', 'key', 'credential', 'auth']; // keys to mask

/**
 * Masks sensitive values for safe logging
 * @param {string} value - Value to mask
 * @param {string} key - Configuration key name
 * @returns {string} Masked value safe for logging
 * @example
 * maskSensitiveValue('sk_live_abc123xyz', 'API_KEY'); // 'sk**********yz'
 */
function maskSensitiveValue(value, key) { // mask sensitive values for logs
  if (typeof value !== 'string' || !value) { // return non-strings as-is
    return value;
  }

  if (typeof key !== 'string') { // require key for detection
    return value;
  }

  const isSensitive = SENSITIVE_KEYS.some(sensitive => // check if key is sensitive
    key.toLowerCase().includes(sensitive)
  );

  if (!isSensitive) { // return non-sensitive values unchanged
    return value;
  }

  if (value.length <= 4) { // fully mask short values
    return '*'.repeat(value.length);
  }

  return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2); // show first/last 2 chars
}

module.exports = maskSensitiveValue;

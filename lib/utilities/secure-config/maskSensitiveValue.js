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
const maskSensitiveValue = (value, key) => { // mask sensitive values for logs
  if (typeof value !== 'string' || !value) return value;
  if (typeof key !== 'string') return value;

  const isSensitive = SENSITIVE_KEYS.some(sensitive => key.toLowerCase().includes(sensitive));

  !isSensitive && (() => {})();

  return value.length <= 4 ? '*'.repeat(value.length) : value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
};

module.exports = maskSensitiveValue;

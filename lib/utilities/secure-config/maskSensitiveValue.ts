/**
 * Sensitive Value Masking Utility - Security-First Configuration Protection
 *
 * PURPOSE: Provides secure masking of sensitive configuration values to prevent
 * accidental exposure in logs, debug output, and error messages. This is a critical
 * security utility that protects API keys, passwords, tokens, and other sensitive data.
 *
 * SECURITY STRATEGY: Uses a pattern-matching approach to identify potentially sensitive
 * configuration keys and applies consistent masking rules. The utility follows the
 * principle of "secure by default" - when in doubt, mask the value.
 *
 * MASKING ALGORITHM:
 * - Short values (≤4 chars): Completely masked with asterisks
 * - Long values (>4 chars): Show first 2 and last 2 characters, mask the middle
 * - This provides enough context for debugging while protecting sensitive data
 *
 * SENSITIVE KEY PATTERNS: The utility identifies sensitive values by checking if
 * the configuration key contains any of the following patterns (case-insensitive):
 * - api_key, password, secret, token, key, credential, auth
 * - This covers common naming conventions for sensitive configuration values
 *
 * COMPLIANCE CONSIDERATIONS: Helps meet security compliance requirements (PCI DSS,
 * GDPR, SOC 2) by preventing sensitive data exposure in logs and monitoring systems.
 *
 * @param {string} value - The configuration value to potentially mask
 * @param {string} key - The configuration key name used to determine if masking is needed
 * @returns {string} Original value if not sensitive, masked value if sensitive
 *
 * @example
 * // Sensitive values get masked
 * maskSensitiveValue('sk_live_abc123xyz', 'api_key') // 'sk**********yz'
 * maskSensitiveValue('mySecretPassword123', 'password') // 'my**********23'
 * maskSensitiveValue('abc', 'secret') // '***'
 *
 * @example
 * // Non-sensitive values pass through unchanged
 * maskSensitiveValue('localhost', 'database_host') // 'localhost'
 * maskSensitiveValue('8080', 'server_port') // '8080'
 */
'use strict';

// Comprehensive list of sensitive key patterns for automatic detection
// These patterns cover common naming conventions for sensitive configuration values
const SENSITIVE_KEYS: any = ['api_key', 'password', 'secret', 'token', 'key', 'credential', 'auth']; // keys to mask for security

const maskSensitiveValue = (value: any, key: any): any => { // mask sensitive values for logs and debug output
  // Input validation - ensure we're working with valid string inputs
  if (typeof value !== 'string' || !value) {
    return value;
  }
  if (typeof key !== 'string') {
    return value;
  }

  // Check if the configuration key indicates a sensitive value
  // Uses case-insensitive pattern matching for broad coverage
  const isSensitive: any = SENSITIVE_KEYS.some((sensitive: any) => key.toLowerCase().includes(sensitive));

  // Return the original value if it's not identified as sensitive
  if (!isSensitive) {
    return value;
  }

  // Apply masking algorithm based on value length
  // Short values (≤4 chars): Completely masked for maximum security
  // Long values (>4 chars): Partially masked to maintain some debugging context
  return value.length <= 4 ? '*'.repeat(value.length) : value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
};

export default maskSensitiveValue;

/**
 * TIMING-SAFE COMPARISON UTILITY
 *
 * PURPOSE: Provides constant-time string comparison to prevent timing attacks
 * in security-sensitive operations. This is critical for comparing passwords,
 * API keys, tokens, and other sensitive data where timing variations could
 * reveal information to attackers.
 *
 * SECURITY CRITICAL: This utility protects against timing side-channel attacks
 * where attackers measure execution time differences to infer information about
 * secret values. Regular string comparison (===) can leak information because
 * it returns false as soon as a mismatching character is found.
 *
 * TIMING ATTACK EXPLANATION:
 * - Regular comparison: 'a' vs 'b' returns false faster than 'abc123' vs 'abc124'
 * - Timing attack: Measure response times to guess characters one by one
 * - Constant-time: Always takes same time regardless of where strings differ
 *
 * IMPLEMENTATION APPROACH:
 * - Uses specialized 'safe-compare' library for proven constant-time behavior
 * - Never falls back to regular comparison (would create security vulnerability)
 * - Comprehensive input validation and error handling
 * - Maintains security even if underlying library fails
 *
 * USE CASES:
 * - Password verification during authentication
 * - API key/token validation
 * - CSRF token comparison
 * - HMAC signature verification
 * - Session token validation
 * - Webhook signature verification
 *
 * PERFORMANCE NOTES:
 * - Slightly slower than regular comparison (security trade-off)
 * - Constant time regardless of string length or content
 * - Acceptable overhead for security-critical operations
 */

import { qerrors } from 'qerrors'; // Centralized error handling system

/**
 * @ts-ignore - safe-compare doesn't have TypeScript definitions but is battle-tested
 */
// @ts-ignore
import safeCompare = require('safe-compare');

/**
 * Performs constant-time string comparison to prevent timing attacks.
 *
 * This function compares two strings in constant time, meaning the execution
 * time remains the same regardless of whether the strings are equal, where they
 * differ, or their lengths. This prevents timing side-channel attacks.
 *
 * @param a - First string to compare. Must be a string type.
 * @param b - Second string to compare. Must be a string type.
 *
 * @returns boolean - True if strings are exactly equal, false otherwise.
 *                    Always returns false for non-string inputs.
 *
 * @example
 * ```typescript
 * // Secure password verification
 * const storedHash = 'hashed_password_from_db';
 * const providedHash = hashPassword(userInput);
 * const isValid = timingSafeCompare(storedHash, providedHash);
 *
 * // API key comparison
 * const expectedKey = 'sk_live_1234567890abcdef';
 * const providedKey = req.headers['x-api-key'];
 * const isValidKey = timingSafeCompare(expectedKey, providedKey);
 *
 * // Token validation
 * const sessionToken = getSessionToken();
 * const expectedToken = 'user_session_abc123';
 * const isValidSession = timingSafeCompare(sessionToken, expectedToken);
 *
 * // Edge cases - always returns false safely
 * timingSafeCompare('hello', null)           // false
 * timingSafeCompare('hello', 123)            // false
 * timingSafeCompare('', '')                 // true (constant-time)
 * timingSafeCompare('a', 'a')               // true
 * timingSafeCompare('a', 'b')               // false
 * ```
 *
 * @warning Never use regular string comparison (===) for sensitive security comparisons
 * @critical Always use this function for password, token, API key, and signature comparisons
 * @see CWE-208: Observable Timing Discrepancy
 * @see OWASP A01:2021 - Broken Access Control
 */
const timingSafeCompare = (a: string, b: string): boolean => {
  // TYPE VALIDATION: Ensure both inputs are strings before comparison
  // Non-string inputs are automatically rejected to maintain security
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false; // Safe fallback for invalid input types
  }

  // CONSTANT-TIME COMPARISON: Use specialized library for security-critical operation
  // Even for empty strings, we use safeCompare to maintain constant-time behavior
  // The library handles all edge cases including empty strings securely
  try {
    return safeCompare(a, b);
  } catch (error) {
    // SECURITY FALLBACK: If safe-compare fails, we cannot securely fall back to regular comparison
    // Regular comparison would create a timing vulnerability, so we return false
    // This maintains security even if the underlying library has issues

    qerrors(
      error instanceof Error ? error : new Error(String(error)),
      'timingSafeCompare',
      `Constant-time comparison library failed for string lengths: ${a.length}, ${b.length}`
    );

    // SECURE DEFAULT: Return false rather than risk timing attack vulnerability
    // This may cause false negatives but prevents security breaches
    return false;
  }
};

export default timingSafeCompare;

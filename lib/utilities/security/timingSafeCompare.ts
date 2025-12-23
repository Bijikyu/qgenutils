/**
 * Constant-Time String Comparison
 * 
 * Compares two strings in constant time to prevent timing attacks.
 * Uses the safe-compare npm module which provides a specialized,
 * well-tested constant-time comparison implementation.
 * 
 * @param {string} a - First string to compare
 * @param {string} b - Second string to compare
 * @returns {boolean} True if strings are equal, false otherwise
 */
// @ts-ignore - safe-compare doesn't have TypeScript definitions
const safeCompare: any = require('safe-compare'); // rationale: specialized constant-time comparison module

const timingSafeCompare = (a: string, b: string): boolean => {
  // Enhanced type and safety checks
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  // Always use safeCompare, even for empty strings, to prevent timing attacks
  // safeCompare handles all cases including empty strings securely
  try {
    return safeCompare(a, b);
  } catch (error) {
    // If safe-compare fails for any reason, fall back to secure comparison
    // This maintains security while providing robustness
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
};

export default timingSafeCompare;

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
const safeCompare: any = require('safe-compare'); // rationale: specialized constant-time comparison module

const timingSafeCompare: any = (a, b) => {
  // Enhanced type and safety checks
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  // Always use safeCompare, even for empty strings, to prevent timing attacks
  // safeCompare handles all cases including empty strings securely
  return safeCompare(a, b);
};

export default timingSafeCompare;

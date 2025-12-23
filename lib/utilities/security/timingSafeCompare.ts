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
  if (a.length === 0 || b.length === 0) {
    return a === b; // Handle empty strings safely
  }
  // Remove length-based early exit to prevent timing attacks
  // safeCompare will handle different lengths securely
  return safeCompare(a, b);
};

export default timingSafeCompare;

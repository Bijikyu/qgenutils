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
const safeCompare = require('safe-compare'); // rationale: specialized constant-time comparison module

function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') { // validate input types
    return false;
  }
  
  // safe-compare handles length checking and constant-time comparison internally
  return safeCompare(a, b);
}

module.exports = timingSafeCompare;

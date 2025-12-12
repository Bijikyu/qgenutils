/**
 * Constant-Time String Comparison
 * 
 * Compares two strings in constant time to prevent timing attacks.
 * Uses Node.js crypto.timingSafeEqual for cryptographically secure comparison.
 * 
 * @param {string} a - First string to compare
 * @param {string} b - Second string to compare
 * @returns {boolean} True if strings are equal, false otherwise
 */
const { timingSafeEqual } = require('crypto'); // rationale: built-in constant-time comparison

function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') { // validate input types
    return false;
  }
  
  if (a.length !== b.length) { // length mismatch is an early exit but doesn't leak timing info about content
    return false;
  }
  
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b)); // constant-time comparison of buffer contents
  } catch (error) {
    return false; // handle any unexpected errors safely
  }
}

module.exports = timingSafeCompare;

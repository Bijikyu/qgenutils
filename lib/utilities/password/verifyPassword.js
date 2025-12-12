'use strict';

const bcrypt = require('bcrypt'); // bcrypt for constant-time comparison

/**
 * Compares a plain text password against a bcrypt hash using constant-time comparison
 * @param {string} password - Plain text password to verify
 * @param {string} hash - bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches hash
 * @example
 * const isValid = await verifyPassword('MySecurePass123', storedHash);
 */
async function verifyPassword(password, hash) { // verify password against hash
  if (!password || !hash) { // require both inputs
    return false;
  }

  if (typeof password !== 'string' || typeof hash !== 'string') { // type check
    return false;
  }

  try {
    const isValid = await bcrypt.compare(password, hash); // constant-time comparison
    return isValid;
  } catch (error) {
    console.error('Password verification failed:', error.name || 'Unknown error'); // log without exposing details
    return false; // fail closed
  }
}

module.exports = verifyPassword;

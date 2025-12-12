'use strict';

const bcrypt = require('bcrypt'); // bcrypt for secure hashing

const BCRYPT_SALT_ROUNDS = 12; // OWASP recommended minimum

/**
 * Hashes a password using bcrypt with secure salt rounds
 * @param {string} password - Plain text password to hash
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.saltRounds=12] - bcrypt salt rounds (min 12 recommended)
 * @returns {Promise<string>} bcrypt hash
 * @throws {Error} If password is invalid or hashing fails
 * @example
 * const hash = await hashPassword('MySecurePass123');
 */
async function hashPassword(password, options = {}) { // hash password with bcrypt
  if (!password || typeof password !== 'string') { // validate input
    throw new Error('Password is required and must be a string');
  }

  if (password.length < 8) { // minimum length check
    throw new Error('Password must be at least 8 characters long');
  }

  if (password.length > 128) { // maximum length check (bcrypt limit considerations)
    throw new Error('Password must not exceed 128 characters');
  }

  const saltRounds = options.saltRounds || BCRYPT_SALT_ROUNDS; // use provided or default

  try {
    const hash = await bcrypt.hash(password, saltRounds); // generate hash
    return hash;
  } catch (error) {
    console.error('Password hashing failed:', error.name || 'Unknown error'); // log without exposing details
    throw new Error('Password hashing failed');
  }
}

module.exports = hashPassword;
module.exports.BCRYPT_SALT_ROUNDS = BCRYPT_SALT_ROUNDS;

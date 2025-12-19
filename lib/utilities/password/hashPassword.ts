'use strict';

const bcrypt: any = require('bcrypt'); // bcrypt for secure hashing

const BCRYPT_SALT_ROUNDS: any = 12; // OWASP recommended minimum

/**
 * Hashes a password using bcrypt with secure salt rounds
 * @param {string} password - Plain text password to hash
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.saltRounds=12] - bcrypt salt rounds (min 12 recommended)
 * @returns {Promise<string>} bcrypt hash
 * @throws {Error} If password is invalid or hashing fails
 * @example
 * const hash: any = await hashPassword('MySecurePass123');
 */
const hashPassword = async (password: any, options: any = {}): Promise<any> => { // hash password with bcrypt
  if (!password || typeof password !== 'string') throw new Error('Password is required and must be a string');
  if (password.length < 8) throw new Error('Password must be at least 8 characters long');
  if (password.length > 128) throw new Error('Password must not exceed 128 characters');

  const saltRounds: any = options.saltRounds || BCRYPT_SALT_ROUNDS;

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Password hashing failed:', error.name || 'Unknown error');
    throw new Error('Password hashing failed');
  }
};

export default hashPassword;
module.exports.BCRYPT_SALT_ROUNDS = BCRYPT_SALT_ROUNDS;

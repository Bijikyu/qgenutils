import * as bcrypt from 'bcrypt'; // bcrypt for secure hashing
import { qerrors } from 'qerrors';

const BCRYPT_SALT_ROUNDS: number = 12; // OWASP recommended minimum

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
const hashPassword = async (password: string, options: { saltRounds?: number } = {}): Promise<string> => { // hash password with bcrypt
  if (!password || typeof password !== 'string') throw new Error('Password is required and must be a string');
  if (password.length < 8) throw new Error('Password must be at least 8 characters long');
  if (password.length > 128) throw new Error('Password must not exceed 128 characters');
  
  // Additional character validation to prevent control characters and injection
  if (/[\x00-\x1F\x7F]/.test(password)) {
    throw new Error('Password contains invalid characters');
  }

  const saltRounds: number = options.saltRounds || BCRYPT_SALT_ROUNDS;

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'hashPassword', 'Password hashing operation failed');
    // Don't log error details for security
    throw new Error('Password hashing failed');
  }
};

export default hashPassword;
export { BCRYPT_SALT_ROUNDS };

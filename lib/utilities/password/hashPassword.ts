import bcrypt from 'bcrypt';
import { Worker } from 'worker_threads';
import { qerrors } from 'qerrors';

const BCRYPT_SALT_ROUNDS = 12;

interface HashOptions {
  saltRounds?: number;
  // Note: useCache option removed for security reasons
}

/**
 * Hash password using secure implementation
 *
 * SECURITY NOTE: Intentionally NO CACHING of password hashes to prevent:
 * - Rainbow table attacks
 * - Timing attacks
 * - Hash leakage through memory inspection
 * - Cross-contamination between user passwords
 */
export default async function hashPassword(password: string, options?: HashOptions): Promise<string> {
  const { saltRounds = BCRYPT_SALT_ROUNDS } = options || {};

  try {
    // Input Validation
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }

    // Hash password securely - NO CACHING for security
    const hash = await new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash!);
        }
      });
    });

    return hash;

  } catch (error) {
    // Secure Error Logging - No Information Disclosure
    qerrors(
      error instanceof Error ? error : new Error(String(error)),
      'hashPassword',
      'Password hashing operation failed'
    );

    // Generic Error Message - Prevents Information Disclosure
    throw new Error('Password hashing failed');
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Input Validation
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (!hash || typeof hash !== 'string') {
      throw new Error('Hash must be a non-empty string');
    }

    return await new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(password, hash, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

  } catch (error) {
    qerrors(
      error instanceof Error ? error : new Error(String(error)),
      'verifyPassword',
      'Password verification failed'
    );

    throw new Error('Password verification failed');
  }
}

export { BCRYPT_SALT_ROUNDS };

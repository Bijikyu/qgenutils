/**
 * Password Security Utilities - Bcrypt Implementation
 *
 * PURPOSE: Provides secure password hashing and verification using industry-standard
 * bcrypt library. This replaces the custom cryptographic implementation with
 * battle-tested, professionally audited bcrypt for better security and maintainability.
 *
 * SECURITY NOTE: Bcrypt is the industry standard for password hashing:
 * - Automatically handles salt generation and management
 * - Includes adaptive work factor to resist brute force attacks
 * - Widely tested and audited for security vulnerabilities
 * - Designed specifically for password hashing (general purpose)
 */

import bcrypt from 'bcrypt';
import { qerr as qerrors } from '@bijikyu/qerrors';

interface PasswordHashResult {
  hash: string;
  salt: string;
}

/**
 * Hashes a password using bcrypt with automatic salt generation
 *
 * @param password - Password to hash
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Promise resolving to hash and salt
 */
async function hashPassword(
  password: string,
  saltRounds: number = 10
): Promise<PasswordHashResult> {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    return {
      hash,
      salt
    };
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'hashPassword', 'Password hashing failed');
    throw new Error('Password hashing failed');
  }
}

/**
 * Verifies a password against a bcrypt hash
 *
 * @param password - Password to verify
 * @param hash - Stored bcrypt hash
 * @returns Promise resolving to true if password matches
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!password || typeof password !== 'string') {
      return false;
    }

    if (!hash || typeof hash !== 'string') {
      return false;
    }

    return await bcrypt.compare(password, hash);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'verifyPassword', 'Password verification failed');
    return false;
  }
}

/**
 * Generates a secure random salt using bcrypt
 *
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Promise resolving to base64 encoded salt
 */
async function generateSalt(saltRounds: number = 10): Promise<string> {
  try {
    return await bcrypt.genSalt(saltRounds);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'generateSalt', 'Salt generation failed');
    throw new Error('Salt generation failed');
  }
}

/**
 * Checks if input is secure for processing (basic validation)
 *
 * @param input - Input to check
 * @returns True if input appears secure
 */
function isSecureInput(input: any): boolean {
  try {
    if (!input || typeof input !== 'string') {
      return false;
    }

    // Basic security checks
    if (input.length > 10000) {
      return false; // Too long, potential DoS
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(input));
  } catch (error) {
    return false;
  }
}

export default {
  hashPassword,
  verifyPassword,
  generateSalt,
  isSecureInput
};

export { hashPassword, verifyPassword, generateSalt, isSecureInput };



import bcrypt from 'bcrypt'; // bcrypt for constant-time comparison

/**
 * Compares a plain text password against a bcrypt hash using constant-time comparison
 * @param {string} password - Plain text password to verify
 * @param {string} hash - bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches hash
 * @example
 * const isValid: any = await verifyPassword('MySecurePass123', storedHash);
 */
const verifyPassword = async (password: string, hash: string): Promise<boolean> => { // verify password against hash
  if (!password || !hash) return false;
  if (typeof password !== 'string' || typeof hash !== 'string') return false;

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification failed:', error.name || 'Unknown error');
    return false;
  }
};

export default verifyPassword;

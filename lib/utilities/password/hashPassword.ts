import bcrypt from 'bcrypt';
import { Worker } from 'worker_threads';
import { qerrors } from 'qerrors';

const BCRYPT_SALT_ROUNDS = 12;

interface HashOptions {
  saltRounds?: number;
  useCache?: boolean;
}

// Cache for password hashes to avoid re-hashing same passwords (security note: only hash results, not passwords)
const passwordHashCache = new Map<string, string>();
const MAX_PASSWORD_CACHE_SIZE = 100;

/**
 * Hash password using optimized implementation
 */
export default async function hashPassword(password: string, options?: HashOptions): Promise<string> {
  const { saltRounds = BCRYPT_SALT_ROUNDS, useCache = true } = options || {};
  
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

    // Check cache if enabled
    if (useCache) {
      const cachedHash = passwordHashCache.get(password);
      if (cachedHash) {
        return cachedHash;
      }
    }

    // Hash password
    const hash = await new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash!);
        }
      });
    });

    // Cache result if enabled
    if (useCache) {
      // Implement simple cache eviction
      if (passwordHashCache.size >= MAX_PASSWORD_CACHE_SIZE) {
        const firstKey = passwordHashCache.keys().next().value;
        if (firstKey) {
          passwordHashCache.delete(firstKey);
        }
      }
      passwordHashCache.set(password, hash);
    }

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
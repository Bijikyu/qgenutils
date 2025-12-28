/**
 * Secure Password Generation Utility - Cryptographically Secure Random Passwords
 * 
 * PURPOSE: Generates cryptographically secure random passwords suitable for
 * user accounts, API keys, and temporary credentials. Uses cryptographically
 * secure random number generation to ensure unpredictability and security.
 * 
 * SECURITY FEATURES:
 * - Uses Node.js crypto.randomBytes() for cryptographically secure randomness
 * - Implements rejection sampling to prevent modulo bias
 * - Ensures character class diversity (uppercase, lowercase, numbers)
 * - Optional special character inclusion for enhanced complexity
 * - Secure shuffling using Fisher-Yates algorithm with secure random
 * 
 * CHARACTER SET STRATEGY:
 * - Uppercase: A-Z (26 characters)
 * - Lowercase: a-z (26 characters) 
 * - Numbers: 0-9 (10 characters)
 * - Special: !@#$%^&*()_+-=[]{}|;:,.<>? (25 characters, optional)
 * 
 * MODULO BIAS PREVENTION: Uses rejection sampling instead of simple modulo
 * operation to ensure uniform distribution of random values, preventing
 * certain characters from being selected more frequently than others.
 * 
 * @param {number} [length=12] - Password length (minimum 8, defaults to 12)
 * @param {Object} [options] - Configuration options for password generation
 * @param {boolean} [options.includeSpecial=false] - Include special characters for enhanced complexity
 * @returns {string} Cryptographically secure random password
 * 
 * @example
 * // Generate default 12-character password
 * const password = generateSecurePassword();
 * 
 * @example
 * // Generate 16-character password with special characters
 * const strongPassword = generateSecurePassword(16, { includeSpecial: true });
 * 
 * @example
 * // Generate 8-character password (minimum secure length)
 * const shortPassword = generateSecurePassword(8);
 */
'use strict';

import * as crypto from 'crypto'; // use crypto for secure randomness and cryptographically secure random number generation
import { qerrors } from 'qerrors';

const DEFAULT_LENGTH = 12; // default password length - OWASP recommended minimum for user-facing passwords
const MIN_LENGTH = 8; // minimum secure length - NIST SP 800-63B minimum for memorized secrets

export interface PasswordOptions {
  includeSpecial?: boolean;
}

const generateSecurePassword = (length: number = DEFAULT_LENGTH, options: PasswordOptions = {}): string => { // generate secure random password with cryptographic randomness
  const effectiveLength = Math.max(length, MIN_LENGTH);
  const includeSpecial = options.includeSpecial === true;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let allChars = uppercase + lowercase + numbers;
  if (includeSpecial) {
    allChars += special;
  }

  const passwordChars: string[] = [];

  passwordChars.push(uppercase[secureRandomIndex(uppercase.length)]);
  passwordChars.push(lowercase[secureRandomIndex(lowercase.length)]);
  passwordChars.push(numbers[secureRandomIndex(numbers.length)]);

  if (includeSpecial) {
    passwordChars.push(special[secureRandomIndex(special.length)]);
  }

  while (passwordChars.length < effectiveLength) {
    passwordChars.push(allChars[secureRandomIndex(allChars.length)]);
  }

  return secureShuffleArray(passwordChars).join('');
};

/**
 * Generates a cryptographically secure random index without modulo bias
 * 
 * PURPOSE: Provides unbiased random number generation for selecting characters
 * from the character sets. Uses rejection sampling to prevent modulo bias that
 * would otherwise cause certain characters to be selected more frequently.
 * 
 * MODULO BIAS EXPLANATION: When using simple modulo operation (random % max),
 * the distribution is not uniform if max doesn't evenly divide into the
 * maximum random value. This function uses rejection sampling to ensure
 * each possible index has equal probability of being selected.
 * 
 * ALGORITHM: 
 * 1. Calculate the minimum value that would cause bias
 * 2. Generate random 32-bit value using crypto.randomBytes()
 * 3. Reject values below minimum and retry
 * 4. Return unbiased result using modulo operation
 * 
 * FALLBACK STRATEGY: If crypto.randomBytes() fails (extremely rare), falls back
 * to Math.random() for availability, though this is less secure. The error is
 * logged for monitoring purposes.
 * 
 * @param {number} max - Maximum value (exclusive) for the random index
 * @returns {number} Unbiased random index in range [0, max-1]
 */
const secureRandomIndex = (max: number): number => { // generate secure random index without modulo bias using rejection sampling
  // Calculate rejection threshold to prevent modulo bias
  // Values below this threshold would cause uneven distribution
  const min = Math.floor((0xFFFFFFFF + 1) % max);
  let randomValue: number;
  
  try {
    // Rejection sampling loop - continue until we get an unbiased value
    do {
      // Generate 4 cryptographically secure random bytes
      const randomBytes = crypto.randomBytes(4);
      // Convert to unsigned 32-bit integer
      randomValue = randomBytes.readUInt32BE(0);
    } while (randomValue < min); // Reject values that would cause bias
  } catch (error) {
    // Log the error for security monitoring
    qerrors(error instanceof Error ? error : new Error(String(error)), 'secureRandomIndex', `Secure random generation failed for max: ${max}`);
    
    // Fallback to less secure Math.random() if crypto fails
    // This ensures the function remains available even in edge cases
    return Math.floor(Math.random() * max);
  }
  
  // Return unbiased result using modulo operation
  return randomValue % max;
};

/**
 * Securely shuffles an array using Fisher-Yates algorithm with cryptographically secure randomness
 * 
 * PURPOSE: Randomizes the order of password characters to ensure no predictable
 * patterns in the final password. Uses the Fisher-Yates shuffle algorithm which
 * provides uniform distribution of all possible permutations.
 * 
 * FISHER-YATES ALGORITHM: Considered the gold standard for array shuffling,
 * it provides unbiased random permutation by iteratively swapping elements
 * with randomly selected positions from the remaining unshuffled portion.
 * 
 * SECURITY: Uses secureRandomIndex() instead of Math.random() to ensure
 * cryptographic quality randomness, preventing predictability in the shuffle
 * pattern that could compromise password security.
 * 
 * @param {Array} array - Array to shuffle (typically password characters)
 * @returns {Array} New array with elements in random order
 */
const secureShuffleArray = (array: any): any => { // Fisher-Yates shuffle with cryptographically secure random number generation
  // Create a copy to avoid modifying the original array
  const result: any = [...array];
  
  // Fisher-Yates shuffle algorithm
  // Iterate from last element to first
  for (let i = result.length - 1; i > 0; i--) {
    // Select random index from remaining unshuffled elements
    const j: any = secureRandomIndex(i + 1);
    
    // Swap current element with randomly selected element
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};

export default generateSecurePassword;

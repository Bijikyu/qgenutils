'use strict';

import * as crypto from 'crypto'; // use crypto for secure randomness

const DEFAULT_LENGTH = 12; // default password length
const MIN_LENGTH = 8; // minimum secure length

interface PasswordOptions {
  includeSpecial?: boolean;
}

/**
 * Generates a cryptographically secure random password
 * @param {number} [length=12] - Password length (minimum 8)
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.includeSpecial=false] - Include special characters
 * @returns {string} Secure random password
 * @example
 * const password = generateSecurePassword(16);
 */
const generateSecurePassword = (length: number = DEFAULT_LENGTH, options: PasswordOptions = {}): string => { // generate secure random password
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

const secureRandomIndex = (max: number): number => { // generate secure random index without modulo bias
  // Use rejection sampling to avoid modulo bias
  const min = Math.floor((0xFFFFFFFF + 1) % max);
  let randomValue: number;
  
  do {
    const randomBytes = crypto.randomBytes(4);
    randomValue = randomBytes.readUInt32BE(0);
  } while (randomValue < min);
  
  return randomValue % max;
};

const secureShuffleArray = (array: any): any => { // Fisher-Yates shuffle with secure random
  const result: any = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j: any = secureRandomIndex(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default generateSecurePassword;

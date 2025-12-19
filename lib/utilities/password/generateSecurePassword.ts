'use strict';

const crypto: any = require('crypto'); // use crypto for secure randomness

const DEFAULT_LENGTH: any = 12; // default password length
const MIN_LENGTH: any = 8; // minimum secure length

/**
 * Generates a cryptographically secure random password
 * @param {number} [length=12] - Password length (minimum 8)
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.includeSpecial=false] - Include special characters
 * @returns {string} Secure random password
 * @example
 * const password: any = generateSecurePassword(16);
 */
const generateSecurePassword = (length: any = DEFAULT_LENGTH, options: any = {}): any => { // generate secure random password
  const effectiveLength: any = Math.max(length, MIN_LENGTH), includeSpecial = options.includeSpecial === true;

  const uppercase: any = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lowercase = 'abcdefghijklmnopqrstuvwxyz', numbers = '0123456789', special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let allChars = uppercase + lowercase + numbers;
  includeSpecial && (allChars += special);

  const passwordChars: any = [];

  passwordChars.push(uppercase[secureRandomIndex(uppercase.length)]);
  passwordChars.push(lowercase[secureRandomIndex(lowercase.length)]);
  passwordChars.push(numbers[secureRandomIndex(numbers.length)]);

  includeSpecial && passwordChars.push(special[secureRandomIndex(special.length)]);

  while (passwordChars.length < effectiveLength) {
    passwordChars.push(allChars[secureRandomIndex(allChars.length)]);
  }

  return secureShuffleArray(passwordChars).join('');
};

const secureRandomIndex = (max: any): any => { // generate secure random index
  const randomBytes: any = crypto.randomBytes(4), randomValue = randomBytes.readUInt32BE(0);
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

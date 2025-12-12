'use strict';

const crypto = require('crypto'); // use crypto for secure randomness

const DEFAULT_LENGTH = 12; // default password length
const MIN_LENGTH = 8; // minimum secure length

/**
 * Generates a cryptographically secure random password
 * @param {number} [length=12] - Password length (minimum 8)
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.includeSpecial=false] - Include special characters
 * @returns {string} Secure random password
 * @example
 * const password = generateSecurePassword(16);
 */
function generateSecurePassword(length = DEFAULT_LENGTH, options = {}) { // generate secure random password
  const effectiveLength = Math.max(length, MIN_LENGTH); // enforce minimum
  const includeSpecial = options.includeSpecial === true; // special chars optional

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // uppercase letters
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'; // lowercase letters
  const numbers = '0123456789'; // digits
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'; // special characters

  let allChars = uppercase + lowercase + numbers; // base character set
  if (includeSpecial) {
    allChars += special;
  }

  const passwordChars = []; // collect password characters

  passwordChars.push(uppercase[secureRandomIndex(uppercase.length)]); // ensure uppercase
  passwordChars.push(lowercase[secureRandomIndex(lowercase.length)]); // ensure lowercase
  passwordChars.push(numbers[secureRandomIndex(numbers.length)]); // ensure number

  if (includeSpecial) { // ensure special if requested
    passwordChars.push(special[secureRandomIndex(special.length)]);
  }

  while (passwordChars.length < effectiveLength) { // fill remaining length
    passwordChars.push(allChars[secureRandomIndex(allChars.length)]);
  }

  return secureShuffleArray(passwordChars).join(''); // shuffle and return
}

function secureRandomIndex(max) { // generate secure random index
  const randomBytes = crypto.randomBytes(4); // 4 bytes for good distribution
  const randomValue = randomBytes.readUInt32BE(0); // convert to number
  return randomValue % max; // modulo to get index
}

function secureShuffleArray(array) { // Fisher-Yates shuffle with secure random
  const result = [...array]; // copy array
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1); // secure random index
    [result[i], result[j]] = [result[j], result[i]]; // swap
  }
  return result;
}

module.exports = generateSecurePassword;

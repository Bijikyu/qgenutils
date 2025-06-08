
/**
 * A simple utility module
 * @module my-utility-module
 */

/**
 * Greets a person with a custom message
 * @param {string} name - The name of the person to greet
 * @param {string} [greeting='Hello'] - The greeting to use
 * @returns {string} The greeting message
 */
function greet(name, greeting = 'Hello') {
  if (!name || typeof name !== 'string') {
    throw new Error('Name must be a non-empty string');
  }
  return `${greeting}, ${name}!`;
}

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalize(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Generates a random number between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random number between min and max
 */
function randomBetween(min, max) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('Both min and max must be numbers');
  }
  if (min > max) {
    throw new Error('Min cannot be greater than max');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Export functions for CommonJS
module.exports = {
  greet,
  capitalize,
  randomBetween
};

// Export functions for ES modules (if needed)
module.exports.default = module.exports;

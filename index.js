
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

/**
 * Convert ISO string to locale display format
 * @param {string} dateString - The ISO date string to format
 * @returns {string} The formatted date string
 */
function formatDateTime(dateString) {
  console.log(`formatDateTime is running with ${dateString}`);
  try {
    if (!dateString) return 'N/A';
    const result = new Date(dateString).toLocaleString();
    console.log(`formatDateTime is returning ${result}`);
    return result;
  } catch (err) {
    console.log('formatDateTime has run resulting in a final value of failure');
    throw err;
  }
}

/**
 * Show elapsed time as hh:mm:ss format
 * @param {string} startDate - The start date ISO string
 * @param {string|null} [endDate] - The end date ISO string (optional, defaults to current time)
 * @returns {string} The formatted duration string
 */
function formatDuration(startDate, endDate = null) {
  console.log(`formatDuration is running with ${startDate} and ${endDate}`);
  try {
    if (!startDate) return '00:00:00';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const seconds = Math.floor(diffMs / 1000) % 60;
    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(`formatDuration is returning ${result}`);
    return result;
  } catch (err) {
    console.log('formatDuration has run resulting in a final value of failure');
    throw err;
  }
}

// Export functions for CommonJS
module.exports = {
  greet,
  capitalize,
  randomBetween,
  formatDateTime,
  formatDuration
};

// Export functions for ES modules (if needed)
module.exports.default = module.exports;

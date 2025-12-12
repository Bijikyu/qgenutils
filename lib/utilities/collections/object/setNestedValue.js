/**
 * Sets nested value in object using dot notation path.
 *
 * PURPOSE: Safely sets deeply nested properties, creating
 * intermediate objects as needed.
 *
 * @param {object} obj - Object to modify (mutates in place)
 * @param {string} path - Dot-separated path (e.g., 'user.address.city')
 * @param {*} value - Value to set
 */
const isPlainObject = require('./isPlainObject');

function setNestedValue(obj, path, value) {
  if (!obj || typeof obj !== 'object' || typeof path !== 'string') {
    return;
  }
  
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (!(key in current) || !isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

module.exports = setNestedValue;

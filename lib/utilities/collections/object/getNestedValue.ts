/**
 * Gets nested value from object using dot notation path.
 *
 * PURPOSE: Safely accesses deeply nested properties with default
 * fallback, avoiding "cannot read property of undefined" errors.
 *
 * @param {object} obj - Source object
 * @param {string} path - Dot-separated path (e.g., 'user.address.city')
 * @param {*} defaultValue - Value to return if path not found
 * @returns {*} Value at path or default
 */
function getNestedValue(obj, path, defaultValue) {
  if (!obj || typeof obj !== 'object' || typeof path !== 'string') {
    return defaultValue;
  }
  
  const keys: any = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object' || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
}

export default getNestedValue;

/**
 * Converts object to URL query string.
 *
 * PURPOSE: Builds query strings for API calls, URL construction,
 * and HTTP GET request parameters.
 *
 * @param {object} obj - Object with key-value pairs
 * @returns {string} URL-encoded query string (without leading ?)
 */
function toQueryString(obj) {
  if (!obj || typeof obj !== 'object') return '';
  
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

module.exports = toQueryString;

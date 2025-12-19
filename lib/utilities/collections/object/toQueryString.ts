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
  
  const params: any = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]: any): any => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export default toQueryString;

/**
 * Parses URL query string to object.
 *
 * PURPOSE: Extracts parameters from URLs for request handling,
 * navigation state, and filter/search parsing.
 *
 * @param {string} queryString - Query string (with or without leading ?)
 * @returns {object} Object with key-value pairs
 */
function fromQueryString(queryString) {
  if (typeof queryString !== 'string') return {};
  
  const cleaned = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  if (!cleaned) return {};
  
  const params = new URLSearchParams(cleaned);
  const result = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

module.exports = fromQueryString;

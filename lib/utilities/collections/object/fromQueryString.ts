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
  
  const cleaned: any = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  if (!cleaned) return {};
  
  const params: any = new URLSearchParams(cleaned);
  const result: any = {};
  
  params.forEach((value, key: any): any => {
    result[key] = value;
  });
  
  return result;
}

export default fromQueryString;

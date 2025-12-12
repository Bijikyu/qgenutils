/**
 * Creates standard JSON headers for HTTP requests.
 *
 * PURPOSE: Provides consistent header generation for JSON API requests,
 * with support for merging additional custom headers.
 *
 * @param {Record<string, string>} [additionalHeaders] - Optional additional headers to merge
 * @returns {Record<string, string>} Headers object with Content-Type set to application/json
 */
function createJsonHeaders(additionalHeaders) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (additionalHeaders && typeof additionalHeaders === 'object') {
    Object.assign(headers, additionalHeaders);
  }
  
  return headers;
}

module.exports = createJsonHeaders;

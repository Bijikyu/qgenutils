/**
 * Creates standard JSON headers for HTTP requests.
 *
 * PURPOSE: Provides consistent header generation for JSON API requests,
 * with support for merging additional custom headers.
 *
 * @param {Record<string, string>} [additionalHeaders] - Optional additional headers to merge
 * @returns {Record<string, string>} Headers object with Content-Type set to application/json
 */
function createJsonHeaders(additionalHeaders?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (additionalHeaders && typeof additionalHeaders === 'object') {
    // Validate all header values are strings
    for (const [key, value] of Object.entries(additionalHeaders)) {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }
  }
  
  return headers;
}

export default createJsonHeaders;

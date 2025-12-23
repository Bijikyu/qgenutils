/**
 * Extract API Key from Request
 * 
 * Retrieves an API key from various possible locations in an HTTP request object.
 * Supports extraction from headers (including Bearer token), query params, and body.
 * 
 * Key source priority:
 * 1. Authorization header (Bearer token format) - most secure for HTTPS
 * 2. Custom header names (x-api-key, api-key, etc.)
 * 3. Query parameter - fallback for simple integrations
 * 4. Request body - optional, disabled by default
 * 
 * @param {object} req - Request object with headers, query, and optionally body
 * @param {object} [options] - Extraction options
 * @param {string[]} [options.headerNames=['x-api-key', 'api-key']] - Header names to check
 * @param {string} [options.queryParam='api_key'] - Query parameter name
 * @param {string} [options.authPrefix='Bearer '] - Authorization header prefix
 * @param {boolean} [options.checkBody=false] - Whether to check request body
 * @param {string} [options.bodyField='api_key'] - Body field name for API key
 * @returns {string|null} The extracted API key, or null if not found
 */
function extractApiKey(req: any, options: any = {}) {
  if (!req || typeof req !== 'object') { // validate request object
    return null;
  }

  const {
    headerNames = ['x-api-key', 'api-key'],
    queryParam = 'api_key',
    authPrefix = 'Bearer ',
    checkBody = false,
    bodyField = 'api_key'
  } = options;

  const headers: any = req.headers || {}; // normalize headers access
  
  // Check if headers object exists and has the authorization property
  if (!headers || typeof headers !== 'object') {
    return null;
  }
  
  const authHeader = headers.authorization || headers.Authorization; // check Authorization header first
  if (authHeader && typeof authHeader === 'string') {
    // Case-insensitive check for the auth prefix
    const lowerAuthHeader = authHeader.toLowerCase();
    const lowerAuthPrefix = authPrefix.toLowerCase();
    if (lowerAuthHeader.startsWith(lowerAuthPrefix)) {
      const token = authHeader.slice(authPrefix.length).trim();
      if (token) return token;
    }
  }

  for (const headerName of headerNames) { // check custom header names
    const lowerName: any = headerName.toLowerCase();
    const value: any = headers[lowerName] || headers[headerName];
    if (value && typeof value === 'string') {
      const trimmed: any = value.trim();
      if (trimmed) return trimmed;
    }
  }

  const query: any = req.query || {}; // check query parameter
  if (queryParam && query[queryParam]) {
    const value: any = query[queryParam];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if (checkBody && req.body && typeof req.body === 'object') { // check request body if enabled
    const value: any = req.body[bodyField];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null; // no API key found
}

export default extractApiKey;

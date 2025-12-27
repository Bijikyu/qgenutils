import { qerrors } from 'qerrors';

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
 */

interface ExtractApiKeyOptions {
  headerNames?: string[];
  queryParam?: string;
  authPrefix?: string;
  checkBody?: boolean;
  bodyField?: string;
}

interface Request {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
}

function extractApiKey(req: Request, options: ExtractApiKeyOptions = {}) {
  try {
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

  const headers: Record<string, string | string[] | undefined> = req.headers || {}; // normalize headers access
  
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
    const lowerName: string = headerName.toLowerCase();
    const value: string | string[] | undefined = headers[lowerName] || headers[headerName];
    
    if (value) {
      if (typeof value === 'string') {
        const trimmed: string = value.trim();
        if (trimmed) return trimmed;
      } else if (Array.isArray(value)) {
        // Handle string arrays - take first non-empty string
        for (const item of value) {
          if (typeof item === 'string') {
            const trimmed: string = item.trim();
            if (trimmed) return trimmed;
          }
        }
      }
    }
  }

  const query: Record<string, string | string[] | undefined> = req.query || {}; // check query parameter
  if (queryParam && query[queryParam]) {
    const value: string | string[] | undefined = query[queryParam];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if (checkBody && req.body && typeof req.body === 'object') { // check request body if enabled
    const value: unknown = req.body?.[bodyField];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null; // no API key found
  } catch (err) {
    qerrors(err, 'extractApiKey', 'API key extraction failed');
    return null;
  }
}

export default extractApiKey;

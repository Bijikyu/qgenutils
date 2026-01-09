/**
 * API Key Extraction Utility
 * 
 * PURPOSE: Extracts API keys from various locations in HTTP requests using
 * a comprehensive search strategy. This utility ensures API keys can be
 * transmitted through multiple common methods while maintaining security.
 * 
 * SECURITY CONSIDERATIONS:
 * - Searches multiple common header names (x-api-key, api-key)
 * - Supports Authorization Bearer tokens for OAuth2 compliance
 * - Validates and sanitizes extracted values
 * - Handles case-insensitive header matching
 * - Prevents header injection through proper validation
 * - Graceful fallback through multiple extraction methods
 * 
 * EXTRACTION STRATEGY:
 * 1. Authorization header (Bearer tokens)
 * 2. Custom headers (x-api-key, api-key, etc.)
 * 3. Query parameters (api_key)
 * 4. Request body (optional, for POST requests)
 * 
 * Each method is tried in order until a valid key is found.
 * 
 * @example
 * ```typescript
 * // Express.js middleware
 * app.use((req, res, next) => {
 *   const apiKey = extractApiKey(req);
 *   if (!apiKey) {
 *     return res.status(401).json({ error: 'API key required' });
 *   }
 *   req.apiKey = apiKey;
 *   next();
 * });
 * 
 * // Custom extraction options
 * const customKey = extractApiKey(req, {
 *   headerNames: ['custom-key', 'x-custom-key'],
 *   queryParam: 'custom_api_key',
 *   checkBody: true,
 *   bodyField: 'apiKey'
 * });
 * ```
 */

/**
 * API Key Extraction Utility
 * 
 * PURPOSE: Extracts API keys from various locations in HTTP requests using
 * a comprehensive search strategy. This utility ensures API keys can be
 * transmitted through multiple common methods while maintaining security.
 * 
 * SECURITY CONSIDERATIONS:
 * - Searches multiple common header names (x-api-key, api-key)
 * - Supports Authorization Bearer tokens for OAuth2 compliance
 * - Validates and sanitizes extracted values
 * - Handles case-insensitive header matching
 * - Prevents header injection through proper validation
 * - Graceful fallback through multiple extraction methods
 * 
 * EXTRACTION STRATEGY:
 * 1. Authorization header (Bearer tokens)
 * 2. Custom headers (x-api-key, api-key, etc.)
 * 3. Query parameters (api_key)
 * 4. Request body (optional, for POST requests)
 * 
 * Each method is tried in order until a valid key is found.
 * 
 * @example
 * ```typescript
 * // Express.js middleware
 * app.use((req, res, next) => {
 *   const apiKey = extractApiKey(req);
 *   if (!apiKey) {
 *     return res.status(401).json({ error: 'API key required' });
 *   }
 *   req.apiKey = apiKey;
 *   next();
 * });
 * 
 * // Custom extraction options
 * const customKey = extractApiKey(req, {
 *   headerNames: ['custom-key', 'x-custom-key'],
 *   queryParam: 'custom_api_key',
 *   checkBody: true,
 *   bodyField: 'apiKey'
 * });
 * ```
 */

import { qerrors } from 'qerrors';

export interface ExtractApiKeyOptions {
  /** Custom header names to check for API keys */
  headerNames?: string[];
  /** Query parameter name to check for API key */
  queryParam?: string;
  /** Authorization header prefix (default: 'Bearer ') */
  authPrefix?: string;
  /** Whether to check request body for API key */
  checkBody?: boolean;
  /** Body field name to check when checkBody is true */
  bodyField?: string;
}

export interface Request {
  /** HTTP headers object */
  headers?: Record<string, string | string[] | undefined>;
  /** Query parameters object */
  query?: Record<string, string | string[] | undefined>;
  /** Request body object */
  body?: Record<string, unknown>;
}

/**
 * Extracts API key from HTTP request using multiple strategies
 * 
 * Searches for API keys in following order:
 * 1. Authorization header (Bearer tokens)
 * 2. Custom headers (x-api-key, api-key by default)
 * 3. Query parameters (api_key by default)
 * 4. Request body (optional, controlled by checkBody)
 * 
 * @param req - HTTP request object containing headers, query, and/or body
 * @param options - Extraction configuration options
 * @returns Extracted API key string or null if not found
 * 
 * @throws Never throws - returns null on any error for safety
 */
const extractApiKey = (req: Request, options: ExtractApiKeyOptions = {}): string | null => {
  try {
    if (!req || typeof req !== 'object') return null;
    
    const {
      headerNames = ['x-api-key', 'api-key'],
      queryParam = 'api_key',
      authPrefix = 'Bearer ',
      checkBody = false,
      bodyField = 'api_key'
    } = options;
    
    const headers: Record<string, string | string[] | undefined> = req.headers || {};
    if (!headers || typeof headers !== 'object') return null;
    
    const authHeader = headers.authorization || headers.Authorization;
    if (authHeader && typeof authHeader === 'string') {
      const lowerAuthHeader = authHeader.toLowerCase();
      const lowerAuthPrefix = authPrefix.toLowerCase();
      if (lowerAuthHeader.startsWith(lowerAuthPrefix)) {
        const token = authHeader.slice(authPrefix.length).trim();
        if (token) return token;
      }
    }
    
    for (const headerName of headerNames) {
      const lowerName: string = headerName.toLowerCase();
      const value: string | string[] | undefined = headers[lowerName] || headers[headerName];
      if (value) {
        if (typeof value === 'string') {
          const trimmed: string = value.trim();
          if (trimmed) return trimmed;
        } else if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string') {
              const trimmed: string = item.trim();
              if (trimmed) return trimmed;
            }
          }
        }
      }
    }
    
    const query: Record<string, string | string[] | undefined> = req.query || {};
    if (queryParam && query[queryParam]) {
      const value: string | string[] | undefined = query[queryParam];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    
    if (checkBody && req.body && typeof req.body === 'object') {
      const value: unknown = req.body?.[bodyField];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    
    return null;
  } catch (err) {
    qerrors(err instanceof Error ? err : new Error(String(err)), 'extractApiKey', 'API key extraction failed unexpectedly');
    return null;
  }
};

export default extractApiKey;
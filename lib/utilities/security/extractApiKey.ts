/**
 * API KEY EXTRACTION UTILITY
 * 
 * PURPOSE: Provides secure and flexible API key extraction from HTTP requests with support
 * for multiple authentication patterns. This utility is designed to work with various
 * API authentication methods while maintaining security best practices.
 * 
 * SECURITY DESIGN PRINCIPLES:
 * - Prioritizes secure methods (Authorization header over query params)
 * - Supports both Bearer token and custom header patterns
 * - Handles case-insensitive header matching for robustness
 * - Sanitizes all extracted values (trimming whitespace)
 * - Graceful error handling prevents information disclosure
 * - Configurable options for different API requirements
 * 
 * EXTRACTION PRIORITY (most secure to least secure):
 * 1. Authorization header with Bearer token (OAuth 2.0 / JWT standard)
 * 2. Custom API key headers (x-api-key, api-key, etc.)
 * 3. Query parameters (for simple integrations, less secure)
 * 4. Request body (configurable, least secure due to logging concerns)
 * 
 * USE CASES:
 * - REST API middleware authentication
 * - GraphQL API key validation
 * - Webhook signature verification
 * - Microservice internal authentication
 * - Third-party integration support
 */

import { qerrors } from 'qerrors'; // Centralized error handling system

/**
 * Configuration options for API key extraction behavior.
 * 
 * These options allow customization of extraction strategy to match different
 * API authentication requirements and security policies.
 */
interface ExtractApiKeyOptions {
  /** Array of custom header names to check for API keys */
  headerNames?: string[];
  /** Query parameter name for API key (default: 'api_key') */
  queryParam?: string;
  /** Authorization header prefix (default: 'Bearer ') */
  authPrefix?: string;
  /** Whether to check request body for API key (default: false) */
  checkBody?: boolean;
  /** Field name in request body for API key (default: 'api_key') */
  bodyField?: string;
}

/**
 * HTTP request interface for type safety.
 * 
 * This interface represents a typical HTTP request object with the
 * fields commonly used for API key authentication.
 */
interface Request {
  /** HTTP headers (case-insensitive access) */
  headers?: Record<string, string | string[] | undefined>;
  /** URL query parameters */
  query?: Record<string, string | string[] | undefined>;
  /** Request body payload */
  body?: Record<string, unknown>;
}

/**
 * Extracts API key from HTTP request using multiple strategies.
 * 
 * This function searches for API keys in common request locations following
 * security best practices. It prioritizes more secure methods and provides
 * comprehensive options for different authentication patterns.
 * 
 * @param req - HTTP request object containing headers, query, and body
 * @param options - Configuration options for extraction behavior
 * 
 * @returns string | null - Extracted API key or null if not found
 * 
 * @example
 * ```typescript
 * // Basic usage with defaults
 * const apiKey = extractApiKey(req);
 * 
 * // Custom configuration
 * const apiKey = extractApiKey(req, {
 *   headerNames: ['x-custom-key', 'authorization'],
 *   queryParam: 'token',
 *   authPrefix: 'Token ',
 *   checkBody: true,
 *   bodyField: 'access_token'
 * });
 * 
 * // Request with Bearer token in Authorization header
 * // headers: { authorization: 'Bearer abc123' }
 * // Returns: 'abc123'
 * 
 * // Request with custom header
 * // headers: { 'x-api-key': 'def456' }
 * // Returns: 'def456'
 * 
 * // Request with query parameter
 * // query: { api_key: 'ghi789' }
 * // Returns: 'ghi789'
 * ```
 * 
 * @note Returns null if no API key is found or if request is invalid
 * @warning Query parameter authentication is less secure than headers
 */
function extractApiKey(req: Request, options: ExtractApiKeyOptions = {}): string | null {
  try {
    // INPUT VALIDATION: Ensure request object is valid
    // Prevents errors when req is null, undefined, or not an object
    if (!req || typeof req !== 'object') {
      return null;
    }

    // OPTIONS CONFIGURATION: Set default values and merge with provided options
    // These defaults follow common industry practices for API authentication
    const {
      headerNames = ['x-api-key', 'api-key'], // Common custom API key headers
      queryParam = 'api_key',                  // Standard query parameter name
      authPrefix = 'Bearer ',                 // OAuth 2.0 Bearer token format
      checkBody = false,                      // Body checking disabled by default (security)
      bodyField = 'api_key'                   // Default body field name
    } = options;

    // HEADER EXTRACTION: Normalize headers access and validate structure
    const headers: Record<string, string | string[] | undefined> = req.headers || {};
    
    // Validate headers object to prevent runtime errors
    if (!headers || typeof headers !== 'object') {
      return null;
    }
    
    // AUTHORIZATION HEADER: Check for Bearer token format (most secure method)
    // Supports both 'authorization' and 'Authorization' header names
    const authHeader = headers.authorization || headers.Authorization;
    if (authHeader && typeof authHeader === 'string') {
      // Case-insensitive prefix matching for robustness
      const lowerAuthHeader = authHeader.toLowerCase();
      const lowerAuthPrefix = authPrefix.toLowerCase();
      
      if (lowerAuthHeader.startsWith(lowerAuthPrefix)) {
        // Extract token after prefix and trim whitespace
        const token = authHeader.slice(authPrefix.length).trim();
        if (token) return token;
      }
    }

    // CUSTOM HEADERS: Check for API key in configured custom headers
    // Supports multiple header names and handles case variations
    for (const headerName of headerNames) {
      const lowerName: string = headerName.toLowerCase();
      
      // Check both original case and lowercase for compatibility
      const value: string | string[] | undefined = headers[lowerName] || headers[headerName];
      
      if (value) {
        // STRING VALUES: Handle simple string header values
        if (typeof value === 'string') {
          const trimmed: string = value.trim();
          if (trimmed) return trimmed;
        } 
        // ARRAY VALUES: Handle multi-value headers (common in some frameworks)
        else if (Array.isArray(value)) {
          // Find first non-empty string in the array
          for (const item of value) {
            if (typeof item === 'string') {
              const trimmed: string = item.trim();
              if (trimmed) return trimmed;
            }
          }
        }
      }
    }

    // QUERY PARAMETERS: Check URL query parameters (less secure fallback)
    // Useful for simple integrations and testing, but not recommended for production
    const query: Record<string, string | string[] | undefined> = req.query || {};
    if (queryParam && query[queryParam]) {
      const value: string | string[] | undefined = query[queryParam];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    // REQUEST BODY: Check request body if enabled (optional, least secure)
    // Often disabled in production due to security and logging concerns
    if (checkBody && req.body && typeof req.body === 'object') {
      const value: unknown = req.body?.[bodyField];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    // NO API KEY FOUND: Return null to indicate failed extraction
    return null;
    
  } catch (err) {
    // ERROR HANDLING: Log errors but return null to maintain system stability
    // Prevents information disclosure about internal errors
    qerrors(
      err instanceof Error ? err : new Error(String(err)), 
      'extractApiKey', 
      'API key extraction failed unexpectedly'
    );
    return null;
  }
}

export default extractApiKey;

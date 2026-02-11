/**
 * Parse URL into Base URL and Endpoint Parts
 *
 * RATIONALE: API clients often need to separate the base URL (for server/routing)
 * from the endpoint path (for specific API calls). This separation enables
 * flexible API routing and proxy configurations. By parsing and
 * returning structured segments we avoid string concatenation mistakes that may
 * allow path traversal or host spoofing.
 *
 * IMPLEMENTATION STRATEGY:
 * - Normalize URL with protocol first (ensures valid parsing)
 * - Use URL constructor for robust parsing of complex URLs
 * - Split into origin (base) and pathname+search (endpoint)
 * - Return structured object for easy destructuring
 * - Often the final step after ensureProtocol and normalizeUrlOrigin
 *
 * RETURN STRUCTURE:
 * {
 *   baseUrl: "https://api.example.com",     // Origin only
 *   endpoint: "/v1/users?limit=10"          // Path + query string
 * }
 *
 * USE CASES:
 * - API proxy configuration (route based on baseUrl, forward endpoint)
 * - Load balancing (distribute based on baseUrl)
 * - Caching strategies (cache by endpoint within baseUrl)
 * - Request routing in microservices
 *
 * WHY COMBINE PATHNAME AND SEARCH:
 * The endpoint typically includes both the path (/api/users) and query parameters
 * (?limit=10) as they're both part of the specific API call being made.
 *
 * ERROR HANDLING:
 * Returns null if URL parsing fails, allowing caller to handle invalid URLs
 * appropriately (show error, use default, etc.). Failing closed
 * avoids routing requests to unintended endpoints when input is malformed.
 *
 * @param {string} url - The URL to parse into components
 * @returns {object|null} Object with baseUrl and endpoint properties, or null if parsing fails
 * @throws Never throws - returns null on any parsing error
 *
 * @example
 * ```typescript
 * import parseUrlParts from './parseUrlParts.js';
 *
 * // Basic API URL parsing
 * const result = parseUrlParts('https://api.example.com/v1/users?limit=10');
 * console.log(result);
 * // { baseUrl: 'https://api.example.com', endpoint: '/v1/users?limit=10' }
 *
 * // URL without protocol
 * const result2 = parseUrlParts('api.example.com/v2/posts');
 * console.log(result2);
 * // { baseUrl: 'https://api.example.com', endpoint: '/v2/posts' }
 *
 * // URL with port
 * const result3 = parseUrlParts('https://localhost:3000/api/items');
 * console.log(result3);
 * // { baseUrl: 'https://localhost:3000', endpoint: '/api/items' }
 *
 * // Using in API client
 * class APIClient {
 *   private baseUrl: string;
 *
 *   constructor(apiUrl: string) {
 *     const parsed = parseUrlParts(apiUrl);
 *     if (!parsed) {
 *       throw new Error('Invalid API URL provided');
 *     }
 *     this.baseUrl = parsed.baseUrl;
 *   }
 *
 *   async request(endpoint: string, options?: RequestInit) {
 *     const fullUrl = this.baseUrl + endpoint;
 *     return fetch(fullUrl, options);
 *   }
 *
 *   // Convenience method using parsed parts
 *   async get(endpoint: string) {
 *     return this.request(endpoint);
 *   }
 * }
 *
 * const client = new APIClient('https://api.example.com');
 * await client.get('/v1/users'); // GET https://api.example.com/v1/users
 *
 * // Load balancing example
 * const urls = [
 *   'https://api1.example.com',
 *   'https://api2.example.com',
 *   'https://api3.example.com'
 * ];
 *
 * function selectServer(requestUrl: string) {
 *   const parsed = parseUrlParts(requestUrl);
 *   if (!parsed) return urls[0];
 *
 *   // Use hash of endpoint for consistent server selection
 *   const hash = parsed.endpoint.split('').reduce((a, b) => {
 *     a = ((a << 5) - a) + b.charCodeAt(0);
 *     return a & a;
 *   }, 0);
 *
 *   const index = Math.abs(hash) % urls.length;
 *   return urls[index];
 * }
 *
 * const server = selectServer('/api/users');
 * console.log(`Routing to: ${server}`);
 *
 * // Edge cases
 * console.log(parseUrlParts('invalid-url'));     // null
 * console.log(parseUrlParts(''));                // null
 * console.log(parseUrlParts(null));             // null
 * ```
 */

import { qerr as qerrors } from '@bijikyu/qerrors';
import logger from '../../logger.js';
import ensureProtocol from './ensureProtocol.js';

function parseUrlParts(url) {
  logger.debug(`parseUrlParts is running with ${url}`);

  try {
    // First normalize the URL to ensure it has a protocol for valid parsing
    const processedUrl: any = ensureProtocol(url)?.processed;

    // If protocol normalization failed, abort parsing
    if (!processedUrl || typeof processedUrl !== 'string' || processedUrl.endsWith('://')) {
      logger.debug('parseUrlParts is returning null');
      return null;
    }

    // Parse URL into components using native URL constructor
    const parsed: any = new URL(processedUrl);

    // Create structured result with base URL and endpoint
    const result = {
      baseUrl: parsed.origin,                    // protocol + domain + port only
      endpoint: parsed.pathname + parsed.search  // path plus query string
    };

    logger.debug(`parseUrlParts is returning ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    // Handle URLs that can't be parsed by URL constructor
    const errorObj = error instanceof Error ? error : new Error(String(error));
    qerrors(errorObj, 'parseUrlParts');
    logger.error(`parseUrlParts failed with error: ${errorObj.message}`);
    return null; // fail closed on parse error to avoid unsafe routing
  }
}

export default parseUrlParts;

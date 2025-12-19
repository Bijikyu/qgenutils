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
 */

import { qerrors } from 'qerrors';
import logger from '../../logger.js';
const ensureProtocol: any = require('./ensureProtocol');

function parseUrlParts(url) {
  logger.debug(`parseUrlParts is running with ${url}`);
  
  try {
    // First normalize the URL to ensure it has a protocol for valid parsing
    const processedUrl: any = ensureProtocol(url);

    // If protocol normalization failed, abort parsing
    if (processedUrl === null) {
      logger.debug(`parseUrlParts is returning null`);
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
    qerrors(error, `parseUrlParts`, { url });
    logger.error(`parseUrlParts failed with error: ${error.message}`);
    return null; // fail closed on parse error to avoid unsafe routing
  }
}

export default parseUrlParts;
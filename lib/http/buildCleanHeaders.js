/**
 * Build Clean Headers Object by Removing Dangerous/Infrastructure Headers
 * 
 * RATIONALE: When proxying HTTP requests, certain headers should be stripped to:
 * - Prevent header pollution attacks
 * - Stop information disclosure about internal infrastructure
 * - Ensure clean requests to upstream APIs
 * - Remove routing and CDN-specific headers that confuse upstream servers
 * 
 * IMPLEMENTATION STRATEGY:
 * - Create shallow copy of headers to avoid mutating original object
 * - Remove predefined list of dangerous/infrastructure headers
 * - Handle case-insensitive header matching (HTTP headers are case-insensitive)
 * - Preserve all other headers for legitimate request forwarding
 * - Log header cleaning operations for debugging proxy issues
 * 
 * HEADERS REMOVED:
 * - host: Routing header that confuses upstream servers
 * - x-target-url: Internal routing header
 * - x-api-key: May contain sensitive authentication data
 * - cdn-loop: CDN-specific header that shouldn't be forwarded
 * - cf-*: Cloudflare-specific headers (IP, country, ray, visitor)
 * - render-proxy-ttl: Render.com-specific proxy header
 * - connection: HTTP/1.1 connection management header
 * 
 * SECURITY CONSIDERATIONS:
 * - Prevents leakage of internal infrastructure details
 * - Blocks headers that could be used for injection attacks
 * - Ensures upstream services receive clean, standard headers
 * - Protects sensitive routing and authentication information
 * 
 * @param {object} originalHeaders - Headers object to clean (typically req.headers)
 * @returns {object} New headers object with dangerous headers removed
 * @throws Never throws - returns empty object for invalid input
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');
const { HEADERS_TO_REMOVE } = require('loqatevars/config/localVars');

function buildCleanHeaders(originalHeaders) {
  console.log('buildCleanHeaders processing headers for proxy forwarding');
  logger.debug('buildCleanHeaders: starting header cleaning', {
    originalHeaderCount: originalHeaders ? Object.keys(originalHeaders).length : 0,
    hasHeaders: !!originalHeaders
  });

  try {
    // Validate input headers object
    if (!originalHeaders || typeof originalHeaders !== 'object') {
      console.log('buildCleanHeaders: invalid headers object, returning empty object');
      logger.warn('buildCleanHeaders: invalid headers object provided', {
        headersType: typeof originalHeaders,
        isNull: originalHeaders === null
      });
      return {};
    }

    // Handle array input (shouldn't happen but be defensive)
    if (Array.isArray(originalHeaders)) {
      console.log('buildCleanHeaders: received array instead of object, returning empty object');
      logger.warn('buildCleanHeaders: array provided instead of headers object');
      return {};
    }

    // Create shallow copy to avoid mutating original headers
    const cleanHeaders = { ...originalHeaders };
    let removedCount = 0;
    const removedHeaders = [];

    // Remove each dangerous header (case-insensitive matching)
    for (const headerToRemove of HEADERS_TO_REMOVE) {
      // Check both lowercase and actual case variants
      const lowerHeader = headerToRemove.toLowerCase();
      
      // Find matching header keys (HTTP headers are case-insensitive)
      const matchingKeys = Object.keys(cleanHeaders).filter(key => 
        key.toLowerCase() === lowerHeader
      );
      
      // Remove all matching header variants
      for (const key of matchingKeys) {
        delete cleanHeaders[key];
        removedCount++;
        removedHeaders.push(key);
      }
    }

    const finalHeaderCount = Object.keys(cleanHeaders).length;
    
    console.log(`buildCleanHeaders: removed ${removedCount} headers, ${finalHeaderCount} headers remaining`);
    logger.debug('buildCleanHeaders: header cleaning completed', {
      originalCount: Object.keys(originalHeaders).length,
      removedCount,
      finalCount: finalHeaderCount,
      removedHeaders: removedHeaders.length > 0 ? removedHeaders : 'none'
    });

    return cleanHeaders;

  } catch (error) {
    // Handle any unexpected errors during header processing
    console.error('buildCleanHeaders encountered unexpected error:', error.message);
    qerrors(error, 'buildCleanHeaders', {
      originalHeadersType: typeof originalHeaders,
      errorMessage: error.message
    });
    logger.error('buildCleanHeaders failed with error', {
      error: error.message,
      originalHeadersType: typeof originalHeaders,
      stack: error.stack
    });

    // Return empty object as safe fallback
    return {};
  }
}

module.exports = buildCleanHeaders;
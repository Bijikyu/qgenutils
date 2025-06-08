/*
 * HTTP Utility Module
 * 
 * This module provides HTTP-related utilities for web applications, focusing on
 * header management, content-length calculation, and response standardization.
 * 
 * DESIGN PHILOSOPHY:
 * - Security first: Remove potentially dangerous headers from proxied requests
 * - Accuracy: Calculate content-length precisely to prevent HTTP issues
 * - Consistency: Standardize JSON responses across the application
 * - Resilience: Handle edge cases gracefully without breaking request flow
 * 
 * PRIMARY USE CASES:
 * - API proxying where headers need cleaning
 * - Content-length calculation for HTTP compliance
 * - Standardized error responses
 * - Header validation and extraction
 */

const { qerrors } = require('qerrors');

/*
 * Headers Removal Configuration
 * 
 * RATIONALE FOR HEADER REMOVAL:
 * These headers are stripped from proxied requests because they:
 * 1. Contain routing information that shouldn't be forwarded (host, x-target-url)
 * 2. Are CDN/proxy-specific and would confuse upstream servers (cf-*, cdn-loop)
 * 3. Contain sensitive infrastructure details that shouldn't leak (cf-ray, render-proxy-ttl)
 * 4. Are connection-specific and invalid when forwarding (connection)
 * 
 * SECURITY IMPLICATIONS:
 * - Prevents header pollution attacks
 * - Stops information disclosure about internal infrastructure
 * - Ensures clean requests to upstream APIs
 * 
 * MAINTENANCE NOTE:
 * Add new headers here if they cause issues with upstream services or leak
 * sensitive information about the proxy infrastructure.
 */

// Headers removed in all proxied requests for reuse
const HEADERS_TO_REMOVE = [
    'host',              // Routing header that confuses upstream servers
    'x-target-url',      // Our internal routing header
    'x-api-key',         // May contain sensitive authentication data
    'cdn-loop',          // CDN-specific header that shouldn't be forwarded
    'cf-connecting-ip',  // Cloudflare-specific client IP header
    'cf-ipcountry',      // Cloudflare geolocation header
    'cf-ray',            // Cloudflare request tracing header (sensitive)
    'cf-visitor',        // Cloudflare visitor information
    'render-proxy-ttl',  // Render.com-specific proxy header
    'connection'         // HTTP/1.1 connection management header
];

/**
 * Calculate the content length of a body in bytes
 * 
 * RATIONALE: HTTP requires accurate Content-Length headers for proper request/response
 * handling. Incorrect content-length can cause:
 * - Request truncation or hanging
 * - Server timeouts
 * - HTTP/1.1 compliance issues
 * - Proxy and load balancer problems
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use Buffer.byteLength() for accurate UTF-8 byte counting (not character count)
 * - Handle various input types (string, object, null, empty)
 * - Distinguish between undefined (error) and empty content (zero length)
 * - Return string format as HTTP headers must be strings
 * 
 * EDGE CASES HANDLED:
 * - Undefined input (throws - indicates developer error)
 * - Null input (returns '0' - valid empty body)
 * - Empty string (returns '0' - valid empty body)
 * - Empty object (returns '0' - valid empty JSON)
 * - Unicode characters (accurate byte counting)
 * 
 * WHY NOT String.length:
 * String.length counts characters, not bytes. UTF-8 characters can be 1-4 bytes,
 * so "é" has length 1 but byte length 2. HTTP requires byte count.
 * 
 * @param {*} body - The body to calculate length for (string, object, null, etc.)
 * @returns {string} The content length as a string (HTTP headers require string format)
 * @throws {TypeError} If body is undefined (indicates coding error that should be fixed)
 */
function calculateContentLength(body) {
  console.log(`calculateContentLength is running with ${body}`); // Log input for debugging content issues
  try {
    // Handle undefined input as an error - indicates developer mistake
    if (body === undefined) {
      throw new TypeError('Body is undefined');
    }

    // Check for empty object specifically before other object handling
    const emptyObj = typeof body === 'object' && body !== null && Object.keys(body).length === 0;

    // Handle all valid "empty" body types - these should return '0'
    if (body === null || body === '' || emptyObj) {
      console.log(`calculateContentLength is returning 0`); // Log zero-length determination
      return '0';
    }

    // Handle string bodies - most common case for simple content
    if (typeof body === 'string') {
      const len = Buffer.byteLength(body, 'utf8'); // Accurate UTF-8 byte counting
      console.log(`calculateContentLength is returning ${len}`);
      return len.toString();
    }

    // Handle object bodies - JSON APIs
    if (typeof body === 'object') {
      const jsonString = JSON.stringify(body); // Convert to wire format
      const len = Buffer.byteLength(jsonString, 'utf8'); // Count bytes of JSON string
      console.log(`calculateContentLength is returning ${len}`);
      return len.toString();
    }

    // Fallback for unknown types (numbers, booleans, etc.)
    // These shouldn't occur in typical HTTP usage but we handle gracefully
    console.log(`calculateContentLength is returning 0`);
    return '0';
  } catch (error) {
    // Log error with context for debugging
    qerrors(error, 'calculateContentLength', { body });
    throw error; // Re-throw so caller can handle invalid input appropriately
  }
}

/**
 * Build clean headers by removing unwanted headers and managing content-length
 * 
 * RATIONALE: When proxying requests, headers from the original request often contain
 * information that shouldn't be forwarded (routing data, CDN headers, etc.) or
 * that becomes incorrect after request modification (content-length).
 * 
 * IMPLEMENTATION STRATEGY:
 * - Clone headers to avoid mutating original request object
 * - Remove all blacklisted headers that could cause issues
 * - Recalculate content-length only when necessary (has body)
 * - Handle GET requests specially (should never have content-length)
 * 
 * WHY RECALCULATE CONTENT-LENGTH:
 * The original content-length might be incorrect if:
 * - Request body was modified before proxying
 * - Headers were added/removed that affect body
 * - Character encoding changed during processing
 * 
 * GET REQUEST HANDLING:
 * GET requests shouldn't have bodies or content-length headers per HTTP spec.
 * Some clients send them anyway, so we actively remove them.
 * 
 * @param {object} headers - Original headers object from request
 * @param {string} method - HTTP method (GET, POST, PUT, etc.)
 * @param {*} body - Request body content
 * @returns {object} Cleaned headers object safe for forwarding
 */
function buildCleanHeaders(headers, method, body) {
    console.log(`buildCleanHeaders is running with ${method}`); // Log method for debugging header logic
    try {
        // Clone headers to avoid mutating original request object
        // Spreading creates shallow copy which is sufficient for header objects
        const cleanHeaders = { ...headers };

        // Remove all blacklisted headers that shouldn't be forwarded
        HEADERS_TO_REMOVE.forEach(header => { delete cleanHeaders[header]; });

        // Handle content-length based on method and body presence
        // GET requests should never have content-length, even if originally present
        if (!body || method.toLowerCase() === 'get') {
            delete cleanHeaders['content-length'];
        }

        // For non-GET requests with actual body content, set accurate content-length
        if (method.toLowerCase() !== 'get' && body && Object.keys(body).length > 0) {
            cleanHeaders['content-length'] = calculateContentLength(body);
        }

        console.log(`buildCleanHeaders is returning ${JSON.stringify(cleanHeaders)}`); // Log result for debugging
        return cleanHeaders;
    } catch (error) {
        // Log error but return original headers as fallback
        // This prevents complete request failure due to header cleaning issues
        qerrors(error, 'buildCleanHeaders', { method });
        return headers; // Fallback to original headers if cleaning fails
    }
}

/**
 * Send a consistent JSON response
 * 
 * RATIONALE: API consistency is crucial for client applications. Having a centralized
 * response function ensures all JSON responses follow the same format and include
 * proper headers and status codes.
 * 
 * BENEFITS:
 * - Consistent response format across entire application
 * - Proper Content-Type headers automatically set
 * - Logging of all API responses for debugging
 * - Single point to modify response format if needed
 * 
 * DESIGN DECISION:
 * This function intentionally stays simple - no response transformation,
 * no complex error handling. It's a thin wrapper around Express's json()
 * method with added logging.
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 400, 500, etc.)
 * @param {object} data - Response data to be JSON-serialized
 */
function sendJsonResponse(res, statusCode, data) {
  console.log(`sendJsonResponse is sending ${statusCode} with`, data); // Log all responses for API debugging
  res.status(statusCode).json(data); // Express handles JSON serialization and Content-Type header
}

/**
 * Extract and validate required HTTP headers
 * 
 * RATIONALE: Many API operations require specific headers (authorization, content-type,
 * custom API keys). This function centralizes the pattern of "get header or return error"
 * to avoid repetitive code throughout the application.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use optional chaining (?.) to safely access headers even if undefined
 * - Return null to indicate failure (allows caller to handle appropriately)
 * - Send error response immediately (fail-fast approach)
 * - Use provided error message for custom error descriptions
 * 
 * ERROR HANDLING STRATEGY:
 * When a required header is missing, we immediately send an error response
 * rather than throwing an exception. This prevents the request from continuing
 * with invalid state and provides clear feedback to the client.
 * 
 * WHY OPTIONAL CHAINING:
 * In some edge cases, req.headers might be undefined or malformed.
 * Optional chaining prevents "Cannot read property of undefined" errors.
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} headerName - Name of the required header (case-insensitive)
 * @param {number} statusCode - Status code to send if header is missing
 * @param {string} errorMessage - Error message to send if header is missing
 * @returns {string|null} The header value or null if missing/error
 */
function getRequiredHeader(req, res, headerName, statusCode, errorMessage) {
  console.log(`getRequiredHeader is running with ${headerName}`); // Log header extraction attempt
  try {
    // Safely access header value even if headers object is undefined
    // Express normalizes header names to lowercase, so this handles case variations
    const headerValue = req?.headers?.[headerName];

    if (!headerValue) {
      // Send standardized error response immediately
      sendJsonResponse(res, statusCode, { error: errorMessage });
      console.log(`getRequiredHeader is returning null due to missing header`);
      return null; // Signal to caller that header was missing
    }

    console.log(`getRequiredHeader is returning ${headerValue}`); // Log successful extraction (be careful with sensitive headers in production)
    return headerValue;
  } catch (error) {
    // Handle unexpected errors in header processing
    qerrors(error, 'getRequiredHeader', { headerName, statusCode, errorMessage });
    sendJsonResponse(res, 500, { error: 'Internal server error' }); // Generic error for unexpected issues
    return null; // Signal failure to calling code
  }
}

/*
 * Module Export Strategy:
 * 
 * We export both the functions and the HEADERS_TO_REMOVE constant because:
 * 1. Functions are the primary interface for this module
 * 2. HEADERS_TO_REMOVE might be useful for tests or configuration validation
 * 3. Named exports make the API clear and allow selective importing
 * 4. Constants help with maintainability and prevent magic strings
 */
module.exports = {
  calculateContentLength,
  buildCleanHeaders,
  sendJsonResponse,
  getRequiredHeader,
  HEADERS_TO_REMOVE
};
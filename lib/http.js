
/**
 * HTTP Utilities Module
 * 
 * This module handles HTTP-specific operations including header management,
 * content length calculation, and response formatting. It's designed to support
 * both direct HTTP handling and proxy/forwarding scenarios.
 * 
 * The functions in this module solve common problems in web applications:
 * 1. Accurate content-length calculation for various data types
 * 2. Header cleaning for proxy scenarios to prevent conflicts
 * 3. Consistent JSON response formatting
 * 4. Safe header extraction with validation
 */

const { qerrors } = require('qerrors');

/**
 * Headers removed in all proxied requests for reuse
 * 
 * This array defines headers that must be stripped when forwarding requests
 * to prevent conflicts, security issues, or improper behavior in proxy scenarios.
 * 
 * Rationale for each header removal:
 * - 'host': Must be set to target server, not original client request
 * - 'x-target-url': Internal routing header, should not be forwarded
 * - 'x-api-key': Sensitive credential that should not leak to target
 * - 'cdn-loop': CDN-specific header that could cause routing loops
 * - 'cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor': Cloudflare-specific
 *   headers that are only valid in Cloudflare context and could confuse target servers
 * - 'render-proxy-ttl': Render.com-specific header for internal use only
 * - 'connection': HTTP/1.1 header that should be handled by the proxy layer
 * 
 * This list is based on common proxy patterns and prevents header pollution
 * that could cause unexpected behavior in downstream services.
 */
const HEADERS_TO_REMOVE = [
    'host',
    'x-target-url',
    'x-api-key',
    'cdn-loop',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'cf-visitor',
    'render-proxy-ttl',
    'connection'
];

/**
 * Calculate the content length of a body in bytes
 * 
 * This function accurately calculates the byte length of request/response bodies
 * for setting the Content-Length header. Proper Content-Length is critical for
 * HTTP compliance and prevents issues with request parsing and connection handling.
 * 
 * Rationale for implementation approach:
 * 1. Uses Buffer.byteLength() instead of string.length because Unicode characters
 *    can be multiple bytes (e.g., emoji, accented characters)
 * 2. Treats undefined as an error since it likely indicates a programming mistake
 * 3. Distinguishes between intentionally empty content (null, '', {}) and missing content
 * 4. Converts objects to JSON for byte counting since that's how they'll be transmitted
 * 5. Returns string format to match HTTP header expectations
 * 
 * Edge cases and their handling:
 * - undefined: Throws error to catch programmer mistakes early
 * - null: Returns '0' as this represents intentionally empty content
 * - Empty string: Returns '0' for valid but empty text content  
 * - Empty object {}: Returns '0' for valid but empty JSON content
 * - Objects: Stringified to JSON then measured for accurate transmission size
 * - Unknown types: Returns '0' as safe fallback
 * 
 * Why accurate byte counting matters:
 * - Incorrect Content-Length can cause request truncation or hanging
 * - Proxy servers rely on accurate lengths for buffering decisions
 * - HTTP/1.1 keepalive connections require precise length for request boundaries
 * 
 * @param {*} body - The body to calculate length for (string, object, null, etc.)
 * @returns {string} The content length as a string (e.g., "42")
 * @throws {TypeError} If body is undefined (likely programmer error)
 */
function calculateContentLength(body) {
  console.log(`calculateContentLength is running with ${body}`); // Debug logging for content size issues
  try {
    // Undefined is treated as an error since it likely indicates a bug
    // (programmer forgot to set body or passed wrong variable)
    if (body === undefined) throw new TypeError('Body is undefined');
    
    // Check for empty object specifically - typeof {} === 'object' but should return 0
    const emptyObj = typeof body === 'object' && body !== null && Object.keys(body).length === 0;
    
    // Handle all forms of intentionally empty content
    if (body === null || body === '' || emptyObj) {
      console.log(`calculateContentLength is returning 0`); // Log zero-length response
      return '0'; // Return as string to match HTTP header format
    }

    // Handle string bodies - use Buffer.byteLength for accurate Unicode byte counting
    if (typeof body === 'string') {
      const len = Buffer.byteLength(body, 'utf8'); // Accounts for multi-byte Unicode characters
      console.log(`calculateContentLength is returning ${len}`); // Log calculated byte length
      return len.toString(); // Convert to string for HTTP header compatibility
    }

    // Handle object bodies - stringify to JSON first since that's how they'll be sent
    if (typeof body === 'object') {
      const jsonString = JSON.stringify(body); // Convert to transmission format
      const len = Buffer.byteLength(jsonString, 'utf8'); // Calculate JSON byte size
      console.log(`calculateContentLength is returning ${len}`); // Log JSON byte length
      return len.toString(); // Convert to string for HTTP header compatibility
    }

    // Fallback for unknown types (numbers, booleans, etc.) - assume empty
    console.log(`calculateContentLength is returning 0`); // Log fallback case
    return '0'; // Safe default for unexpected types
  } catch (error) {
    qerrors(error, 'calculateContentLength', { body }); // Log error with context for debugging
    throw error; // Re-throw so caller can handle invalid input appropriately
  }
}

/**
 * Build clean headers by removing unwanted headers and managing content-length
 * 
 * This function prepares headers for forwarding in proxy scenarios by removing
 * problematic headers and ensuring accurate Content-Length calculation. It's
 * essential for proper HTTP proxy behavior and preventing header conflicts.
 * 
 * Rationale for header cleaning strategy:
 * 1. Clone original headers to avoid mutating caller's object
 * 2. Remove infrastructure-specific headers that could confuse target servers
 * 3. Handle Content-Length specially since body may be modified during proxying
 * 4. Distinguish between GET (no body) and other methods (potential body)
 * 5. Recalculate Content-Length when body is present to ensure accuracy
 * 
 * Content-Length handling logic:
 * - GET requests: Remove Content-Length since GET should not have body
 * - Other methods without body: Remove Content-Length to avoid confusion
 * - Other methods with body: Recalculate Content-Length for accuracy
 * - Empty objects count as "no body" to handle {} JSON case
 * 
 * Why this approach matters:
 * - Incorrect Content-Length causes request failures or security issues
 * - Infrastructure headers can break target server expectations
 * - Proxy scenarios often modify bodies, invalidating original Content-Length
 * - HTTP standards require accurate Content-Length for reliable parsing
 * 
 * Error handling strategy:
 * - On error, returns original headers rather than throwing to prevent request failure
 * - Logs errors for debugging but prioritizes request completion
 * - This fail-safe approach prevents proxy errors from breaking entire requests
 * 
 * @param {object} headers - Original headers object from incoming request
 * @param {string} method - HTTP method (GET, POST, PUT, etc.)
 * @param {*} body - Request body (may be string, object, null, etc.)
 * @returns {object} Cleaned headers object safe for forwarding
 */
function buildCleanHeaders(headers, method, body) {
    console.log(`buildCleanHeaders is running with ${method}`); // Debug logging for header processing
    try {
        // Clone headers to avoid mutating the original object
        // This prevents side effects in caller's code
        const cleanHeaders = { ...headers };
        
        // Remove all problematic headers that shouldn't be forwarded
        // Uses forEach for clarity over reduce/filter patterns
        HEADERS_TO_REMOVE.forEach(header => { 
            delete cleanHeaders[header]; 
        });
        
        // Handle Content-Length removal for requests that shouldn't have bodies
        // GET requests must not have Content-Length per HTTP standards
        if (!body || method.toLowerCase() === 'get') {
            delete cleanHeaders['content-length'];
        }
        
        // Recalculate Content-Length for non-GET requests with actual body content
        // Check Object.keys().length > 0 to treat {} as "no body"
        if (method.toLowerCase() !== 'get' && body && Object.keys(body).length > 0) {
            cleanHeaders['content-length'] = calculateContentLength(body);
        }
        
        console.log(`buildCleanHeaders is returning ${JSON.stringify(cleanHeaders)}`); // Log cleaned headers for debugging
        return cleanHeaders;
    } catch (error) {
        qerrors(error, 'buildCleanHeaders', { method }); // Log error with method context
        return headers; // Return original headers as fallback to prevent request failure
    }
}

/**
 * Send a consistent JSON response
 * 
 * This function standardizes JSON response formatting across the application
 * to ensure consistent API behavior and proper HTTP status code handling.
 * 
 * Rationale for centralized response function:
 * 1. Ensures consistent JSON formatting across all endpoints
 * 2. Guarantees proper Content-Type headers are set
 * 3. Provides single point for response logging and debugging
 * 4. Simplifies error response patterns throughout the codebase
 * 5. Makes it easier to add response middleware (CORS, etc.) later
 * 
 * Why this pattern is important:
 * - Prevents inconsistent API responses that confuse clients
 * - Ensures proper HTTP status codes are always set
 * - Centralizes response logging for debugging and monitoring
 * - Makes API responses predictable for frontend applications
 * 
 * @param {object} res - Express response object for sending HTTP response
 * @param {number} statusCode - HTTP status code (200, 400, 500, etc.)
 * @param {object} data - Response data to be JSON-serialized
 */
function sendJsonResponse(res, statusCode, data) {
  console.log(`sendJsonResponse is sending ${statusCode} with`, data); // Log all API responses for debugging
  res.status(statusCode).json(data); // Set status and send JSON in one call
}

/**
 * Extract and validate required HTTP headers
 * 
 * This function safely extracts required headers from requests and handles
 * missing header scenarios with proper error responses. It's designed to
 * prevent common header-related vulnerabilities and provide clear error messages.
 * 
 * Rationale for this validation pattern:
 * 1. Uses optional chaining (?.) to safely access potentially undefined headers
 * 2. Immediately sends error response if header is missing (fail-fast principle)
 * 3. Returns null to caller to indicate validation failure
 * 4. Uses consistent error response format via sendJsonResponse()
 * 5. Logs all header extraction attempts for security monitoring
 * 
 * Security considerations:
 * - Validates header presence before processing to prevent undefined access
 * - Logs header extraction attempts for potential attack detection
 * - Uses generic error messages to avoid information leakage
 * - Returns null on any error to force caller to handle validation failure
 * 
 * Error handling strategy:
 * - Missing headers: Send specified error code and message
 * - Unexpected errors: Send 500 Internal Server Error (don't leak error details)
 * - Always return null on any failure to signal validation failure
 * - Log errors with context for debugging but don't expose to client
 * 
 * @param {object} req - Express request object containing headers
 * @param {object} res - Express response object for sending error responses
 * @param {string} headerName - Name of the required header (e.g., 'authorization')
 * @param {number} statusCode - Status code to send if header is missing (e.g., 401)
 * @param {string} errorMessage - Error message to send if header is missing
 * @returns {string|null} The header value if present, or null if missing/error
 */
function getRequiredHeader(req, res, headerName, statusCode, errorMessage) {
  console.log(`getRequiredHeader is running with ${headerName}`); // Log header extraction for security monitoring
  try {
    // Use optional chaining to safely access headers even if req.headers is undefined
    // This prevents runtime errors in edge cases or malformed requests
    const headerValue = req?.headers?.[headerName];
    
    // Check for missing or empty header value
    if (!headerValue) {
      sendJsonResponse(res, statusCode, { error: errorMessage }); // Send standardized error response
      console.log(`getRequiredHeader is returning null due to missing header`); // Log validation failure for debugging
      return null; // Signal to caller that validation failed
    }
    
    console.log(`getRequiredHeader is returning ${headerValue}`); // Log successful extraction for debugging
    return headerValue; // Return the extracted header value
  } catch (error) {
    // Handle unexpected errors (malformed requests, etc.)
    qerrors(error, 'getRequiredHeader', { headerName, statusCode, errorMessage }); // Log detailed error for debugging
    sendJsonResponse(res, 500, { error: 'Internal server error' }); // Send generic error to client
    return null; // Signal failure to calling code
  }
}

module.exports = {
  calculateContentLength,
  buildCleanHeaders,
  sendJsonResponse,
  getRequiredHeader,
  HEADERS_TO_REMOVE
};

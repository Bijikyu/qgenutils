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

const { qerrors } = require('qerrors'); // centralized error logging
const logger = require('./logger'); // structured logger
const { isValidObject } = require('./input-validation'); // input sanity checks
const { sendJsonResponse, sendAuthError, sendServerError } = require('./response-utils'); // unified response helpers

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
Object.freeze(HEADERS_TO_REMOVE); // ensure list can't be mutated at runtime

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
 * - Handle various input types (string, object, Buffer, null, empty) // added Buffer for binary support
 * - Distinguish between undefined (error) and empty content (zero length)
 * - Return string format as HTTP headers must be strings
 * 
 * EDGE CASES HANDLED:
 * - Undefined input (throws - indicates developer error)
 * - Null input (returns '0' - valid empty body)
 * - Empty string (returns '0' - valid empty body)
 * - Empty object (returns '0' - valid empty JSON)
 * - Buffer input (returns body.length - byte accurate) // new edge case
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
  console.log(`calculateContentLength is running with ${body}`); logger.debug(`calculateContentLength is running with ${body}`); // Log input for debugging content issues
  try {
    // Handle undefined input as an error - indicates developer mistake
    if (body === undefined) {
      throw new TypeError('Body is undefined');
    }

    // Check for empty object specifically before other object handling
    const emptyObj = typeof body === 'object' && body !== null && Object.keys(body).length === 0;

    // Handle all valid "empty" body types - these should return '0'
    if (body === null || body === '' || emptyObj) {
      console.log(`calculateContentLength is returning 0`); logger.debug(`calculateContentLength is returning 0`); // Log zero-length determination
      return '0';
    }

    // Handle string bodies - most common case for simple content
    if (typeof body === 'string') {
      const len = Buffer.byteLength(body, 'utf8'); // Accurate UTF-8 byte counting
      console.log(`calculateContentLength is returning ${len}`); logger.debug(`calculateContentLength is returning ${len}`);
      return len.toString();
    }

    // Handle Buffer bodies - binary payloads
    if (Buffer.isBuffer(body)) { // check for Node Buffer
      const len = body.length; // Buffer length equals byte size
      console.log(`calculateContentLength is returning ${len}`); logger.debug(`calculateContentLength is returning ${len}`); // log for debugging
      return len.toString(); // return as string per HTTP spec
    }

    // Handle object bodies - JSON APIs
    if (typeof body === 'object') {
      const jsonString = JSON.stringify(body); // Convert to wire format
      const len = Buffer.byteLength(jsonString, 'utf8'); // Count bytes of JSON string
      console.log(`calculateContentLength is returning ${len}`); logger.debug(`calculateContentLength is returning ${len}`);
      return len.toString();
    }

    // Fallback for unknown types (numbers, booleans, etc.)
    // These shouldn't occur in typical HTTP usage but we handle gracefully
    console.log(`calculateContentLength is returning 0`); logger.debug(`calculateContentLength is returning 0`);
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
 * PROCESS OVERVIEW:
 * 1. Clone headers to avoid mutating the caller's object
 * 2. Remove dangerous headers defined in HEADERS_TO_REMOVE for security
 * 3. Recalculate content-length from the provided body when present
 * 4. Strip content-length entirely for GET requests or empty bodies
 *
 * HEADERS_TO_REMOVE centralizes this security practice so updates propagate
 * consistently across all calls to buildCleanHeaders
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
 * - Request body was modified before proxying (data transformation)
 * - Headers were added/removed that affect body serialization
 * - Character encoding changed during processing (UTF-8 conversion)
 * - Middleware modified the request object before forwarding
 * 
 * GET REQUEST HANDLING:
 * GET requests shouldn't have bodies or content-length headers per HTTP/1.1 spec (RFC 7231).
 * Some clients send them anyway, so we actively remove them to prevent:
 * - Upstream server confusion about message format
 * - Proxy servers rejecting the request as malformed
 * - HTTP/2 protocol violations that could cause connection drops
 * 
 * @param {object} headers - Original headers object from request
 * @param {string} method - HTTP method (GET, POST, PUT, etc.)
 * @param {*} body - Request body content
 * @returns {object} Cleaned headers object safe for forwarding
 */
function buildCleanHeaders(headers, method, body) {
    // Normalize method to lower case or default to 'get' if invalid
    let safeMethod = 'get'; // default for undefined or invalid method to avoid unexpected behavior
    if (typeof method === 'string' && method.trim()) {
        safeMethod = method.toLowerCase(); // enforce consistent method casing for comparisons
    }
    console.log(`buildCleanHeaders is running with ${safeMethod}`); logger.debug(`buildCleanHeaders is running with ${safeMethod}`); // Log normalized method for debugging header logic
    try {
        // Validate headers parameter - return original value for null/undefined
        if (headers === null) {
            return null; // explicit null signals header stripping by caller
        }
        if (headers === undefined) {
            return undefined; // propagate undefined to indicate missing param
        }
        if (!isValidObject(headers)) {
            return {}; // fall back to empty object to prevent runtime errors
        }
        
        // Clone headers to avoid mutating original request object
        // Spreading creates shallow copy which is sufficient for header objects
        const cleanHeaders = { ...headers }; // clone to avoid mutating caller's object

        // Remove all blacklisted headers that shouldn't be forwarded
        // Using forEach instead of filter to directly modify the object in-place
        // This is more memory efficient than creating a new object with filtered properties
        HEADERS_TO_REMOVE.forEach(header => {
            delete cleanHeaders[header]; // strip potentially dangerous headers
        });

        // Handle content-length based on method and body presence
        // GET or empty-body requests should never include content-length
        // Empty bodies include empty objects and zero-length buffers
        const emptyObj = typeof body === 'object' && body !== null && !Buffer.isBuffer(body) && Object.keys(body).length === 0; // identify empty object to avoid false content length
        const emptyBuf = Buffer.isBuffer(body) && body.length === 0; // empty buffer also means no body content
        if (emptyObj || emptyBuf) { delete cleanHeaders['content-length']; } // remove header when payload is empty to avoid misleading size
        if (!body || safeMethod === 'get') { delete cleanHeaders['content-length']; } // strip length for GET or when body absent

        // For non-GET requests with actual body content, set accurate content-length
        // Skip when body is empty object or zero-length buffer
        // This prevents setting content-length: 0 for requests that legitimately have no body
        if (safeMethod !== 'get' && body && !emptyObj && !emptyBuf) {
            // Handle string bodies (most common case)
            if (typeof body === 'string' && body.length > 0) {
                cleanHeaders['content-length'] = calculateContentLength(body); // set byte-accurate length for string payloads
            }
            // Handle object bodies (JSON APIs) - check if object has properties
            else if (typeof body === 'object' && body !== null && !Buffer.isBuffer(body) && Object.keys(body).length > 0) {
                cleanHeaders['content-length'] = calculateContentLength(body); // calculate JSON body length for APIs
            }
            // Handle Buffer bodies with actual content
            else if (Buffer.isBuffer(body) && body.length > 0) {
                cleanHeaders['content-length'] = calculateContentLength(body); // compute length for binary payloads
            }
        }

        console.log(`buildCleanHeaders is returning ${JSON.stringify(cleanHeaders)}`); logger.debug(`buildCleanHeaders is returning ${JSON.stringify(cleanHeaders)}`); // trace sanitized header set
        return cleanHeaders; // forward cleaned headers to caller
    } catch (error) {
        // Log error but return original headers as fallback
        // This prevents complete request failure due to header cleaning issues
        qerrors(error, 'buildCleanHeaders', { method: safeMethod }); // capture context for troubleshooting
        return headers; // fallback keeps request usable even when cleaning fails
    }
}

// sendJsonResponse is now imported from response-utils module

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
  const normalizedName = typeof headerName === 'string' ? headerName.toLowerCase() : ''; // standardize name for consistent lookup
  console.log(`getRequiredHeader is running with ${normalizedName}`); logger.debug(`getRequiredHeader is running with ${normalizedName}`); // log which header we expect for debugging
  try {
    // Safely access header value even if headers object is undefined
    // Express normalizes header names to lowercase, so this handles case variations
    const headerValue = req?.headers?.[normalizedName]; // optional chain avoids errors when headers undefined

    if (!headerValue) {
      // Send appropriate error response based on status code
      if (statusCode === 401) {
        sendAuthError(res, errorMessage); // missing auth header triggers auth failure
      } else {
        sendJsonResponse(res, statusCode, { error: errorMessage }); // generic error for other required headers
      }
      console.log(`getRequiredHeader is returning null due to missing header`); logger.debug(`getRequiredHeader is returning null due to missing header`); // trace failure path
      return null; // signal to caller that header was missing
    }

    console.log(`getRequiredHeader is returning ${headerValue}`); logger.debug(`getRequiredHeader is returning ${headerValue}`); // trace value for debugging (avoid logging secrets in production)
    return headerValue; // provide caller with sanitized header value
  } catch (error) {
    // Handle unexpected errors in header processing
    qerrors(error, 'getRequiredHeader', { headerName: normalizedName, statusCode, errorMessage }); // log normalized name for consistency
    sendServerError(res, 'Internal server error', error, 'getRequiredHeader'); // generic 500 with logging
    return null; // signal failure to calling code
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
  calculateContentLength, // expose body length calculation
  buildCleanHeaders, // expose header cleanup
  getRequiredHeader, // expose header extraction
  HEADERS_TO_REMOVE // expose list of stripped headers
};
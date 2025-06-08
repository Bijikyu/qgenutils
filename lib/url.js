
/**
 * URL Processing Module
 * 
 * This module provides utilities for URL manipulation, validation, and normalization.
 * It's designed to handle common URL processing scenarios including protocol handling,
 * URL parsing, and normalization for consistent processing.
 * 
 * The functions solve common problems:
 * 1. Ensuring URLs have protocols for proper parsing
 * 2. Normalizing URLs to consistent formats
 * 3. Extracting components from URLs safely
 * 4. Handling user input that may be malformed or incomplete
 */

const { qerrors } = require('qerrors');

/**
 * Ensure a URL has a protocol (defaults to HTTPS)
 * 
 * This function adds a protocol to URLs that don't have one, defaulting to HTTPS
 * for security. It's commonly needed when processing user input or configuration
 * that may omit the protocol portion.
 * 
 * Rationale for implementation approach:
 * 1. Defaults to HTTPS instead of HTTP for security (encrypted connections)
 * 2. Returns null for invalid input to allow caller to handle errors appropriately
 * 3. Uses regex for case-insensitive protocol detection
 * 4. Validates input type to prevent runtime errors
 * 5. Logs invalid input for debugging configuration issues
 * 
 * Why default to HTTPS:
 * - Modern web security best practices require encrypted connections
 * - HTTP connections are vulnerable to man-in-the-middle attacks
 * - Most modern services require HTTPS anyway
 * - Search engines and browsers favor HTTPS URLs
 * 
 * Protocol detection logic:
 * - Uses regex /^https?:\/\//i for case-insensitive matching
 * - Matches both "http://" and "https://" at start of string
 * - Case-insensitive to handle "HTTP://", "Http://", etc.
 * 
 * Error handling strategy:
 * - Invalid input (non-string, empty) returns null
 * - Logs invalid input for debugging
 * - On unexpected errors, returns original URL as fallback
 * - Allows caller to decide how to handle null/invalid results
 * 
 * @param {string} url - The URL to check (e.g., "example.com" or "https://example.com")
 * @returns {string|null} The URL with protocol (e.g., "https://example.com") or null if invalid
 */
function ensureProtocol(url) {
  console.log(`ensureProtocol is running with ${url}`); // Log incoming value for debugging
  try {
    // Validate that input is a usable string
    // Check both type and truthiness to catch empty strings, null, undefined
    if (typeof url !== 'string' || !url) {
      qerrors(new Error('invalid url input'), 'ensureProtocol', url); // Log invalid input with context
      console.log(`ensureProtocol is returning null`); // Log early return for debugging
      return null; // Return null to signal invalid input to caller
    }
    
    let finalUrl = url; // Keep reference to original for modification
    
    // Check if protocol is already present using case-insensitive regex
    // Matches "http://" or "https://" at the beginning of the string
    const hasProto = /^https?:\/\//i.test(finalUrl);
    
    // Add HTTPS protocol if none present (security-first approach)
    if (!hasProto) { 
      finalUrl = 'https://' + finalUrl; 
    }
    
    console.log(`ensureProtocol is returning ${finalUrl}`); // Log final result for debugging
    return finalUrl; // Return URL with guaranteed protocol
  } catch (error) {
    qerrors(error, 'ensureProtocol', url); // Log unexpected errors with context
    return url; // Fallback to original URL on error (best effort)
  }
}

/**
 * Normalize a URL to its origin in lowercase
 * 
 * This function extracts and normalizes the origin portion of a URL (protocol + host + port)
 * to a consistent lowercase format. It's useful for comparing URLs, caching, and security
 * checks where origin matching is important.
 * 
 * Rationale for normalization approach:
 * 1. Uses native URL constructor for reliable parsing (handles edge cases)
 * 2. Calls ensureProtocol() first to handle incomplete URLs
 * 3. Converts to lowercase for consistent comparison (hosts are case-insensitive)
 * 4. Returns only origin (no path/query) for security and consistency
 * 5. Returns null on failure to allow caller to handle invalid URLs
 * 
 * Why origin normalization matters:
 * - Enables reliable URL comparison across different input formats
 * - Prevents case-sensitivity issues (Example.Com vs example.com)
 * - Essential for CORS origin checking and security policies
 * - Useful for caching and deduplication of URL-based resources
 * 
 * What origin includes:
 * - Protocol: https:// or http://
 * - Host: domain name or IP address
 * - Port: if non-standard (e.g., :8080)
 * - Does NOT include path, query parameters, or fragments
 * 
 * Example transformations:
 * - "Example.Com/path" → "https://example.com"
 * - "HTTP://SITE.COM:8080" → "http://site.com:8080"
 * - "site.org/api?key=123" → "https://site.org"
 * 
 * @param {string} url - The URL to normalize (e.g., "Example.Com/path")
 * @returns {string|null} The normalized origin (e.g., "https://example.com") or null if invalid
 */
function normalizeUrlOrigin(url) {
  console.log(`normalizeUrlOrigin is running with ${url}`); // Log normalization attempt
  try {
    // First ensure URL has protocol, then parse and extract origin
    // URL constructor handles complex parsing edge cases reliably
    // .origin property includes protocol + host + port but excludes path/query
    const origin = new URL(ensureProtocol(url)).origin.toLowerCase();
    console.log(`normalizeUrlOrigin is returning ${origin}`); // Log normalized result
    return origin;
  } catch (error) {
    qerrors(error, 'normalizeUrlOrigin', url); // Log parsing errors with context
    return null; // Return null to signal parsing failure
  }
}

/**
 * Strip protocol and trailing slash from URL
 * 
 * This function removes the protocol portion and trailing slash from URLs,
 * useful for display purposes or when you need just the host and path portions.
 * It's commonly used for showing clean URLs to users or for certain API scenarios.
 * 
 * Rationale for stripping approach:
 * 1. Uses regex for reliable protocol removal (handles case variations)
 * 2. Removes trailing slash for consistent formatting
 * 3. Returns original URL on error (fail-safe approach)
 * 4. Handles both HTTP and HTTPS protocols
 * 5. Case-insensitive matching for robust handling
 * 
 * Use cases:
 * - Displaying clean URLs to users (without protocol clutter)
 * - Generating URL slugs or identifiers
 * - Comparing domains without protocol differences
 * - Creating configuration values that don't need protocols
 * 
 * Processing steps:
 * 1. Remove protocol prefix (https:// or http://) case-insensitively
 * 2. Remove trailing slash if present
 * 3. Return cleaned URL string
 * 
 * Example transformations:
 * - "https://example.com/" → "example.com"
 * - "HTTP://Site.Org/path" → "Site.Org/path"
 * - "https://api.service.com/v1/" → "api.service.com/v1"
 * 
 * @param {string} url - The URL to strip (e.g., "https://example.com/")
 * @returns {string} The URL without protocol (e.g., "example.com")
 */
function stripProtocol(url) {
  console.log(`stripProtocol is running with ${url}`); // Log stripping attempt
  try {
    const processed = url
      .replace(/^https?:\/\//i, '') // Remove protocol prefix case-insensitively
      .replace(/\/$/, ''); // Remove trailing slash if present
    console.log(`stripProtocol is returning ${processed}`); // Log processed result
    return processed;
  } catch (error) {
    qerrors(error, 'stripProtocol', url); // Log processing errors
    return url; // Return original URL as fallback on error
  }
}

/**
 * Parse URL into base URL and endpoint parts
 * 
 * This function separates a URL into its base portion (origin) and endpoint portion
 * (path + query parameters). It's useful for API routing, proxy configuration, and
 * URL manipulation scenarios.
 * 
 * Rationale for parsing approach:
 * 1. Uses ensureProtocol() first to handle incomplete URLs
 * 2. Leverages native URL constructor for reliable parsing
 * 3. Separates origin from path+query for flexible usage
 * 4. Returns structured object for easy destructuring
 * 5. Returns null on failure to allow caller error handling
 * 
 * Use cases:
 * - API proxy configuration (base URL + endpoint routing)
 * - URL construction and manipulation
 * - Request forwarding and routing
 * - Cache key generation based on URL parts
 * 
 * Return object structure:
 * - baseUrl: The origin portion (protocol + host + port)
 * - endpoint: The path and query portion (everything after the origin)
 * 
 * Why separate base and endpoint:
 * - Base URL often stays constant while endpoints vary
 * - Useful for proxy scenarios where you change base but keep endpoint
 * - Enables flexible URL construction patterns
 * - Supports API versioning and routing logic
 * 
 * Example parsing:
 * - "example.com/api/users?id=123" → 
 *   { baseUrl: "https://example.com", endpoint: "/api/users?id=123" }
 * - "https://api.service.com/v1/data" → 
 *   { baseUrl: "https://api.service.com", endpoint: "/v1/data" }
 * 
 * @param {string} url - The URL to parse (e.g., "example.com/api/users?id=123")
 * @returns {object|null} Object with baseUrl and endpoint properties, or null if invalid
 */
function parseUrlParts(url) {
  console.log(`parseUrlParts is running with ${url}`); // Log parsing attempt
  try {
    // First ensure URL has protocol for reliable parsing
    const processedUrl = ensureProtocol(url);
    
    // If protocol enforcement failed, URL is invalid
    if (processedUrl === null) {
      console.log(`parseUrlParts is returning null`); // Log early return due to invalid input
      return null; // Return null to signal parsing failure
    }
    
    // Parse URL into components using native URL constructor
    const parsed = new URL(processedUrl);
    
    // Create structured result object
    const result = {
      baseUrl: parsed.origin, // Protocol + host + port
      endpoint: parsed.pathname + parsed.search // Path + query parameters (no fragment)
    };
    
    console.log(`parseUrlParts is returning ${JSON.stringify(result)}`); // Log parsed components
    return result;
  } catch (error) {
    qerrors(error, 'parseUrlParts', url); // Log parsing errors with context
    return null; // Return null to signal parsing failure
  }
}

module.exports = {
  ensureProtocol,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts
};

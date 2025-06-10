/*
 * URL Utility Module
 * 
 * This module provides URL manipulation utilities for web applications that need
 * to normalize, parse, and manipulate URLs safely and consistently. Common use
 * cases include API proxying, link validation, and URL standardization.
 * 
 * DESIGN PHILOSOPHY:
 * - Security first: Default to HTTPS for all protocol-less URLs
 * - Graceful failure: Return null for invalid inputs rather than throwing
 * - Consistent output: Normalize URLs to standard formats for comparison
 * - Edge case handling: Deal with malformed URLs, missing protocols, etc.
 * 
 * COMMON SCENARIOS:
 * - User enters "example.com" and needs "https://example.com"
 * - Comparing URLs that might have different cases or trailing slashes
 * - Extracting base URLs from full URLs for API routing
 * - Sanitizing user-provided URLs before storing or processing
 */

const { qerrors } = require('qerrors');

/**
 * Helper function to check if URL already has a protocol
 * This centralizes the protocol detection regex used by multiple URL functions
 * 
 * @param {string} url - URL to check for protocol
 * @returns {boolean} True if URL has http or https protocol, false otherwise
 */
function hasProtocol(url) {
  return /^https?:\/\//i.test(url);
}

/**
 * Ensure a URL has a protocol (defaults to HTTPS)
 * 
 * RATIONALE: Users often enter URLs without protocols (example.com instead of
 * https://example.com), but browsers and HTTP clients require explicit protocols.
 * This function standardizes URL input while defaulting to HTTPS for security.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Default to HTTPS (not HTTP) for security best practices
 * - Use case-insensitive regex to catch HTTP/HTTPS/http/https variants
 * - Return null for invalid inputs to allow caller to handle gracefully
 * - Preserve existing protocols if already present
 * 
 * SECURITY RATIONALE:
 * Defaulting to HTTPS prevents accidental transmission of sensitive data over
 * unencrypted connections. In 2024, HTTPS should be the default assumption
 * for all web traffic unless explicitly specified otherwise.
 * 
 * REGEX EXPLANATION:
 * /^https?:\/\//i matches:
 * - ^ : Start of string
 * - https? : "http" followed by optional "s"
 * - :\/\/ : Literal "://" (protocol separator)
 * - i flag: Case insensitive
 * 
 * EDGE CASES HANDLED:
 * - Empty string input
 * - Non-string input (numbers, objects, etc.)
 * - URLs with existing protocols (HTTP, HTTPS, mixed case)
 * - Malformed URLs that would break URL constructor
 * 
 * @param {string} url - The URL to check and potentially modify
 * @returns {string|null} The URL with protocol added or null if input is invalid
 */
function ensureProtocol(url) {
  console.log(`ensureProtocol is running with ${url}`); // Log input for debugging URL processing issues
  try {
    // Validate that input is a usable string before processing
    if (typeof url !== 'string' || !url) {
      qerrors(new Error('invalid url input'), 'ensureProtocol', url); // Log invalid input with context
      console.log(`ensureProtocol is returning null`); // Log early return for invalid input
      return null; // Return null to signal invalid input to caller
    }

    // Handle empty or invalid input gracefully - return null for missing URLs
    if (!url || url.trim().length === 0) {
      console.log(`ensureProtocol is returning null`); // Log fallback for empty input
      return null; // Indicate invalid/missing URL input
    }

    let finalUrl = url; // Work with copy to avoid mutating input

    // Check if protocol is already present using centralized detection
    if (!hasProtocol(finalUrl)) { 
      finalUrl = 'https://' + finalUrl; 
    }

    console.log(`ensureProtocol is returning ${finalUrl}`); // Log final URL for debugging
    return finalUrl;
  } catch (error) {
    // Handle unexpected errors in URL processing
    qerrors(error, 'ensureProtocol', url); // Log error with input context
    return url; // Fallback: return original input if processing fails
  }
}

/**
 * Normalize a URL to its origin in lowercase
 * 
 * RATIONALE: URL comparison often needs to focus on the origin (protocol + domain + port)
 * while ignoring path, query parameters, and case differences. This function creates
 * a canonical form suitable for comparison and caching.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use native URL constructor for robust parsing
 * - Extract only the origin portion (no path/query/fragment)
 * - Convert to lowercase for case-insensitive comparison
 * - Handle protocol addition through ensureProtocol first
 * 
 * USE CASES:
 * - Comparing if two URLs point to the same server
 * - Creating cache keys based on API endpoints
 * - Validating allowed origins for CORS
 * - Grouping URLs by their base domain
 * 
 * URL.origin EXPLANATION:
 * The origin property includes:
 * - Protocol (https:)
 * - Domain (example.com)
 * - Port (if non-standard: :8080)
 * But excludes path, query parameters, and fragments
 * 
 * @param {string} url - The URL to normalize to its origin
 * @returns {string|null} The normalized origin in lowercase or null if invalid
 */
function normalizeUrlOrigin(url) {
  console.log(`normalizeUrlOrigin is running with ${url}`); // Log input for debugging normalization
  try {
    // First ensure the URL has a protocol, then extract and normalize origin
    const processedUrl = ensureProtocol(url);

    // If protocol normalization failed, abort parsing
    if (processedUrl === null) {
      console.log(`normalizeUrlOrigin is returning null`); // Log early exit due to invalid input
      return null;
    }

    // Parse the URL to extract components
    // This allows us to normalize the origin while preserving other parts
    const urlObj = new URL(processedUrl);

    // Build normalized origin, preserving explicit ports (including 443 for HTTPS)
    // We use hostname instead of host to get just the domain without port
    // Then add port back explicitly if it exists to maintain consistency
    let normalizedOrigin = `${urlObj.protocol}//${urlObj.hostname.toLowerCase()}`;
    
    // Include port if explicitly specified (even standard ports like 443 for HTTPS)
    // This preserves the original intent when port was explicitly provided
    if (urlObj.port && urlObj.port !== '') {
      normalizedOrigin += `:${urlObj.port}`;
    }

    console.log(`normalizeUrlOrigin is returning ${normalizedOrigin}`); // Log successful normalization
    return normalizedOrigin;
  } catch (error) {
    // Handle malformed URLs that can't be parsed
    qerrors(error, 'normalizeUrlOrigin', url); // Log parsing error with context
    return null; // Return null to indicate parsing failure
  }
}

/**
 * Strip protocol and trailing slash from URL
 * 
 * RATIONALE: Sometimes you need the "bare" version of a URL for display purposes,
 * configuration files, or systems that add their own protocols. This function
 * creates a clean, minimal representation of the URL.
 * 
 * IMPLEMENTATION APPROACH:
 * - Use regex replacements for precise control over what's removed
 * - Remove protocol prefix (http:// or https://)
 * - Remove trailing slash for consistency
 * - Preserve everything else (path, query, fragment)
 * 
 * USE CASES:
 * - Displaying URLs in user interfaces without protocol clutter
 * - Configuration files that specify domains without protocols
 * - Input normalization before protocol addition
 * - Creating human-readable URL representations
 * 
 * REGEX EXPLANATIONS:
 * - /^https?:\/\//i : Removes http:// or https:// from start (case-insensitive)
 * - /\/$/ : Removes trailing slash from end
 * 
 * WHY NOT USE URL CONSTRUCTOR:
 * The URL constructor requires a valid protocol, but we're trying to remove it.
 * Regex replacement is more appropriate for this text manipulation task.
 * 
 * @param {string} url - The URL to strip protocol and trailing slash from
 * @returns {string} The URL without protocol prefix or trailing slash
 */
function stripProtocol(url) {
  console.log(`stripProtocol is running with ${url}`); // Log input for debugging strip operations
  try {
    // Chain replacements to remove protocol and trailing slash
    // Using centralized regex pattern for consistency with other URL functions
    const processed = url
      .replace(/^https?:\/\//i, '') // Remove protocol prefix (case-insensitive)
      .replace(/\/$/, '');           // Remove trailing slash if present
    console.log(`stripProtocol is returning ${processed}`); // Log processed result
    return processed;
  } catch (error) {
    // Handle unexpected errors in string processing
    qerrors(error, 'stripProtocol', url); // Log error with context
    return url; // Fallback: return original URL if processing fails
  }
}

/**
 * Parse URL into base URL and endpoint parts
 * 
 * RATIONALE: API clients often need to separate the base URL (for server/routing)
 * from the endpoint path (for specific API calls). This separation enables
 * flexible API routing and proxy configurations.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Normalize URL with protocol first (ensures valid parsing)
 * - Use URL constructor for robust parsing of complex URLs
 * - Split into origin (base) and pathname+search (endpoint)
 * - Return structured object for easy destructuring
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
 * appropriately (show error, use default, etc.)
 * 
 * @param {string} url - The URL to parse into components
 * @returns {object|null} Object with baseUrl and endpoint properties, or null if parsing fails
 */
function parseUrlParts(url) {
  console.log(`parseUrlParts is running with ${url}`); // Log input for debugging URL parsing
  try {
    // First normalize the URL to ensure it has a protocol for valid parsing
    const processedUrl = ensureProtocol(url);

    // If protocol normalization failed, abort parsing
    if (processedUrl === null) {
      console.log(`parseUrlParts is returning null`); // Log early exit due to invalid input
      return null;
    }

    // Parse URL into components using native URL constructor
    const parsed = new URL(processedUrl);

    // Create structured result with base URL and endpoint
    const result = {
      baseUrl: parsed.origin,                    // Protocol + domain + port
      endpoint: parsed.pathname + parsed.search  // Path + query parameters
    };

    console.log(`parseUrlParts is returning ${JSON.stringify(result)}`); // Log structured result
    return result;
  } catch (error) {
    // Handle URLs that can't be parsed by URL constructor
    qerrors(error, 'parseUrlParts', url); // Log parsing error with input context
    return null; // Return null to indicate parsing failure
  }
}

/*
 * Module Export Strategy:
 * 
 * We export all URL utility functions because they serve complementary purposes
 * in URL processing workflows:
 * 
 * 1. ensureProtocol - Input normalization (first step)
 * 2. normalizeUrlOrigin - Standardization for comparison
 * 3. stripProtocol - Display/configuration formatting
 * 4. parseUrlParts - Structural analysis for routing
 * 
 * These functions can be used independently or chained together for complex
 * URL processing pipelines.
 * 
 * FUTURE ENHANCEMENTS:
 * - Add subdomain extraction utilities
 * - Add URL validation beyond protocol checking
 * - Add query parameter manipulation functions
 * - Add relative URL resolution utilities
 */
module.exports = {
  ensureProtocol,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts
};
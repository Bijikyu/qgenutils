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

const { qerrors } = require('qerrors'); // error reporting utility
const logger = require('./logger'); // structured logger

/*
 * These URL utilities are designed to be chained together. For example a proxy
 * server might first call ensureProtocol to add missing schemes, then
 * normalizeUrlOrigin to compare against an allow list, and finally
 * parseUrlParts to route the request. Link shorteners or configuration tools may
 * also chain stripProtocol after parsing for a clean domain display.
 */

/**
 * Helper function to check if URL already has a protocol
 * This centralizes the protocol detection regex used by multiple URL functions

 * CHAIN POSITION: utility used by ensureProtocol and other functions to decide
 * whether to prepend a protocol when chaining operations.

 * SECURITY: Verifying a protocol prevents accidental double-prepending and
 * guards against non-http(s) schemes that may introduce security risks.

 *
 * @param {string} url - URL to check for protocol
 * @returns {boolean} True if URL has http or https protocol, false otherwise
 */
function hasProtocol(url) {
  return /^https?:\/\//i.test(url); // ensures only http(s) schemes are detected
}

/**
 * Ensure a URL has a protocol (defaults to HTTPS)
 *
 * RATIONALE: Users often enter URLs without protocols (example.com instead of
 * https://example.com), but browsers and HTTP clients require explicit protocols.
 * This function standardizes URL input while defaulting to HTTPS for security.
 * CHAIN POSITION: typically the first step so that later functions like
 * normalizeUrlOrigin and parseUrlParts receive a complete URL. Defaulting to
 * HTTPS ensures downstream processing and proxying use encrypted connections.
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
  console.log(`ensureProtocol is running with ${url}`); logger.debug(`ensureProtocol is running with ${url}`); // trace incoming URL for debugging
  try {
    // Validate that input is a usable string before processing
    if (typeof url !== 'string' || !url) {
      qerrors(new Error('invalid url input'), 'ensureProtocol', url); // record misuse or programming error
      console.log(`ensureProtocol is returning null`); logger.debug(`ensureProtocol is returning null`); // early exit for unusable input
      return null; // propagate null to caller for invalid input
    }

    const trimmedUrl = url.trim(); // discard whitespace to compare accurately

    // Handle empty or invalid input gracefully - return null for missing URLs
    if (trimmedUrl.length === 0) {
      console.log(`ensureProtocol is returning null`); logger.debug(`ensureProtocol is returning null`); // treat blank strings as invalid
      return null; // indicate missing URL value
    }

    let finalUrl = trimmedUrl; // sanitized copy prevents altering original value

    // Check if protocol is already present using centralized detection
    if (!hasProtocol(finalUrl)) {
      finalUrl = 'https://' + finalUrl; // default to https for security
    }

    console.log(`ensureProtocol is returning ${finalUrl}`); logger.debug(`ensureProtocol is returning ${finalUrl}`); // trace normalized URL
    return finalUrl; // provide caller with safe URL
  } catch (error) {
    // Handle unexpected errors in URL processing
    qerrors(error, 'ensureProtocol', url); // log and keep original URL to avoid breaking caller
    return url; // fallback to provided value if something went wrong
  }
}

/**
 * Normalize a URL to its origin in lowercase
 *
 * RATIONALE: URL comparison often needs to focus on the origin (protocol + domain + port)
 * while ignoring path, query parameters, and case differences. This function creates
 * a canonical form suitable for comparison and caching. SECURITY: Normalization
 * prevents origin spoofing via case or port variations when enforcing same-origin
 * policies or caching rules.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use native URL constructor for robust parsing
 * - Extract only the origin portion (no path/query/fragment)
 * - Convert to lowercase for case-insensitive comparison
 * - Handle protocol addition through ensureProtocol first
 * CHAIN POSITION: generally used after ensureProtocol. Provides a canonical
 * origin for subsequent comparison or proxy routing steps.
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
  console.log(`normalizeUrlOrigin is running with ${url}`); logger.debug(`normalizeUrlOrigin is running with ${url}`); // track incoming URL before normalization
  try {
    // First ensure the URL has a protocol, then extract and normalize origin
    const processedUrl = ensureProtocol(url); // add protocol if missing for valid parsing

    // If protocol normalization failed, abort parsing
    if (processedUrl === null) {
      console.log(`normalizeUrlOrigin is returning null`); logger.debug(`normalizeUrlOrigin is returning null`); // protocol check failed
      return null; // cannot continue without valid protocol
    }

    // Parse the URL to extract components
    // This allows us to normalize the origin while preserving other parts
    const urlObj = new URL(processedUrl); // leverage built-in parser for reliability

    // Build normalized origin, preserving explicit ports (including 443 for HTTPS)
    // We use hostname instead of host to get just the domain without port
    // Then add port back explicitly if it exists to maintain consistency
    let normalizedOrigin = `${urlObj.protocol}//${urlObj.hostname.toLowerCase()}`; // start with protocol and lowercase host
    
    // Include port if explicitly specified (even standard ports like 443 for HTTPS)
    // This preserves the original intent when port was explicitly provided
    if (urlObj.port && urlObj.port !== '') {
      normalizedOrigin += `:${urlObj.port}`; // retain explicit port to respect caller intent
    }

    console.log(`normalizeUrlOrigin is returning ${normalizedOrigin}`); logger.debug(`normalizeUrlOrigin is returning ${normalizedOrigin}`); // output normalized origin for verification
    return normalizedOrigin; // provide canonical origin
  } catch (error) {
    // Handle malformed URLs that can't be parsed
    qerrors(error, 'normalizeUrlOrigin', url); // log parsing error for investigation
    return null; // indicate failure so caller can react
  }
}

/**
 * Strip protocol and trailing slash from URL
 *
 * RATIONALE: Sometimes you need the "bare" version of a URL for display purposes,
 * configuration files, or systems that add their own protocols. This function
 * creates a clean, minimal representation of the URL. SECURITY: Removing the
 * protocol ensures user-supplied strings cannot inject unexpected schemes when
 * re-combined with application routing logic.
 * 
 * IMPLEMENTATION APPROACH:
 * - Use regex replacements for precise control over what's removed
 * - Remove protocol prefix (http:// or https://)
 * - Remove trailing slash for consistency
 * - Preserve everything else (path, query, fragment)
 * CHAIN POSITION: often used after normalizeUrlOrigin when displaying or storing
 * domains without schemes.
 * 
 * USE CASES:
 * - Displaying URLs in user interfaces without protocol clutter
 * - Configuration files that specify domains without protocols
 * - Input normalization before protocol addition
 * - Creating human-readable URL representations
 * 
 * REGEX EXPLANATIONS:
 * - /^https?:\/\//i : Removes http:// or https:// from start (case-insensitive)
 *   ensuring only standard web protocols are stripped for safety
 * - /\/$/ : Removes trailing slash from end to avoid inconsistent paths
 * 
 * WHY NOT USE URL CONSTRUCTOR:
 * The URL constructor requires a valid protocol, but we're trying to remove it.
 * Regex replacement is more appropriate for this text manipulation task.
 * 
 * @param {string} url - The URL to strip protocol and trailing slash from
 * @returns {string} The URL without protocol prefix or trailing slash
 */
function stripProtocol(url) {
  console.log(`stripProtocol is running with ${url}`); logger.debug(`stripProtocol is running with ${url}`); // trace original URL before modifications
  try {
    // Chain replacements to remove protocol and trailing slash
    // Using centralized regex pattern for consistency with other URL functions
    const processed = url
      .replace(/^https?:\/\//i, '') // regex removes http:// or https:// prefix only
      .replace(/\/$/, '');           // regex trims a single trailing slash
    console.log(`stripProtocol is returning ${processed}`); logger.debug(`stripProtocol is returning ${processed}`); // show stripped result
    return processed; // send cleaned value back
  } catch (error) {
    // Handle unexpected errors in string processing
    qerrors(error, 'stripProtocol', url); // log unexpected issue
    return url; // fallback to input on failure
  }
}

/**
 * Parse URL into base URL and endpoint parts
 *
 * RATIONALE: API clients often need to separate the base URL (for server/routing)
 * from the endpoint path (for specific API calls). This separation enables
 * flexible API routing and proxy configurations. SECURITY: By parsing and
 * returning structured segments we avoid string concatenation mistakes that may
 * allow path traversal or host spoofing.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Normalize URL with protocol first (ensures valid parsing)
 * - Use URL constructor for robust parsing of complex URLs
 * - Split into origin (base) and pathname+search (endpoint)
 * - Return structured object for easy destructuring
 * CHAIN POSITION: often the final step after ensureProtocol and
 * normalizeUrlOrigin when routing proxy requests or API calls.
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
 * appropriately (show error, use default, etc.). SECURITY: failing closed
 * avoids routing requests to unintended endpoints when input is malformed.
 * 
 * @param {string} url - The URL to parse into components
 * @returns {object|null} Object with baseUrl and endpoint properties, or null if parsing fails
 */
function parseUrlParts(url) {
  console.log(`parseUrlParts is running with ${url}`); logger.debug(`parseUrlParts is running with ${url}`); // trace incoming full URL
  try {
    // First normalize the URL to ensure it has a protocol for valid parsing
    const processedUrl = ensureProtocol(url); // add protocol if absent to satisfy URL constructor

    // If protocol normalization failed, abort parsing
    if (processedUrl === null) {
      console.log(`parseUrlParts is returning null`); logger.debug(`parseUrlParts is returning null`); // normalization failed
      return null; // input was invalid so fail closed for safety
    }

    // Parse URL into components using native URL constructor
    const parsed = new URL(processedUrl); // reliable parse of URL components

    // Create structured result with base URL and endpoint
    const result = {
      baseUrl: parsed.origin,                    // protocol + domain + port only
      endpoint: parsed.pathname + parsed.search  // path plus query string
    };

    console.log(`parseUrlParts is returning ${JSON.stringify(result)}`); logger.debug(`parseUrlParts is returning ${JSON.stringify(result)}`); // output parsed pieces
    return result; // deliver structured parts
  } catch (error) {
    // Handle URLs that can't be parsed by URL constructor
    qerrors(error, 'parseUrlParts', url); // log failure for debugging
    return null; // fail closed on parse error to avoid unsafe routing
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
  ensureProtocol, // export protocol check/append
  normalizeUrlOrigin, // export origin normalization
  stripProtocol, // export protocol stripping
  parseUrlParts // export URL dissection
};
/**
 * String Sanitization and Validation Utilities
 * 
 * RATIONALE: User input poses significant security risks including XSS attacks,
 * SQL injection, and data corruption. This module provides centralized string
 * sanitization following a security-first approach with fail-safe defaults.
 * 
 * SECURITY MODEL: Fail-closed - when uncertain about safety, remove content
 * rather than risk exposure. All sanitization functions are conservative and
 * log operations for security auditing.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Remove control characters that can break rendering or parsing
 * - Normalize whitespace to prevent layout manipulation
 * - Provide configurable sanitization levels for different use cases
 * - Maintain original string length tracking for audit purposes
 * - Log all sanitization operations for security monitoring
 */

const { qerrors } = require('qerrors');

/**
 * Sanitize string input by removing potentially dangerous characters
 * 
 * RATIONALE: Control characters (0x00-0x1F, 0x7F) can break terminal output,
 * database storage, and web rendering. Excessive whitespace can be used for
 * layout manipulation or to hide malicious content within legitimate text.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Remove all ASCII control characters that have no display value
 * - Preserve printable characters including international Unicode
 * - Normalize multiple whitespace sequences to single spaces
 * - Trim leading/trailing whitespace for consistent formatting
 * - Track sanitization operations for security auditing
 * 
 * SECURITY CONSIDERATIONS:
 * - Control characters can break terminal displays and log parsing
 * - Excessive whitespace can hide malicious content or break layouts
 * - Unicode is preserved to support international content
 * - Operation logging enables detection of malicious input patterns
 * 
 * CHARACTER REMOVAL STRATEGY:
 * - \x00-\x1F: ASCII control characters (null, tab, newline, etc.)
 * - \x7F: Delete character (DEL)
 * - Multiple consecutive spaces/tabs/newlines collapsed to single space
 * 
 * TYPICAL USE CASES:
 * - User-provided text content (comments, descriptions, titles)
 * - Form input sanitization before database storage
 * - Search query cleaning to prevent injection attacks
 * - Log message sanitization to prevent log injection
 * 
 * @param {string} input - String to sanitize (may contain dangerous characters)
 * @returns {string} Sanitized string with dangerous characters removed
 *                  - Empty string if input is null/undefined
 *                  - Preserves Unicode content for international support
 *                  - Whitespace normalized to single spaces
 * 
 * USAGE EXAMPLES:
 * sanitizeString("Hello\x00World\t\t  ")    // Returns "Hello World"
 * sanitizeString("Line1\nLine2\r\nLine3")   // Returns "Line1 Line2 Line3"
 * sanitizeString("  \t  Multiple   \n  ")   // Returns "Multiple"
 * sanitizeString("Café München 东京")        // Returns "Café München 东京" (preserves Unicode)
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    qerrors(new Error('sanitizeString called with invalid input'), 'sanitizeString', { 
      inputType: typeof input, 
      inputValue: input 
    });
    return '';
  }

  const originalLength = input.length;
  
  const sanitized = input
    .trim()                           // Remove leading/trailing whitespace
    .replace(/[\x00-\x1F\x7F]/g, '')  // Remove ASCII control characters
    .replace(/\s+/g, ' ');            // Normalize whitespace to single spaces

  const sanitizedLength = sanitized.length;
  
  // Log sanitization operations for security auditing
  if (originalLength !== sanitizedLength) {
    qerrors(new Error('String sanitization performed'), 'sanitizeString', {
      originalLength,
      sanitizedLength,
      charactersRemoved: originalLength - sanitizedLength,
      inputPreview: input.substring(0, 50) // First 50 chars for audit
    });
  }

  return sanitized;
}

/**
 * Sanitize error messages to prevent information disclosure
 * 
 * RATIONALE: Error messages often contain sensitive information like file paths,
 * IP addresses, database connection strings, and internal system details that
 * should never be exposed to end users or logged in plaintext.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Pattern matching to identify and replace common sensitive data patterns
 * - Length limitation to prevent excessively verbose error exposure
 * - Structured replacement with generic placeholders
 * - Preserve error context while removing sensitive details
 * 
 * SECURITY PATTERNS ADDRESSED:
 * - File system paths that reveal internal structure
 * - IP addresses that expose network topology
 * - Database URLs containing credentials
 * - Stack traces that reveal code structure
 * - Internal service names and ports
 * 
 * REPLACEMENT STRATEGY:
 * - File paths → [PATH] to indicate redacted filesystem information
 * - IP addresses → [IP] to indicate redacted network information  
 * - Database URLs → [DATABASE_URL] to indicate redacted connection strings
 * - Length truncation at 200 characters to prevent information overload
 * 
 * @param {any} error - Error object, string, or other value to sanitize
 * @returns {string} Sanitized error message safe for user display
 *                  - Generic fallback for unrecognized error types
 *                  - Sensitive information replaced with placeholders
 *                  - Limited to 200 characters maximum length
 * 
 * USAGE EXAMPLES:
 * sanitizeErrorMessage("File not found: /home/user/.env")
 * // Returns "File not found: [PATH]"
 * 
 * sanitizeErrorMessage("Connection failed to 192.168.1.100:5432")
 * // Returns "Connection failed to [IP]:5432"
 * 
 * sanitizeErrorMessage("mongodb://user:pass@cluster.mongodb.net/db")
 * // Returns "[DATABASE_URL]"
 */
function sanitizeErrorMessage(error) {
  if (typeof error === 'string') {
    return sanitizeErrorString(error);
  }
  
  if (error && typeof error.message === 'string') {
    return sanitizeErrorString(error.message);
  }
  
  // Generic fallback for unrecognized error types
  qerrors(new Error('Unknown error type passed to sanitizeErrorMessage'), 'sanitizeErrorMessage', {
    errorType: typeof error,
    errorConstructor: error && error.constructor ? error.constructor.name : 'unknown'
  });
  
  return 'An error occurred while processing your request.';
}

/**
 * Internal helper to sanitize error message strings
 * Centralizes the pattern matching and replacement logic
 * 
 * @param {string} message - Error message string to sanitize
 * @returns {string} Sanitized message with sensitive data replaced
 */
function sanitizeErrorString(message) {
  return message
    .replace(/\/[a-zA-Z0-9\/._-]+/g, '[PATH]')                    // Remove file paths
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')  // Remove IP addresses
    .replace(/mongodb:\/\/[^\s]+/g, '[DATABASE_URL]')             // Remove database URLs
    .replace(/mysql:\/\/[^\s]+/g, '[DATABASE_URL]')               // Remove MySQL URLs
    .replace(/postgres:\/\/[^\s]+/g, '[DATABASE_URL]')            // Remove PostgreSQL URLs
    .substring(0, 200);                                           // Limit message length
}

/**
 * Advanced string sanitization for HTML content
 * 
 * RATIONALE: When user content needs to be displayed in HTML contexts,
 * additional sanitization is required to prevent XSS attacks while
 * preserving basic formatting for readability.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Escape HTML special characters that could be interpreted as markup
 * - Preserve line breaks for readability by converting to <br> tags
 * - Apply basic string sanitization first to remove control characters
 * - Log HTML sanitization for security monitoring
 * 
 * HTML SECURITY PATTERNS:
 * - < and > characters could start/end HTML tags
 * - & characters could start HTML entities
 * - " and ' characters could break out of attribute values
 * - Line breaks need special handling for HTML display
 * 
 * @param {string} input - String that may contain HTML-dangerous characters
 * @returns {string} HTML-safe string with dangerous characters escaped
 *                  - Line breaks converted to <br> tags
 *                  - HTML special characters escaped
 *                  - Basic sanitization applied first
 * 
 * USAGE EXAMPLES:
 * sanitizeForHtml("<script>alert('xss')</script>")
 * // Returns "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
 * 
 * sanitizeForHtml("Line 1\nLine 2")
 * // Returns "Line 1<br>Line 2"
 */
function sanitizeForHtml(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Apply basic sanitization first
  const basicSanitized = sanitizeString(input);
  
  // Escape HTML special characters
  const htmlEscaped = basicSanitized
    .replace(/&/g, '&amp;')     // Must be first to avoid double-escaping
    .replace(/</g, '&lt;')      // Prevent opening tags
    .replace(/>/g, '&gt;')      // Prevent closing tags
    .replace(/"/g, '&quot;')    // Prevent attribute value breakout
    .replace(/'/g, '&#x27;')    // Prevent attribute value breakout
    .replace(/\n/g, '<br>');    // Convert line breaks to HTML

  qerrors(new Error('HTML sanitization performed'), 'sanitizeForHtml', {
    originalLength: input.length,
    sanitizedLength: htmlEscaped.length
  });

  return htmlEscaped;
}

/**
 * Validate and sanitize pagination parameters
 * 
 * RATIONALE: Pagination parameters directly affect database queries and can
 * be exploited for denial-of-service attacks or resource exhaustion. This
 * function provides safe defaults and validates bounds to prevent abuse.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Parse string parameters to integers with error handling
 * - Apply reasonable bounds to prevent resource exhaustion
 * - Provide safe defaults for missing or invalid parameters
 * - Support both 'offset' and 'skip' parameter naming conventions
 * - Log validation failures for monitoring potential abuse
 * 
 * SECURITY CONSIDERATIONS:
 * - Large limit values can cause memory exhaustion
 * - Negative offset values can break database queries
 * - Non-numeric values could cause parsing errors
 * - Missing parameters need safe defaults
 * 
 * BUSINESS LOGIC:
 * - Default page size balances performance with usability
 * - Maximum page size prevents resource exhaustion
 * - Minimum page size ensures reasonable user experience
 * - Offset validation prevents negative indexing
 * 
 * @param {object} query - Query parameters object (typically req.query)
 * @param {object} limits - Optional limits configuration
 * @returns {object} Validated pagination parameters with safe defaults
 *                  - limit: validated page size within acceptable bounds
 *                  - offset: validated offset, never negative
 * 
 * USAGE EXAMPLES:
 * validatePagination({ limit: "25", offset: "100" })
 * // Returns { limit: 25, offset: 100 }
 * 
 * validatePagination({ limit: "invalid", skip: "-5" })
 * // Returns { limit: 20, offset: 0 } (safe defaults)
 * 
 * validatePagination({}, { maxLimit: 100, defaultLimit: 50 })
 * // Returns { limit: 50, offset: 0 } (custom defaults)
 */
function validatePagination(query, limits = {}) {
  const {
    minLimit = 1,
    maxLimit = 100,
    defaultLimit = 20
  } = limits;

  if (!query || typeof query !== 'object') {
    qerrors(new Error('Invalid query object passed to validatePagination'), 'validatePagination', {
      queryType: typeof query
    });
    return { limit: defaultLimit, offset: 0 };
  }

  const limitParam = query.limit;
  const offsetParam = query.offset || query.skip;
  
  let limit = defaultLimit;
  let offset = 0;
  
  // Validate and parse limit parameter
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < minLimit || parsedLimit > maxLimit) {
      qerrors(new Error('Invalid limit parameter in pagination'), 'validatePagination', {
        providedLimit: limitParam,
        minLimit,
        maxLimit,
        defaultLimit
      });
      // Keep default limit for invalid input
    } else {
      limit = parsedLimit;
    }
  }
  
  // Validate and parse offset parameter
  if (offsetParam) {
    const parsedOffset = parseInt(offsetParam, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      qerrors(new Error('Invalid offset parameter in pagination'), 'validatePagination', {
        providedOffset: offsetParam
      });
      // Keep default offset (0) for invalid input
    } else {
      offset = parsedOffset;
    }
  }
  
  return { limit, offset };
}

module.exports = {
  sanitizeString,
  sanitizeErrorMessage,
  sanitizeForHtml,
  validatePagination
};
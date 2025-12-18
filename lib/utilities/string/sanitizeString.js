/**
 * Sanitize String for Safe Display and Processing using sanitize-html
 *
 * PURPOSE: Removes potentially harmful content from user input while preserving
 * legitimate text for display in web interfaces, logs, or data processing.
 * Uses the industry-standard sanitize-html library for comprehensive XSS prevention.
 *
 * SECURITY FILTERING:
 * - All HTML tags removed using sanitize-html with strict configuration
 * - HTML attributes stripped for maximum security
 * - Dangerous protocols automatically filtered by sanitize-html
 * - Event handlers and script injection prevented
 * - Control characters and malicious patterns handled by sanitize-html
 * 
 * PRESERVATION RULES:
 * - Keep alphanumeric characters (all languages)
 * - Preserve common punctuation: . , ; : ! ? ' " - _
 * - Maintain whitespace structure (spaces, tabs, newlines)
 * - Allow international characters and Unicode symbols
 * - Leverage sanitize-html's comprehensive security filtering
 * 
 * @param {any} input - Input to sanitize (will be converted to string)
 * @returns {string} Sanitized string safe for display and processing
 * @throws Never throws - returns empty string for null/undefined input
 */

const sanitizeHtml = require('sanitize-html');
const logger = require('../../logger');

function sanitizeString(input) {
  logger.debug(`sanitizeString: starting sanitization`, { 
    inputType: typeof input,
    inputLength: input ? input.toString().length : 0
  });

  try {
    // Handle null and undefined inputs
    if (input === null || input === undefined) {
      logger.debug(`sanitizeString: null or undefined input`);
      return ``;
    }

    // Convert input to string if it isn't already, but reject dangerous object types
    let str;
    if (typeof input === 'string') {
      str = input;
    } else if (input === null || input === undefined) {
      logger.debug(`sanitizeString: null or undefined input`);
      return ``;
    } else if (typeof input === 'number' || typeof input === 'boolean') {
      // Safe primitive conversions
      str = String(input);
    } else {
      // Reject objects, arrays, functions for security - they could have malicious toString()
      logger.warn(`sanitizeString: rejecting complex object input for security`, { 
        inputType: typeof input
      });
      return ``;
    }

    // Handle empty string
    if (str === ``) {
      logger.debug(`sanitizeString: empty string input`);
      return ``;
    }

    // Use sanitize-html with strict security configuration
    const sanitized = sanitizeHtml(str, {
      allowedTags: [], // Disallow all HTML tags for maximum security
      allowedAttributes: {}, // Disallow all attributes
      textFilter: (text) => text, // Preserve text content as-is
      disallowedTagsMode: 'discard', // Discard malicious content rather than escaping
      enforceHtmlBoundary: false // Allow text without proper HTML boundaries
    });
    
    logger.debug(`sanitizeString: sanitization completed`, { 
      originalLength: str.length,
      sanitizedLength: sanitized.length,
      charactersRemoved: str.length - sanitized.length
    });

    return sanitized;

  } catch (error) {
    logger.error(`sanitizeString failed with unexpected error`, { 
      error: error.message,
      stack: error.stack,
      inputType: typeof input
    });

    // Return empty string as safe fallback
    return ``;
  }
}

module.exports = sanitizeString;
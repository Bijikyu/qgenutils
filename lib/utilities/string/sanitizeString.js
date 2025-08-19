/**
 * Sanitize String Input by Removing Potentially Dangerous Characters
 * 
 * RATIONALE: User input can contain malicious characters that lead to XSS attacks,
 * SQL injection, or other security vulnerabilities. This function provides
 * comprehensive input sanitization while preserving legitimate content.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Remove HTML tags and entities to prevent XSS attacks
 * - Strip script-related content and event handlers
 * - Normalize whitespace and remove control characters
 * - Preserve legitimate punctuation and international characters
 * - Handle edge cases like null, undefined, and non-string inputs
 * 
 * SECURITY FILTERING:
 * - HTML tags: <script>, <style>, <iframe>, <object>, <embed>
 * - JavaScript: javascript:, data:, vbscript: protocols
 * - Event handlers: onclick, onload, onerror, etc.
 * - Control characters: \x00-\x1F (except \t, \n, \r)
 * - Suspicious patterns: &#x, &#, javascript escape sequences
 * 
 * PRESERVATION RULES:
 * - Keep alphanumeric characters (all languages)
 * - Preserve common punctuation: . , ; : ! ? ' " - _
 * - Maintain whitespace structure (spaces, tabs, newlines)
 * - Allow international characters and Unicode symbols
 * 
 * @param {any} input - Input to sanitize (will be converted to string)
 * @returns {string} Sanitized string safe for display and processing
 * @throws Never throws - returns empty string for null/undefined input
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

function sanitizeString(input) {
  logger.debug('sanitizeString: starting sanitization', { 
    inputType: typeof input,
    inputLength: input ? input.toString().length : 0
  });

  try {
    // Handle null and undefined inputs
    if (input === null || input === undefined) {
      logger.debug('sanitizeString: null or undefined input');
      return '';
    }

    // Convert input to string if it isn't already
    let str;
    try {
      str = String(input);
    } catch (conversionError) {
      qerrors(conversionError, 'sanitizeString-conversion', { inputType: typeof input });
      logger.error('sanitizeString: string conversion failed', { 
        error: conversionError.message,
        inputType: typeof input
      });
      return '';
    }

    // Handle empty string
    if (str === '') {
      logger.debug('sanitizeString: empty string input');
      return '';
    }

    let sanitized = str;

    // Remove HTML tags (including malicious ones)
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove HTML entities
    sanitized = sanitized.replace(/&[#\w]+;/g, '');
    
    // Remove javascript: and data: protocols
    sanitized = sanitized.replace(/(?:javascript|data|vbscript):/gi, '');
    
    // Remove common event handlers
    sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');
    
    // Remove style attributes
    sanitized = sanitized.replace(/\bstyle\s*=/gi, '');
    
    // Remove control characters except tab, newline, and carriage return
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Remove potentially dangerous escape sequences
    sanitized = sanitized.replace(/\\[ux][\da-fA-F]{2,4}/g, '');
    
    // Remove excessive whitespace while preserving structure
    sanitized = sanitized.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
    sanitized = sanitized.replace(/\n\s*\n/g, '\n'); // Multiple newlines to single newline
    
    // Trim leading and trailing whitespace
    sanitized = sanitized.trim();

    const originalLength = str.length;
    const sanitizedLength = sanitized.length;
    const charsRemoved = originalLength - sanitizedLength;

    logger.debug('sanitizeString: sanitization completed', {
      originalLength,
      sanitizedLength,
      charsRemoved,
      removalPercentage: originalLength > 0 ? (charsRemoved / originalLength * 100).toFixed(1) : 0
    });

    return sanitized;

  } catch (error) {
    // Handle any unexpected errors during sanitization
    qerrors(error, 'sanitizeString', { 
      inputType: typeof input,
      inputLength: input ? input.toString().length : 0,
      errorMessage: error.message
    });
    logger.error('sanitizeString failed with error', { 
      error: error.message,
      inputType: typeof input,
      stack: error.stack
    });

    // Return empty string as safe fallback
    return '';
  }
}

module.exports = sanitizeString;
/**
 * Sanitize String for Safe Display and Processing
 *
 * PURPOSE: Removes potentially harmful content from user input while preserving
 * legitimate text for display in web interfaces, logs, or data processing.
 * Designed for XSS prevention and general input sanitization.
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

// Defensive require for qerrors to prevent test environment failures
let qerrors;
try {
  const qerrorsModule = require('qerrors');
  qerrors = qerrorsModule && qerrorsModule.qerrors ? qerrorsModule.qerrors : (qerrorsModule && qerrorsModule.default) ? qerrorsModule.default : qerrorsModule;
} catch (err) {
  // Provide a no-op fallback so tests won't fail if qerrors is absent
  qerrors = function () { /* no-op error reporter for test envs */ };
}

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

    // Convert input to string if it isn't already
    let str;
    try {
      str = String(input);
    } catch (conversionError) {
      qerrors(conversionError, `sanitizeString-conversion`, { inputType: typeof input });
      logger.error(`sanitizeString: string conversion failed`, { 
        error: conversionError.message,
        inputType: typeof input
      });
      return ``;
    }

    // Handle empty string
    if (str === ``) {
      logger.debug(`sanitizeString: empty string input`);
      return ``;
    }

    let sanitized = str;

    // Remove HTML tags (including malicious ones)
    sanitized = sanitized.replace(/<[^>]*>/g, ``);
    
    // Enhanced security filters for comprehensive XSS prevention
    // Remove HTML entities including numeric and hex entities
    sanitized = sanitized.replace(/&[#\w]+;/g, ``);
    
    // Remove dangerous protocols and javascript execution attempts
    sanitized = sanitized.replace(/javascript:/gi, ``);
    sanitized = sanitized.replace(/vbscript:/gi, ``);
    sanitized = sanitized.replace(/data:/gi, ``);
    sanitized = sanitized.replace(/blob:/gi, ``);
    sanitized = sanitized.replace(/filesystem:/gi, ``);
    
    // Enhanced event handler and function call removal
    sanitized = sanitized.replace(/on\w+\s*=/gi, ``);
    sanitized = sanitized.replace(/eval\s*\(/gi, ``);
    sanitized = sanitized.replace(/exec\s*\(/gi, ``);
    sanitized = sanitized.replace(/system\s*\(/gi, ``);
    
    // Remove control characters except tab, newline, and carriage return
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ``);
    
    // Remove potentially dangerous attribute patterns
    sanitized = sanitized.replace(/style\s*=/gi, ``);
    sanitized = sanitized.replace(/src\s*=/gi, ``);
    sanitized = sanitized.replace(/href\s*=/gi, ``);
    
    // Remove base64 data schemes that could contain malicious content
    sanitized = sanitized.replace(/data:[\w\/\+]+;base64,[A-Za-z0-9+\/=]+/gi, ``);
    
    // Remove javascript escape sequences
    sanitized = sanitized.replace(/\\x[0-9a-fA-F]{2}/g, ``);
    sanitized = sanitized.replace(/\\u[0-9a-fA-F]{4}/g, ``);
    
    logger.debug(`sanitizeString: sanitization completed`, { 
      originalLength: str.length,
      sanitizedLength: sanitized.length,
      charactersRemoved: str.length - sanitized.length
    });

    return sanitized;

  } catch (error) {
    // Handle unexpected errors during sanitization
    qerrors(error, `sanitizeString`, { 
      inputType: typeof input,
      inputPreview: input ? input.toString().substring(0, 50) : null,
      errorMessage: error.message
    });

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
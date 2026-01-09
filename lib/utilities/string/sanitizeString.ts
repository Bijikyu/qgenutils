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

import sanitizeHtml from 'sanitize-html';
import {
  handleUtilityError,
  validateString,
  createDebugLogger
} from '../helpers/index.js';

// Pre-configure sanitize options to avoid object creation on each call
const SANITIZE_OPTIONS = {
  allowedTags: [],
  allowedAttributes: {},
  textFilter: (text: string): string => text,
  disallowedTagsMode: 'discard' as const,
  enforceHtmlBoundary: false
};

const sanitizeString = (input: any): any => {
  const debug = createDebugLogger('sanitizeString');

  // Validate input using centralized validation
  const validationResult = validateString(input, 'sanitizeString', '', {
    allowEmpty: true,
    trim: false
  });

  if (!validationResult.isValid) {
    // For complex objects, validation already logged the warning
    return validationResult.value;
  }

  const str = validationResult.value;

  // Early return for empty string
  if (str === '') {
    return '';
  }

  try {
    debug.start({ inputLength: str.length });

    const sanitized: string = sanitizeHtml(str, SANITIZE_OPTIONS);

    // Only log debug for significant changes to reduce noise
    if (str.length !== sanitized.length && str.length - sanitized.length > 10) {
      debug.step('significant sanitization', {
        originalLength: str.length,
        sanitizedLength: sanitized.length,
        charactersRemoved: str.length - sanitized.length
      });
    }

    debug.success({ outputLength: sanitized.length });
    return sanitized;

  } catch (error) {
    return handleUtilityError(error, 'sanitizeString', {
      inputType: typeof input,
      inputLength: str.length
    }, '');
  }
};

export default sanitizeString;

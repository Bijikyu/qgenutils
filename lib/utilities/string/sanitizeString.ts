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

const sanitizeHtml: any = require('sanitize-html');
import logger from '../../../logger.js';

const sanitizeString = (input: any): any => {
  logger.debug(`sanitizeString: starting sanitization`, { inputType: typeof input, inputLength: input ? String(input).length : 0 });
  try {
    if (input == null) {
      logger.debug(`sanitizeString: null or undefined input`);
      return ``;
    }
    let str;
    if (typeof input === `string`) str = input;
    else if (typeof input === `number` || typeof input === `boolean`) str = String(input);
    else {
      logger.warn(`sanitizeString: rejecting complex object input for security`, { inputType: typeof input });
      return ``;
    }
    if (str === ``) {
      logger.debug(`sanitizeString: empty string input`);
      return ``;
    }
    const sanitized: any = sanitizeHtml(str, { allowedTags: [], allowedAttributes: {}, textFilter: text => text, disallowedTagsMode: 'discard', enforceHtmlBoundary: false });
    logger.debug(`sanitizeString: sanitization completed`, { originalLength: str.length, sanitizedLength: sanitized.length, charactersRemoved: str.length - sanitized.length });
    return sanitized;
  } catch (error) {
    logger.error(`sanitizeString failed with unexpected error`, { error: error.message, stack: error.stack, inputType: typeof input });
    return ``;
  }
};

export default sanitizeString;
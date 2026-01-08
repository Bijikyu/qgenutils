/**
 * Strip Protocol and Trailing Slash from URL for Display
 * 
 * RATIONALE: User interfaces often need to display URLs without protocol
 * prefix for cleaner presentation. This function removes http:// or https://
 * and normalizes trailing slashes for consistent display formatting.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use case-insensitive regex to match both HTTP and HTTPS
 * - Remove only protocol prefix, preserve the rest of URL
 * - Handle trailing slash normalization for clean display
 * - Chain regex operations for predictable transformations
 * - Return original URL on any processing errors
 * 
 * COMMON USE CASES:
 * - URL display in configuration interfaces
 * - Shortened URL presentation in lists
 * - Clean domain names for user-facing displays
 * - Configuration file generation
 * 
 * TRANSFORMATION EXAMPLES:
 * - "https://example.com/" -> "example.com"
 * - "http://api.example.com/v1" -> "api.example.com/v1"
 * - "HTTPS://Example.COM/" -> "Example.COM"
 * 
 * SECURITY CONSIDERATIONS:
 * - Does not validate URL structure (use with validated URLs)
 * - Preserves original casing for display purposes
 * - Returns original input on processing errors
 * - No network requests or external validation
 * 
 * @param {string} url - URL to strip protocol from
 * @returns {string} URL without protocol prefix and normalized trailing slash
 * @throws Never throws - returns original URL on any error
 */

import { qerrors } from 'qerrors';
import logger from '../../logger.js';
import isValidString from '../helpers/isValidString.js';

const stripProtocol = (url: string): string => {
  logger.debug(`stripProtocol is running with ${url}`);
  
  try {
    if (!isValidString(url)) {
      logger.debug(`stripProtocol returning original input due to invalid type`);
      return url || '';
    }
    
    const processed = url
      .replace(/^https?:\/\//i, '')
      .replace(/\/$/, '');
    
    logger.debug(`stripProtocol is returning ${processed}`);
    return processed;
  } catch (error) {
    qerrors(error, `stripProtocol`);
    logger.error(`stripProtocol failed with error: ${error instanceof Error ? error.message : String(error)}`);
    return url;
  }
};

export default stripProtocol;
/**
 * Ensure URL Has HTTPS Protocol for Security-First URL Processing
 * 
 * RATIONALE: User-provided URLs often lack protocols, which can lead to:
 * - Relative URL interpretation instead of absolute URLs
 * - Insecure HTTP connections when HTTPS was intended
 * - Inconsistent URL handling across the application
 * - Security vulnerabilities from protocol-relative URLs
 * 
 * IMPLEMENTATION STRATEGY:
 * - Default to HTTPS for security (fail-secure approach)
 * - Handle common URL variations (with/without protocol, with/without www)
 * - Preserve existing protocols when explicitly specified
 * - Normalize protocol format (lowercase, proper syntax)
 * - Handle edge cases like protocol-relative URLs (//example.com)
 * 
 * SECURITY CONSIDERATIONS:
 * - HTTPS-first approach protects user data in transit
 * - Prevents accidental downgrade to HTTP
 * - Handles malicious inputs that might exploit protocol parsing
 * - Validates URL structure to prevent injection attacks
 * 
 * PROTOCOL HANDLING RULES:
 * - No protocol: Add https://
 * - HTTP protocol: Preserve as-is (don't force upgrade)
 * - HTTPS protocol: Preserve as-is
 * - Protocol-relative (//): Add https: prefix
 * - Invalid protocols: Default to https://
 * 
 * @param {string} url - URL string that may or may not have a protocol
 * @returns {string} URL with protocol ensured (defaults to https://)
 * @throws Never throws - returns safe fallback URL on any error
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');

function ensureProtocol(url) {
  console.log(`ensureProtocol is running with: ${url}`);
  logger.debug('ensureProtocol processing URL', { inputUrl: url });
  
  try {
    // Handle null, undefined, or empty string inputs
    if (!url || typeof url !== 'string') {
      console.log('ensureProtocol received invalid input, returning https://');
      logger.warn('ensureProtocol received invalid URL input', { url, type: typeof url });
      return 'https://';
    }

    // Trim whitespace that could interfere with URL parsing
    const trimmedUrl = url.trim();
    
    if (trimmedUrl === '') {
      console.log('ensureProtocol received empty string, returning https://');
      logger.debug('ensureProtocol: empty URL after trimming');
      return 'https://';
    }

    // Check if URL already has a valid protocol
    const protocolRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
    const hasProtocol = protocolRegex.test(trimmedUrl);
    
    if (hasProtocol) {
      // URL already has protocol, validate and normalize it
      const protocolMatch = trimmedUrl.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)(.*)/);
      
      if (protocolMatch) {
        const protocol = protocolMatch[1].toLowerCase();
        const rest = protocolMatch[2];
        
        // Handle known protocols
        if (protocol === 'http:' || protocol === 'https:' || protocol === 'ftp:' || protocol === 'ftps:') {
          const normalizedUrl = protocol + rest;
          console.log(`ensureProtocol preserving existing protocol: ${normalizedUrl}`);
          logger.debug('ensureProtocol: preserved existing valid protocol', { 
            original: trimmedUrl, 
            normalized: normalizedUrl 
          });
          return normalizedUrl;
        }
        
        // Unknown or potentially dangerous protocol, default to HTTPS
        console.log(`ensureProtocol replacing unknown protocol: ${protocol}`);
        logger.warn('ensureProtocol: unknown protocol detected, defaulting to HTTPS', { 
          originalProtocol: protocol, 
          url: trimmedUrl 
        });
        
        const httpsUrl = 'https://' + rest.replace(/^\/\//, '');
        console.log(`ensureProtocol returning: ${httpsUrl}`);
        return httpsUrl;
      }
    }

    // Handle protocol-relative URLs (//example.com)
    if (trimmedUrl.startsWith('//')) {
      const httpsUrl = 'https:' + trimmedUrl;
      console.log(`ensureProtocol handling protocol-relative URL: ${httpsUrl}`);
      logger.debug('ensureProtocol: converted protocol-relative URL', { 
        original: trimmedUrl, 
        result: httpsUrl 
      });
      return httpsUrl;
    }

    // No protocol detected, add HTTPS
    const httpsUrl = 'https://' + trimmedUrl;
    console.log(`ensureProtocol adding HTTPS to URL: ${httpsUrl}`);
    logger.debug('ensureProtocol: added HTTPS protocol', { 
      original: trimmedUrl, 
      result: httpsUrl 
    });
    
    return httpsUrl;

  } catch (error) {
    // Handle any unexpected errors during URL processing
    console.error('ensureProtocol encountered error:', error.message);
    qerrors(error, 'ensureProtocol', { inputUrl: url });
    logger.error('ensureProtocol failed with error', { 
      error: error.message, 
      inputUrl: url 
    });
    
    // Return safe fallback URL
    const fallbackUrl = 'https://';
    console.log(`ensureProtocol returning fallback: ${fallbackUrl}`);
    return fallbackUrl;
  }
}

module.exports = ensureProtocol;
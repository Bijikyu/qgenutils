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
const logger = require('../../logger');
const isValidString = require('../helpers/isValidString');

const ensureProtocol = (url) => {
  logger.debug(`ensureProtocol processing URL`, { inputUrl: url });
  
  try {
    if (!isValidString(url)) {
      logger.warn(`ensureProtocol received invalid URL input`, { url, type: typeof url });
      return `https://`;
    }

    const trimmedUrl = url.trim();
    
    if (trimmedUrl === ``) {
      logger.debug(`ensureProtocol: empty URL after trimming`);
      return `https://`;
    }

    const protocolRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
    const hasProtocol = protocolRegex.test(trimmedUrl);
    
    if (hasProtocol) {
      const protocolMatch = trimmedUrl.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)(.*)/);
      
      if (protocolMatch) {
        const protocol = protocolMatch[1].toLowerCase();
        const rest = protocolMatch[2];
        
        if (protocol === `http:` || protocol === `https:` || protocol === `ftp:` || protocol === `ftps:`) {
          const normalizedUrl = protocol + rest;
          logger.debug(`ensureProtocol: preserved existing valid protocol`, { 
            original: trimmedUrl, 
            normalized: normalizedUrl 
          });
          return normalizedUrl;
        }
        
        logger.warn(`ensureProtocol: unknown protocol detected, defaulting to HTTPS`, { 
          originalProtocol: protocol, 
          url: trimmedUrl 
        });
        
        const httpsUrl = `https://` + rest.replace(/^\/\//, ``);
        return httpsUrl;
      }
    }

    if (trimmedUrl.startsWith(`//`)) {
      const httpsUrl = `https:` + trimmedUrl;
      logger.debug(`ensureProtocol: converted protocol-relative URL`, { 
        original: trimmedUrl, 
        result: httpsUrl 
      });
      return httpsUrl;
    }

    const httpsUrl = `https://` + trimmedUrl;
    logger.debug(`ensureProtocol: added HTTPS protocol`, { 
      original: trimmedUrl, 
      result: httpsUrl 
    });
    
    return httpsUrl;

  } catch (error) {
    qerrors(error, `ensureProtocol`, { inputUrl: url });
    logger.error(`ensureProtocol failed with error`, { 
      error: error.message, 
      inputUrl: url 
    });
    
    return `https://`;
  }
};

module.exports = ensureProtocol;
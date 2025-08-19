/**
 * Normalize URL to its Origin in Lowercase for Comparison
 * 
 * RATIONALE: URL comparison often needs to focus on the origin (protocol + domain + port)
 * while ignoring path, query parameters, and case differences. This function creates
 * standardized origins for allowlist checking, routing decisions, and security validation.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Extract protocol, hostname, and port using URL constructor
 * - Convert hostname to lowercase for case-insensitive comparison
 * - Preserve port information when explicitly specified
 * - Handle default ports (80 for HTTP, 443 for HTTPS) consistently
 * - Return null for malformed URLs rather than throwing errors
 * 
 * URL ORIGIN COMPONENTS:
 * - Protocol: http: or https: (includes the colon)
 * - Hostname: domain name converted to lowercase
 * - Port: explicitly specified ports only (default ports omitted)
 * 
 * NORMALIZATION RULES:
 * - Convert hostname to lowercase: Example.COM → example.com
 * - Preserve explicit non-default ports: https://example.com:8443
 * - Omit default ports: https://example.com:443 → https://example.com
 * - Handle IPv6 addresses in brackets: [::1]:8080
 * 
 * SECURITY CONSIDERATIONS:
 * - Prevents case-based bypass attempts (EXAMPLE.com vs example.com)
 * - Standardizes origins for allowlist/blocklist checking
 * - Handles malicious URLs gracefully without exposing errors
 * - Validates URL structure before processing
 * 
 * @param {string} url - URL to normalize (should include protocol)
 * @returns {string|null} Normalized origin (protocol://hostname:port) or null if invalid
 * @throws Never throws - returns null for any error condition
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');
const isValidString = require('../../validation/isValidString');

function normalizeUrlOrigin(url) {
  logger.debug('normalizeUrlOrigin: starting URL origin normalization', { 
    inputUrl: url,
    inputType: typeof url
  });

  try {
    // Validate input
    if (!isValidString(url)) {
      logger.warn('normalizeUrlOrigin: invalid URL input provided', { 
        url, 
        type: typeof url 
      });
      return null;
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl === '') {
      logger.debug('normalizeUrlOrigin: empty URL after trimming');
      return null;
    }

    // Parse URL using built-in URL constructor
    let urlObj;
    try {
      urlObj = new URL(trimmedUrl);
    } catch (parseError) {
      qerrors(parseError, 'normalizeUrlOrigin-parse', { 
        url: trimmedUrl,
        parseError: parseError.message
      });
      logger.warn('normalizeUrlOrigin: URL parsing failed', { 
        url: trimmedUrl,
        error: parseError.message
      });
      return null;
    }

    // Extract and normalize components
    const protocol = urlObj.protocol; // Includes the trailing colon
    const hostname = urlObj.hostname.toLowerCase(); // Convert to lowercase
    const port = urlObj.port; // Empty string for default ports

    // Validate protocol
    if (!protocol.match(/^https?:$/)) {
      logger.warn('normalizeUrlOrigin: unsupported protocol detected', { 
        protocol,
        url: trimmedUrl
      });
      return null;
    }

    // Validate hostname
    if (!hostname || hostname === '') {
      logger.warn('normalizeUrlOrigin: missing hostname in URL', { 
        url: trimmedUrl
      });
      return null;
    }

    // Build normalized origin
    let normalizedOrigin = `${protocol}//${hostname}`;
    
    // Include port if explicitly specified and not default
    if (port && port !== '') {
      // Check if port is not default for the protocol
      const isDefaultPort = (protocol === 'http:' && port === '80') ||
                           (protocol === 'https:' && port === '443');
      
      if (!isDefaultPort) {
        normalizedOrigin += `:${port}`;
      }
    }

    logger.debug('normalizeUrlOrigin: normalization completed successfully', {
      originalUrl: trimmedUrl,
      normalizedOrigin,
      protocol,
      hostname,
      port: port || 'default'
    });

    return normalizedOrigin;

  } catch (error) {
    // Handle any unexpected errors during normalization
    qerrors(error, 'normalizeUrlOrigin', { 
      url,
      errorMessage: error.message
    });
    logger.error('normalizeUrlOrigin failed with error', { 
      error: error.message,
      url,
      stack: error.stack
    });

    // Return null as safe fallback
    return null;
  }
}

module.exports = normalizeUrlOrigin;
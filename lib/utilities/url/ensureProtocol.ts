/**
 * URL Protocol Normalization Utility
 *
 * PURPOSE: Ensures URLs have proper protocols with comprehensive validation
 * and normalization. This utility handles various URL formats and provides
 * consistent protocol enforcement for security and compatibility.
 *
 * WHY: Protocol normalization is crucial for:
 * - Security: Preventing protocol-relative URLs that can be exploited
 * - Consistency: Ensuring all URLs use the same protocol scheme
 * - Compatibility: Handling various input formats gracefully
 * - Validation: Detecting malformed or malicious URLs
 */

import { qerrors } from '@bijikyu/qerrors';
import logger from '../../logger.js';
import isValidString from '../helpers/isValidString.js';

/**
 * Result interface for protocol normalization operations
 */
type ProtocolResult = {
  original: string;    // Original input URL
  processed: string;   // Processed URL with normalized protocol
  added: boolean;      // Whether protocol was added/modified
  error?: string;     // Error message if validation failed
};

/**
 * Normalizes URL while preserving trailing slash behavior
 *
 * This helper function maintains the original URL's trailing slash
 * characteristics while ensuring proper protocol formatting.
 *
 * @param input - Original input string
 * @param parsed - Parsed URL object
 * @returns Normalized URL string
 */
const normalizePreservingNoTrailingSlash = (input: string, parsed: URL): string => {
  // Check if URL has search parameters or hash
  const hasSearchOrHash = !!(parsed.search || parsed.hash);
  // Check if URL has a non-root path
  const hasNonRootPath = parsed.pathname && parsed.pathname !== '/';
  // Check if original input had trailing slash
  const inputHasTrailingSlash = input.endsWith('/');

  // For root URLs without search/hash and no trailing slash, return origin only
  if (!hasNonRootPath && !hasSearchOrHash && !inputHasTrailingSlash) {
    return parsed.origin;
  }

  // Otherwise return full URL to preserve all components
  return parsed.toString();
};

/**
 * Normalizes protocol string to consistent format
 *
 * This function cleans up protocol strings by removing trailing
 * characters and validating against protocol naming rules.
 *
 * @param protocol - Protocol string to normalize
 * @param fallback - Fallback protocol if invalid
 * @returns Normalized protocol string
 */
const normalizeProtocol = (protocol: any, fallback: string): string => {
  // Validate input type
  if (typeof protocol !== 'string') {
    return fallback;
  }

  // Clean up protocol string
  let normalized = protocol.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  // Remove common protocol suffixes
  if (normalized.endsWith('://')) {
    normalized = normalized.slice(0, -3);
  }
  if (normalized.endsWith(':')) {
    normalized = normalized.slice(0, -1);
  }

  // Validate against protocol naming rules (RFC 3986)
  if (!/^[a-z][a-z0-9+.-]*$/.test(normalized)) {
    return fallback;
  }

  return normalized;
};

/**
 * Ensures URL has proper protocol with comprehensive validation
 *
 * This function validates and normalizes URLs to ensure they have
 * appropriate protocols. It handles various edge cases including
 * protocol-relative URLs, malformed URLs, and unsupported protocols.
 *
 * @param url - URL to validate and normalize
 * @param protocol - Protocol to enforce (default: 'https')
 * @returns ProtocolResult with processed URL and metadata
 */
const ensureProtocol = (url: any, protocol: string = 'https'): ProtocolResult => {
  // Normalize the protocol string first
  const normalizedProtocol = normalizeProtocol(protocol, 'https');
  const fallbackPrefix = `${normalizedProtocol}://`;

  // Validate input URL
  if (!isValidString(url)) {
    return { original: '', processed: fallbackPrefix, added: true, error: 'Invalid URL' };
  }

  const trimmedUrl = url.trim();
  if (trimmedUrl === '') {
    return { original: '', processed: fallbackPrefix, added: true, error: 'Empty URL' };
  }

  // Handle protocol-relative URLs (starting with //)
  if (trimmedUrl.startsWith('//')) {
    return { original: trimmedUrl, processed: `${normalizedProtocol}:${trimmedUrl}`, added: true };
  }

  try {
    // Parse URL to validate structure and extract protocol
    // Prepend https:// protocol for URLs without it to allow parsing
    const urlToParse = trimmedUrl.includes('://') ? trimmedUrl : `https://${trimmedUrl}`;
    const parsedUrl = new URL(urlToParse);

    // Define allowed protocols for security
    const allowedProtocols = new Set(['http:', 'https:', 'ftp:', 'ftps:']);

    if (allowedProtocols.has(parsedUrl.protocol)) {
      // URL has valid protocol, normalize while preserving structure
      const processed = normalizePreservingNoTrailingSlash(trimmedUrl, parsedUrl);
      return { original: trimmedUrl, processed, added: false };
    }

    // URL has unsupported protocol
    return {
      original: trimmedUrl,
      processed: fallbackPrefix,
      added: true,
      error: `Unsupported protocol: ${parsedUrl.protocol}`
    };
  } catch (err) {
    // Handle parsing errors (malformed URLs)
    if (trimmedUrl.includes('://')) {
      // URL has protocol but is malformed
      const errorObj = err instanceof Error ? err : new Error(String(err));
      qerrors(errorObj, 'ensureProtocol');
      logger.warn('ensureProtocol: invalid URL with protocol', { url: trimmedUrl, error: errorObj.message });
      return { original: trimmedUrl, processed: fallbackPrefix, added: true, error: 'Invalid URL' };
    }

    // URL has no protocol, treat as relative and add default
    return { original: trimmedUrl, processed: `${fallbackPrefix}${trimmedUrl}`, added: true };
  }
};

export default ensureProtocol;

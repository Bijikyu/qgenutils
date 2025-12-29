/**
 * Ensure URL has proper HTTP/HTTPS protocol with configurable empty handling.
 *
 * PURPOSE: URL protocol normalization with object-based API and allowEmpty option.
 * Delegates to ensureProtocol for core logic while adding empty input handling.
 *
 * FEATURES:
 * - allowEmpty: true = return empty string for empty input
 * - allowEmpty: false/undefined = return "https://" for empty input (default)
 * - Handles protocol-relative URLs (//example.com)
 * - Preserves existing valid protocols (http://, https://)
 *
 * @param {object} data - Input data object
 * @param {string} data.url - URL to normalize
 * @param {boolean} [data.allowEmpty] - When true, return empty string for empty input
 * @returns {string} Normalized URL with protocol
 */

import ensureProtocol from './ensureProtocol.js';

function ensureProtocolUrl(data) {
  if (!data || typeof data !== 'object') {
    return 'https://';
  }

  const input: any = (data.url ?? '').trim();
  
  if (!input) {
    return data.allowEmpty ? '' : 'https://';
  }

  return ensureProtocol(input);
}

export default ensureProtocolUrl;

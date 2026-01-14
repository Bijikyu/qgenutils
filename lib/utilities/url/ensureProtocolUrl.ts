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
 * @module url/ensureProtocolUrl
 */

import ensureProtocol from './ensureProtocol.js';

export interface EnsureProtocolData {
  url: string;
  allowEmpty?: boolean;
}

/**
 * Normalize URL with protocol, with configurable empty input handling.
 *
 * @param data - Input data with url and optional allowEmpty flag
 * @returns Normalized URL with protocol
 *
 * @example
 * ensureProtocolUrl({ url: 'example.com' }); // 'https://example.com'
 * ensureProtocolUrl({ url: '', allowEmpty: true }); // ''
 * ensureProtocolUrl({ url: '' }); // 'https://'
 */
function ensureProtocolUrl(data: EnsureProtocolData): string {
  if (!data || typeof data !== 'object') {
    return 'https://';
  }

  const input = (data.url ?? '').trim();

  if (!input) {
    return data.allowEmpty ? '' : 'https://';
  }

  return ensureProtocol(input).processed;
}

export default ensureProtocolUrl;
export { ensureProtocolUrl };

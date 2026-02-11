/**
 * Domain Extraction Utility
 *
 * PURPOSE: Normalize a full URL into its apex domain for consistent downstream
 * usage. Useful for analytics, domain allowlists, and UI display where only
 * the domain portion is needed.
 *
 * IMPLEMENTATION FEATURES:
 * - Protocol Normalization: Defaults to HTTPS when scheme is absent
 * - Subdomain Stripping: Removes www. prefix for cleaner domains
 * - Validation: Ensures hostname has at least one dot (public domain format)
 * - Error Resilience: Returns null with error details instead of throwing
 * - Optional Logging: Accepts dependency injection for structured logging
 *
 * @module url/getDomain
 */

import qerrorsMod from '@bijikyu/qerrors';
const qerrors = (qerrorsMod as any).qerr || (qerrorsMod as any).qerrors || qerrorsMod;
import logger from '../../logger.js';
import ensureProtocolUrl from './ensureProtocolUrl.js';

export interface GetDomainData {
  url: string;
}

export interface GetDomainResult {
  domain: string | null;
  error?: string;
}

export interface GetDomainDependencies {
  logError?: (error: unknown, context: string, meta?: Record<string, unknown>) => void;
}

function safeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

const SLD_PATTERNS = new Set([
  'co', 'com', 'org', 'net', 'gov', 'ac', 'edu', 'mil', 'int',
  'info', 'biz', 'name', 'pro', 'museum', 'aero', 'coop', 'jobs'
]);

/**
 * Extract apex domain from hostname, handling ccTLD second-level domains.
 *
 * @param host - Hostname to extract apex from
 * @returns Apex domain string
 *
 * @example
 * apexFrom('www.example.com'); // 'example.com'
 * apexFrom('sub.example.co.uk'); // 'example.co.uk'
 * apexFrom('api.example.com.au'); // 'example.com.au'
 */
function apexFrom(host: string): string {
  const parts = host.split('.').filter(Boolean);
  if (parts.length <= 2) return host;

  const tld = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];

  if (parts.length >= 3 && (tld.length === 2 || SLD_PATTERNS.has(secondLast))) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
}

/**
 * Extract apex domain from a URL with ccTLD support.
 *
 * @param data - Object containing the URL to parse
 * @param deps - Optional dependencies for logging
 * @returns Object with domain or null and optional error message
 *
 * @example
 * getDomain({ url: 'https://www.example.com/path' }); // { domain: 'example.com' }
 * getDomain({ url: 'https://sub.example.co.uk' }); // { domain: 'example.co.uk' }
 * getDomain({ url: 'https://api.example.com.au' }); // { domain: 'example.com.au' }
 * getDomain({ url: '' }); // { domain: null, error: 'Missing URL input' }
 */
export function getDomain(
  data: GetDomainData,
  deps: GetDomainDependencies = {}
): GetDomainResult {
  const result: GetDomainResult = { domain: null };

  try {
    const trimmedUrl = (data.url || '').trim();

    if (!trimmedUrl) {
      result.error = 'Missing URL input';
      deps.logError?.(new Error(result.error), 'getDomain:normalize_failed', { url: data.url });
      logger.debug('getDomain: missing URL input');
      return result;
    }

    const normalizedUrl = ensureProtocolUrl({ url: trimmedUrl });
    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (!hostname || !hostname.includes('.')) {
      result.error = 'Hostname lacks a valid domain segment';
      deps.logError?.(
        new Error(result.error),
        'getDomain:invalid_hostname',
        { url: data.url, normalizedUrl }
      );
      logger.debug('getDomain: invalid hostname', { hostname });
      return result;
    }

    result.domain = apexFrom(hostname);
    logger.debug('getDomain: extracted domain successfully', { domain: hostname });
  } catch (error) {
    const message = safeErrorMessage(error, 'Unknown URL parsing error');
    result.error = message;
    deps.logError?.(error, 'getDomain:failed', { url: data.url });
    qerrors(error instanceof Error ? error : new Error(message), 'getDomain');
    logger.error('getDomain: parsing failed', { error: message });
  }

  return result;
}

export default getDomain;

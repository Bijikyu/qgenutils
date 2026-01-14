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

import { qerrors } from 'qerrors';
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

/**
 * Extract apex domain from a URL.
 *
 * @param data - Object containing the URL to parse
 * @param deps - Optional dependencies for logging
 * @returns Object with domain or null and optional error message
 *
 * @example
 * getDomain({ url: 'https://www.example.com/path' }); // { domain: 'example.com' }
 * getDomain({ url: 'api.subdomain.example.com' }); // { domain: 'api.subdomain.example.com' }
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

    result.domain = hostname;
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

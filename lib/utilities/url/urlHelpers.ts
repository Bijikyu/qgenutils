/**
 * URL Helper Utilities
 *
 * PURPOSE: Additional URL manipulation utilities for common tasks like
 * tracking parameter removal, URL extraction from text, and security checks.
 */

import qerrorsMod from '@bijikyu/qerrors';
const qerrors = (qerrorsMod as any).qerr || (qerrorsMod as any).qerrors || qerrorsMod;
import logger from '../../logger.js';
import isValidString from '../helpers/isValidString.js';
import ensureProtocol from './ensureProtocol.js';

/**
 * Common tracking parameters to remove for cleaner URLs
 */
export const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'msclkid', 'igshid', 'si', 'ref', 'mc_cid', 'mc_eid',
  '_ga', '_gl', 'yclid', 'dclid', 'zanpid', 'irclickid'
];

/**
 * Removes common tracking parameters from a URL
 *
 * @param url - URL to sanitize
 * @param customParams - Additional parameter names to remove
 * @returns Clean URL without tracking parameters
 */
export function removeTrackingParams(url: string, customParams: string[] = []): string {
  logger.debug('removeTrackingParams: processing URL', { url });

  if (!isValidString(url)) {
    return '';
  }

  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const paramsToRemove = [...TRACKING_PARAMS, ...customParams];

    paramsToRemove.forEach(param => params.delete(param));

    urlObj.search = params.toString();
    const cleanUrl = urlObj.toString();

    logger.debug('removeTrackingParams: cleaned URL', { original: url, cleaned: cleanUrl });
    return cleanUrl;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'removeTrackingParams');
    logger.warn('removeTrackingParams: failed to parse URL', { url, error });
    return url;
  }
}

/**
 * Extracts URLs from text content
 *
 * @param content - Text content to search for URLs
 * @param options - Extraction options
 * @returns Array of extracted URLs
 */
export function extractUrlsFromContent(
  content: string,
  options: {
    deduplicate?: boolean;
    ensureProtocols?: boolean;
    maxUrls?: number;
  } = {}
): string[] {
  const { deduplicate = true, ensureProtocols = true, maxUrls = 100 } = options;

  logger.debug('extractUrlsFromContent: starting extraction');

  if (!isValidString(content)) {
    return [];
  }

  try {
    const urlRegex = /(https?:\/\/[^\s<>'"\\)\]]+)/gi;
    const matches = content.match(urlRegex) || [];

    let urls = matches.map(url => url.trim());

    if (ensureProtocols) {
      urls = urls.map(url => {
        const result = ensureProtocol(url);
        return result.processed;
      });
    }

    if (deduplicate) {
      urls = [...new Set(urls)];
    }

    const result = urls.slice(0, maxUrls);
    logger.debug('extractUrlsFromContent: extracted URLs', { count: result.length });
    return result;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'extractUrlsFromContent');
    logger.error('extractUrlsFromContent: extraction failed', { error });
    return [];
  }
}

/**
 * Checks if a URL uses HTTPS protocol
 *
 * @param url - URL to check
 * @returns True if URL uses HTTPS
 */
export function isSecureUrl(url: string): boolean {
  if (!isValidString(url)) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is valid and parseable
 *
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!isValidString(url)) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets URL metadata for display purposes
 *
 * @param url - URL to analyze
 * @returns Object with URL metadata
 */
export function getUrlMetadata(url: string): {
  isValid: boolean;
  domain: string;
  protocol: string;
  path: string;
  isSecure: boolean;
  hasQueryParams: boolean;
} {
  const defaultResult = {
    isValid: false,
    domain: '',
    protocol: '',
    path: '',
    isSecure: false,
    hasQueryParams: false
  };

  if (!isValidString(url)) {
    return defaultResult;
  }

  try {
    const urlObj = new URL(url);
    return {
      isValid: true,
      domain: urlObj.hostname,
      protocol: urlObj.protocol.replace(':', ''),
      path: urlObj.pathname,
      isSecure: urlObj.protocol === 'https:',
      hasQueryParams: urlObj.search.length > 0
    };
  } catch {
    return defaultResult;
  }
}

/**
 * Joins URL path segments safely
 *
 * @param base - Base URL
 * @param paths - Path segments to join
 * @returns Joined URL
 */
export function joinUrlPaths(base: string, ...paths: string[]): string {
  if (!isValidString(base)) {
    return '';
  }

  try {
    let result = base.replace(/\/+$/, '');

    for (const path of paths) {
      if (isValidString(path)) {
        const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
        if (cleanPath) {
          result += '/' + cleanPath;
        }
      }
    }

    return result;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'joinUrlPaths');
    return base;
  }
}

export default {
  removeTrackingParams,
  extractUrlsFromContent,
  isSecureUrl,
  isValidUrl,
  getUrlMetadata,
  joinUrlPaths,
  TRACKING_PARAMS
};

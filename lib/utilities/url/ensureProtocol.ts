import { qerrors } from 'qerrors';
import logger from '../../logger.js';
import isValidString from '../helpers/isValidString.js';

type ProtocolResult = {
  original: string;
  processed: string;
  added: boolean;
  error?: string;
};

const normalizePreservingNoTrailingSlash = (input: string, parsed: URL): string => {
  const hasSearchOrHash = !!(parsed.search || parsed.hash);
  const hasNonRootPath = parsed.pathname && parsed.pathname !== '/';
  const inputHasTrailingSlash = input.endsWith('/');

  if (!hasNonRootPath && !hasSearchOrHash && !inputHasTrailingSlash) {
    return parsed.origin;
  }

  return parsed.toString();
};

const normalizeProtocol = (protocol: any, fallback: string): string => {
  if (typeof protocol !== 'string') return fallback;
  let normalized = protocol.trim().toLowerCase();
  if (!normalized) return fallback;
  if (normalized.endsWith('://')) normalized = normalized.slice(0, -3);
  if (normalized.endsWith(':')) normalized = normalized.slice(0, -1);
  if (!/^[a-z][a-z0-9+.-]*$/.test(normalized)) return fallback;
  return normalized;
};

const ensureProtocol = (url: any, protocol: string = 'https'): ProtocolResult => {
  const normalizedProtocol = normalizeProtocol(protocol, 'https');
  const fallbackPrefix = `${normalizedProtocol}://`;

  if (!isValidString(url)) {
    return { original: '', processed: fallbackPrefix, added: true, error: 'Invalid URL' };
  }

  const trimmedUrl = url.trim();
  if (trimmedUrl === '') {
    return { original: '', processed: fallbackPrefix, added: true, error: 'Empty URL' };
  }

  if (trimmedUrl.startsWith('//')) {
    return { original: trimmedUrl, processed: `${normalizedProtocol}:${trimmedUrl}`, added: true };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const allowedProtocols = new Set(['http:', 'https:', 'ftp:', 'ftps:']);

    if (allowedProtocols.has(parsedUrl.protocol)) {
      const processed = normalizePreservingNoTrailingSlash(trimmedUrl, parsedUrl);
      return { original: trimmedUrl, processed, added: false };
    }

    return {
      original: trimmedUrl,
      processed: fallbackPrefix,
      added: true,
      error: `Unsupported protocol: ${parsedUrl.protocol}`
    };
  } catch (err) {
    if (trimmedUrl.includes('://')) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      qerrors(errorObj, 'ensureProtocol');
      logger.warn('ensureProtocol: invalid URL with protocol', { url: trimmedUrl, error: errorObj.message });
      return { original: trimmedUrl, processed: fallbackPrefix, added: true, error: 'Invalid URL' };
    }

    return { original: trimmedUrl, processed: `${fallbackPrefix}${trimmedUrl}`, added: true };
  }
};

export default ensureProtocol;

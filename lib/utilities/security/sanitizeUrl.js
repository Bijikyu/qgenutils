'use strict';

const SENSITIVE_PARAMS = [ // query params to remove
  'token', 'key', 'secret', 'password', 'auth',
  'apikey', 'api_key', 'access_token', 'refresh_token',
  'bearer', 'credentials', 'session', 'jwt'
];

/**
 * Sanitizes a URL by removing sensitive query parameters
 * @param {string} url - The URL to sanitize
 * @param {Object} [options] - Configuration options
 * @param {string[]} [options.additionalParams] - Additional params to remove
 * @returns {string} Sanitized URL
 * @example
 * sanitizeUrl('/api/users?token=abc123&page=1');
 * // Returns: '/api/users?page=1'
 */
function sanitizeUrl(url, options = {}) { // remove sensitive URL params
  if (!url || typeof url !== 'string') {
    return '';
  }

  const additionalParams = options.additionalParams || [];
  const allSensitiveParams = [...SENSITIVE_PARAMS, ...additionalParams];

  try {
    const urlObj = new URL(url, 'http://localhost'); // parse URL

    allSensitiveParams.forEach(param => { // remove sensitive params
      urlObj.searchParams.delete(param);
    });

    return urlObj.pathname + (urlObj.search || '');
  } catch {
    return url.split('?')[0]; // fallback: return path only
  }
}

sanitizeUrl.SENSITIVE_PARAMS = SENSITIVE_PARAMS; // expose for extension

module.exports = sanitizeUrl;

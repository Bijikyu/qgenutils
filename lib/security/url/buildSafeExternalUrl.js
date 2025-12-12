/**
 * Builds a safe external URL with validation and path normalization.
 *
 * PURPOSE: Combines URL validation with path construction, preventing
 * directory traversal attacks and ensuring the resulting URL is safe.
 *
 * @param {string} baseUrl - The base URL (validated if allowedDomains provided)
 * @param {string} [path] - Path to append (optional)
 * @param {string} [allowedDomains] - Comma-separated list of allowed domains
 * @returns {string} Validated full URL
 * @throws {Error} If base URL is not allowed
 */
const validateExternalUrl = require('./validateExternalUrl');

function buildSafeExternalUrl(baseUrl, path, allowedDomains) {
  if (allowedDomains) {
    validateExternalUrl(baseUrl, allowedDomains);
  }
  
  const url = new URL(baseUrl);
  
  if (path) {
    const cleanPath = path
      .replace(/\.\./g, '')
      .replace(/\/+/g, '/');
    
    url.pathname = url.pathname.replace(/\/$/, '') + '/' + cleanPath.replace(/^\//, '');
  }
  
  return url.toString();
}

module.exports = buildSafeExternalUrl;

/**
 * Validates that a URL belongs to an allowed domain.
 *
 * PURPOSE: Provides critical protection against Server-Side Request Forgery
 * (SSRF) attacks by ensuring only approved domains can be accessed. Essential
 * for any application that makes external HTTP requests based on user input.
 *
 * FEATURES:
 * - Exact domain matching
 * - Wildcard subdomain support (*.example.com)
 * - Comma-separated allowlist
 *
 * @param {string} url - The URL to validate
 * @param {string} allowedDomains - Comma-separated list of allowed domains
 * @returns {boolean} True if the URL domain is allowed, false otherwise
 * @throws {Error} If URL is malformed
 */
function isAllowedExternalUrl(url, allowedDomains) {
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }
  
  const domains = allowedDomains.split(',').map(domain => domain.trim());
  
  return domains.some(allowedDomain => {
    if (urlObj.hostname === allowedDomain) {
      return true;
    }
    
    if (allowedDomain.startsWith('*.')) {
      const baseDomain = allowedDomain.slice(2);
      return urlObj.hostname === baseDomain || 
             urlObj.hostname.endsWith('.' + baseDomain);
    }
    
    return false;
  });
}

module.exports = isAllowedExternalUrl;

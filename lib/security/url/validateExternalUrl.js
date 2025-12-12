/**
 * Validates and throws an error for disallowed URLs.
 *
 * PURPOSE: Throwing version of isAllowedExternalUrl for fail-fast validation.
 * Use when an invalid URL should halt execution immediately.
 *
 * @param {string} url - The URL to validate
 * @param {string} allowedDomains - Comma-separated list of allowed domains
 * @throws {Error} If URL is not allowed or is malformed
 */
const isAllowedExternalUrl = require('./isAllowedExternalUrl');

function validateExternalUrl(url, allowedDomains) {
  if (!isAllowedExternalUrl(url, allowedDomains)) {
    const hostname = new URL(url).hostname;
    throw new Error(`URL domain not allowed: ${hostname}`);
  }
}

module.exports = validateExternalUrl;

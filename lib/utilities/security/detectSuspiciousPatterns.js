'use strict';

const SECURITY_CONFIG = require('./securityConfig');

/**
 * Detects suspicious patterns in HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} [config] - Optional config overrides
 * @returns {string[]} Array of detected suspicious pattern names
 * @example
 * const patterns = detectSuspiciousPatterns(req);
 * if (patterns.length > 0) console.warn('Suspicious:', patterns);
 */
function detectSuspiciousPatterns(req, config = {}) { // detect attack patterns in request
  const maxRequestSize = config.maxRequestSize || SECURITY_CONFIG.MAX_REQUEST_SIZE;
  const maxUrlLength = config.maxUrlLength || SECURITY_CONFIG.MAX_URL_LENGTH;
  const patterns = [];

  const contentLength = parseInt(req.headers?.['content-length'] || '0', 10); // check content length
  if (contentLength > maxRequestSize) {
    patterns.push('oversized_request');
  }

  const url = req.url || ''; // check URL length
  if (url.length > maxUrlLength) {
    patterns.push('long_url');
  }

  if (/\.\./.test(url)) { // path traversal attempt
    patterns.push('path_traversal');
  }

  const urlLower = url.toLowerCase(); // XSS patterns
  if (/<script/i.test(url) || 
      urlLower.includes('javascript:') || 
      urlLower.includes('data:text/html') || 
      urlLower.includes('vbscript:')) {
    patterns.push('potential_xss');
  }

  if (/union\s+select/i.test(url) || // SQL injection patterns
      /;\s*drop\s+table/i.test(url) ||
      /'\s*or\s+'1'\s*=\s*'1/i.test(url)) {
    patterns.push('potential_sql_injection');
  }

  return patterns; // return detected patterns
}

module.exports = detectSuspiciousPatterns;

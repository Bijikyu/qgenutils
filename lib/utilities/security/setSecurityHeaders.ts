'use strict';

/**
 * Creates middleware that sets security headers on responses
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.contentSecurityPolicy] - Enable CSP header
 * @param {boolean} [options.xssProtection] - Enable X-XSS-Protection
 * @param {boolean} [options.noSniff] - Enable X-Content-Type-Options
 * @param {boolean} [options.frameOptions] - Enable X-Frame-Options
 * @param {boolean} [options.hsts] - Enable Strict-Transport-Security
 * @param {string} [options.referrerPolicy] - Referrer-Policy value
 * @returns {Function} Express middleware function
 * @example
 * app.use(setSecurityHeaders({ hsts: true }));
 */
interface SecurityHeadersOptions {
  contentSecurityPolicy?: boolean;
  xssProtection?: boolean;
  noSniff?: boolean;
  frameOptions?: boolean;
  hsts?: boolean;
  referrerPolicy?: string;
}

function setSecurityHeaders(options: SecurityHeadersOptions = {}) { // factory for security headers middleware
  const {
    contentSecurityPolicy = true,
    xssProtection = true,
    noSniff = true,
    frameOptions = true,
    hsts = false,
    referrerPolicy = 'strict-origin-when-cross-origin'
  } = options;

  return function securityHeadersMiddleware(req, res, next) { // set security headers
    if (xssProtection) { // legacy XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    if (noSniff) { // prevent MIME sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    if (frameOptions) { // prevent clickjacking
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    }

    if (hsts) { // HTTPS enforcement
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    if (referrerPolicy) { // referrer policy
      res.setHeader('Referrer-Policy', referrerPolicy);
    }

    if (contentSecurityPolicy) { // CSP header
      res.setHeader('Content-Security-Policy',
        'default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; font-src \'self\'');
    }

    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none'); // Adobe cross-domain
    res.setHeader('X-Download-Options', 'noopen'); // IE download protection

    next(); // continue to next middleware
  };
}

export default setSecurityHeaders;

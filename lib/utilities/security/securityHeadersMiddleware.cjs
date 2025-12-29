/**
 * Security Headers Middleware - CommonJS Version
 * 
 * PURPOSE: Provides comprehensive HTTP security headers to protect against
 * common web vulnerabilities. This middleware should be applied to all
 * HTTP responses to ensure robust security posture.
 */

/**
 * Default security configuration
 */
const defaultConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableCORP: true,
  environment: 'production'
};

/**
 * Content Security Policy directives by environment
 */
const getCSPDirectives = (environment) => {
  const baseDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for demo compatibility
    "style-src 'self' 'unsafe-inline'", // Allow inline styles for demo compatibility
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' http: https:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];

  if (environment === 'development') {
    baseDirectives.push(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*",
      "connect-src 'self' http://localhost:* ws://localhost:*"
    );
  }

  return baseDirectives.join('; ');
};

/**
 * Creates security headers middleware
 * 
 * @param {Object} config - Security configuration options
 * @returns {Function} Express middleware function
 */
const createSecurityHeaders = (config = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const { environment = 'production', enableCSP, enableHSTS, enableCORP, customCSP } = finalConfig;

  return (req, res, next) => {
    try {
      // Content Security Policy
      if (enableCSP) {
        const cspValue = customCSP || getCSPDirectives(environment);
        res.setHeader('Content-Security-Policy', cspValue);
      }

      // X-Frame-Options - Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // X-Content-Type-Options - Prevent MIME-type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // X-XSS-Protection - Enable XSS filtering (legacy browsers)
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Referrer-Policy - Control referrer leakage
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions-Policy - Control browser feature access
      const permissionsPolicy = [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
        'autoplay=()',
        'encrypted-media=()',
        'fullscreen=(self)',
        'picture-in-picture=(self)'
      ].join(', ');
      res.setHeader('Permissions-Policy', permissionsPolicy);

      // Strict-Transport-Security - HTTPS enforcement (production only)
      if (enableHSTS && environment === 'production' && req.secure) {
        const hstsValue = 'max-age=31536000; includeSubDomains; preload';
        res.setHeader('Strict-Transport-Security', hstsValue);
      }

      // Cross-Origin Policies (if enabled)
      if (enableCORP) {
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
      }

      // Additional security headers
      res.setHeader('X-DNS-Prefetch-Control', 'off');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      res.setHeader('X-Powered-By', ''); // Remove server fingerprinting
      
      // Cache control for API responses
      if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

    } catch (error) {
      console.warn('Security headers middleware error:', error);
      // Continue without failing the request
    }

    next();
  };
};

/**
 * Pre-configured security middleware for different environments
 */
const securityHeaders = {
  /** Production security middleware */
  production: createSecurityHeaders({ environment: 'production' }),
  
  /** Development security middleware */
  development: createSecurityHeaders({ 
    environment: 'development',
    enableHSTS: false // Disable HSTS in development
  }),
  
  /** Test security middleware */
  test: createSecurityHeaders({ 
    environment: 'test',
    enableHSTS: false,
    enableCORP: false // More permissive for testing
  })
};

/**
 * Default middleware that detects environment automatically
 */
const securityMiddleware = createSecurityHeaders({
  environment: process.env.NODE_ENV || 'production'
});

module.exports = {
  createSecurityHeaders,
  securityHeaders,
  securityMiddleware
};
/**
 * Security Headers Middleware Factory
 * 
 * Creates Express-compatible middleware for comprehensive security headers
 * using the helmet npm module which provides 15+ security middleware
 * functions with sensible defaults and extensive customization.
 * 
 * @param {object} [config] - Helmet configuration options
 * @param {boolean} [config.contentSecurityPolicy=true] - Enable CSP
 * @param {boolean} [config.crossOriginEmbedderPolicy=true] - Enable COEP
 * @param {boolean} [config.crossOriginOpenerPolicy=true] - Enable COOP
 * @param {boolean} [config.crossOriginResourcePolicy=true] - Enable CORP
 * @param {boolean} [config.dnsPrefetchControl=true] - Control DNS prefetching
 * @param {boolean} [config.frameguard=true] - Prevent clickjacking
 * @param {boolean} [config.hidePoweredBy=true] - Remove X-Powered-By header
 * @param {boolean} [config.hsts=true] - HTTP Strict Transport Security
 * @param {boolean} [config.ieNoOpen=true] - Prevent IE from executing downloads
 * @param {boolean} [config.noSniff=true] - Prevent MIME-type sniffing
 * @param {boolean} [config.originAgentCluster=true] - Restrict origin isolation
 * @param {boolean} [config.permittedCrossDomainPolicies=true] - Restrict cross-domain policies
 * @param {boolean} [config.referrerPolicy=true] - Control referrer information
 * @param {boolean} [config.xssFilter=true] - Enable XSS filter (deprecated but kept for compatibility)
 * @returns {Function} Express middleware function
 */
const helmet = require('helmet');

function createSecurityHeaders(config = {}) {
  // Default configuration with qgenutils security-first approach
  const defaultConfig = {
    // Content Security Policy - Prevent XSS and data injection
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for compatibility
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'"],
        childSrc: ["'none'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: []
      }
    },
    
    // Cross-Origin Embedder Policy - Control cross-origin embeds
    crossOriginEmbedderPolicy: true,
    
    // Cross-Origin Opener Policy - Control cross-origin window access
    crossOriginOpenerPolicy: true,
    
    // Cross-Origin Resource Policy - Control cross-origin resource sharing
    crossOriginResourcePolicy: { policy: "same-site" },
    
    // DNS Prefetch Control - Control browser DNS prefetching
    dnsPrefetchControl: true,
    
    // Frameguard - Prevent clickjacking
    frameguard: { action: 'deny' },
    
    // Hide Powered By - Remove Express signature
    hidePoweredBy: true,
    
    // HSTS - Force HTTPS connections
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    // IE No Open - Prevent IE from executing downloads in context of site
    ieNoOpen: true,
    
    // No Sniff - Prevent MIME-type sniffing
    noSniff: true,
    
    // Origin Agent Cluster - Restrict origin isolation
    originAgentCluster: true,
    
    // Permitted Cross Domain Policies - Restrict Adobe Flash cross-domain policies
    permittedCrossDomainPolicies: false,
    
    // Referrer Policy - Control referrer information leakage
    referrerPolicy: { policy: "no-referrer" },
    
    // XSS Filter - Enable XSS filter (deprecated but kept for legacy browser support)
    xssFilter: true
  };

  // Merge user configuration with defaults
  const finalConfig = { ...defaultConfig, ...config };

  // Return helmet middleware
  return helmet(finalConfig);
}

// Export individual helmet middlewares for fine-grained control
createSecurityHeaders.contentSecurityPolicy = helmet.contentSecurityPolicy;
createSecurityHeaders.crossOriginEmbedderPolicy = helmet.crossOriginEmbedderPolicy;
createSecurityHeaders.crossOriginOpenerPolicy = helmet.crossOriginOpenerPolicy;
createSecurityHeaders.crossOriginResourcePolicy = helmet.crossOriginResourcePolicy;
createSecurityHeaders.dnsPrefetchControl = helmet.dnsPrefetchControl;
createSecurityHeaders.frameguard = helmet.frameguard;
createSecurityHeaders.hidePoweredBy = helmet.hidePoweredBy;
createSecurityHeaders.hsts = helmet.hsts;
createSecurityHeaders.ieNoOpen = helmet.ieNoOpen;
createSecurityHeaders.noSniff = helmet.noSniff;
createSecurityHeaders.originAgentCluster = helmet.originAgentCluster;
createSecurityHeaders.permittedCrossDomainPolicies = helmet.permittedCrossDomainPolicies;
createSecurityHeaders.referrerPolicy = helmet.referrerPolicy;
createSecurityHeaders.xssFilter = helmet.xssFilter;

module.exports = createSecurityHeaders;
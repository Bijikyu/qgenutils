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
import helmet from 'helmet';

const helmetAny: any = helmet as any;

function createSecurityHeaders(config: any = {}) {
  // Default configuration with qgenutils security-first approach
  const defaultConfig = {
    // Content Security Policy - Prevent XSS and data injection
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''], // Allow inline styles for compatibility
        scriptSrc: ['\'self\''],
        imgSrc: ['\'self\'', 'data:', 'https:'],
        connectSrc: ['\'self\''],
        fontSrc: ['\'self\''],
        objectSrc: ['\'none\''],
        mediaSrc: ['\'self\''],
        frameSrc: ['\'none\''],
        workerSrc: ['\'self\''],
        childSrc: ['\'none\''],
        formAction: ['\'self\''],
        frameAncestors: ['\'none\''],
        baseUri: ['\'self\''],
        manifestSrc: ['\'self\''],
        upgradeInsecureRequests: []
      }
    },

    // Cross-Origin Embedder Policy - Control cross-origin embeds
    crossOriginEmbedderPolicy: true,

    // Cross-Origin Opener Policy - Control cross-origin window access
    crossOriginOpenerPolicy: true,

    // Cross-Origin Resource Policy - Control cross-origin resource sharing
    crossOriginResourcePolicy: { policy: 'same-site' },

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
    referrerPolicy: { policy: 'no-referrer' },

    // XSS Filter - Enable XSS filter (deprecated but kept for legacy browser support)
    xssFilter: true
  };

  // Merge user configuration with defaults
  const finalConfig: any = { ...defaultConfig, ...config };

  // Return helmet middleware
  return helmetAny(finalConfig);
}

// Export individual helmet middlewares for fine-grained control
(createSecurityHeaders as any).contentSecurityPolicy = helmetAny.contentSecurityPolicy;
(createSecurityHeaders as any).crossOriginEmbedderPolicy = helmetAny.crossOriginEmbedderPolicy;
(createSecurityHeaders as any).crossOriginOpenerPolicy = helmetAny.crossOriginOpenerPolicy;
(createSecurityHeaders as any).crossOriginResourcePolicy = helmetAny.crossOriginResourcePolicy;
(createSecurityHeaders as any).dnsPrefetchControl = helmetAny.dnsPrefetchControl;
(createSecurityHeaders as any).frameguard = helmetAny.frameguard;
(createSecurityHeaders as any).hidePoweredBy = helmetAny.hidePoweredBy;
(createSecurityHeaders as any).hsts = helmetAny.hsts;
(createSecurityHeaders as any).ieNoOpen = helmetAny.ieNoOpen;
(createSecurityHeaders as any).noSniff = helmetAny.noSniff;
(createSecurityHeaders as any).originAgentCluster = helmetAny.originAgentCluster;
(createSecurityHeaders as any).permittedCrossDomainPolicies = helmetAny.permittedCrossDomainPolicies;
(createSecurityHeaders as any).referrerPolicy = helmetAny.referrerPolicy;
(createSecurityHeaders as any).xssFilter = helmetAny.xssFilter;

export default createSecurityHeaders;

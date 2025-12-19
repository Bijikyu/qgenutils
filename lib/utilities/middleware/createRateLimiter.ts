/**
 * Rate Limiter Middleware Factory
 * 
 * Creates Express-compatible middleware for rate limiting requests using
 * the express-rate-limit npm module which provides robust, battle-tested
 * rate limiting with multiple store options and comprehensive features.
 * 
 * @param {object} config - Rate limiter configuration
 * @param {number} [config.windowMs=60000] - Window duration in ms (express-rate-limit naming)
 * @param {number} [config.max=100] - Max requests per window (express-rate-limit naming)
 * @param {string} [config.message='Too many requests'] - Custom error message
 * @param {boolean} [config.standardHeaders=true] - Return rate limit info in RateLimit headers
 * @param {boolean} [config.legacyHeaders=false] - Return rate limit info in X-RateLimit headers
 * @param {Function} [config.keyGenerator] - Custom key generator function
 * @param {Function} [config.skip] - Function to skip rate limiting for certain requests
 * @param {Function} [config.onLimitReached] - Called when limit is exceeded
 * @param {object} [config.handler] - Custom handler for rate limit exceeded
 * @param {object} [config.store] - Custom store (MemoryStore, Redis, etc.)
 * @returns {Function} Express middleware function
 */
const rateLimit: any = require('express-rate-limit');
const buildRateLimitKey: any = require('../security/buildRateLimitKey'); // rationale: keep existing key building for compatibility

function createRateLimiter(config = {}) {
  const {
    windowMs = 60000,        // express-rate-limit naming
    max = 100,                // express-rate-limit naming  
    message = 'Too many requests',
    standardHeaders = true,   // Use RateLimit-* headers (modern standard)
    legacyHeaders = false,    // Don't use X-RateLimit-* headers (legacy)
    keyGenerator = null,
    skip = null,
    onLimitReached = null,
    handler = null,
    store = null,
    // Legacy options for backward compatibility
    points = null,
    durationMs = null,
    strategy = 'ip',
    prefix = 'rl'
  } = config;

  // Handle legacy option names for backward compatibility
  const finalWindowMs: any = windowMs || durationMs || 60000;
  const finalMax: any = max || points || 100;
  
  // Validate configuration
  if (typeof finalWindowMs !== 'number' || finalWindowMs <= 0) {
    throw new Error('Rate limiter windowMs must be a positive number');
  }
  if (typeof finalMax !== 'number' || finalMax <= 0) {
    throw new Error('Rate limiter max must be a positive number');
  }

  // Build express-rate-limit configuration
  const rateLimitConfig = {
    windowMs: finalWindowMs,
    max: finalMax,
    message: typeof message === 'string' ? message : 'Rate limit exceeded. Please try again later.',
    standardHeaders,
    legacyHeaders,
    store
  };

  // Add custom key generator if provided
  if (keyGenerator) {
    rateLimitConfig.keyGenerator = keyGenerator;
  } else if (strategy && strategy !== 'ip') {
    // Use existing key building logic for backward compatibility
    rateLimitConfig.keyGenerator = (req) => buildRateLimitKey(req, { strategy, prefix });
  }

  // Add skip function if provided
  if (skip && typeof skip === 'function') {
    rateLimitConfig.skip = skip;
  }

  // Add limit reached handler if provided
  if (onLimitReached && typeof onLimitReached === 'function') {
    rateLimitConfig.onLimitReached = onLimitReached;
  }

  // Add custom handler if provided
  if (handler && typeof handler === 'function') {
    rateLimitConfig.handler = handler;
  }

  // Create and return the rate limit middleware
  return rateLimit(rateLimitConfig);
}

// For backward compatibility and testing
createRateLimiter.resetDefaultStore = function() {
  // express-rate-limit doesn't have a reset function, but we keep this for API compatibility
  console.warn('createRateLimiter.resetDefaultStore is deprecated with express-rate-limit');
};

export default createRateLimiter;

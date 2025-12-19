'use strict';

const SECURITY_CONFIG: any = require('./securityConfig');

/**
 * Creates a security-focused rate limiter middleware for Express
 * Limits requests per IP with automatic blocking when exceeded
 * @param {Object} [options] - Configuration options
 * @param {number} [options.windowMs] - Time window in milliseconds
 * @param {number} [options.maxRequests] - Max requests per window
 * @param {number} [options.blockDurationMs] - Block duration when exceeded
 * @param {Function} [options.keyGenerator] - Custom key generator function
 * @param {Function} [options.onLimitExceeded] - Callback when limit exceeded
 * @returns {Function} Express middleware function
 * @example
 * app.use(createSecurityRateLimiter({ windowMs: 60000, maxRequests: 30 }));
 */
function createSecurityRateLimiter(options = {}) { // factory for security rate limiter
  const windowMs: any = options.windowMs || SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS;
  const maxRequests: any = options.maxRequests || SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS;
  const blockDurationMs: any = options.blockDurationMs || SECURITY_CONFIG.BLOCK_DURATION_MS;
  const keyGenerator: any = options.keyGenerator || defaultKeyGenerator;
  const onLimitExceeded: any = options.onLimitExceeded || null;

  const requestCounts: any = new Map(); // key -> { count, windowStart }
  const blockedKeys: any = new Map(); // key -> blockUntil timestamp

  function defaultKeyGenerator(req) { // default: use client IP
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  function cleanup() { // cleanup expired entries
    const now: any = Date.now();

    requestCounts.forEach((data, key: any): any => {
      if (now - data.windowStart > windowMs) {
        requestCounts.delete(key);
      }
    });

    blockedKeys.forEach((blockUntil, key: any): any => {
      if (now >= blockUntil) {
        blockedKeys.delete(key);
      }
    });
  }

  return function rateLimiterMiddleware(req, res, next) { // rate limiter middleware
    const now: any = Date.now();
    const key: any = keyGenerator(req);

    if (Math.random() < 0.01) cleanup(); // probabilistic cleanup

    const blockUntil: any = blockedKeys.get(key); // check if blocked
    if (blockUntil && now < blockUntil) {
      const retryAfter: any = Math.ceil((blockUntil - now) / 1000);

      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(blockUntil).toISOString());

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter
      });
      return;
    }

    let data = requestCounts.get(key); // get or create request data

    if (!data || now - data.windowStart > windowMs) { // new window
      data = { count: 0, windowStart: now };
      requestCounts.set(key, data);
    }

    data.count++; // increment request count

    const remaining: any = Math.max(0, maxRequests - data.count);
    const resetTime: any = new Date(data.windowStart + windowMs);

    res.setHeader('X-RateLimit-Limit', maxRequests.toString()); // set rate limit headers
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toISOString());

    if (data.count > maxRequests) { // limit exceeded
      const blockUntilTime: any = now + blockDurationMs;
      blockedKeys.set(key, blockUntilTime);

      if (onLimitExceeded) {
        onLimitExceeded(req, key, data.count);
      }

      const retryAfter: any = Math.ceil(blockDurationMs / 1000);

      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Remaining', '0');

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter
      });
      return;
    }

    next(); // continue to next middleware
  };
}

export default createSecurityRateLimiter;

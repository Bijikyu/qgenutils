import SECURITY_CONFIG from './securityConfig.js';
import { BoundedLRUCache } from '../performance/boundedCache.js';

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
function createSecurityRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  blockDurationMs?: number;
  maxRequestSize?: number;
  maxUrlLength?: number;
  keyGenerator?: Function;
  onLimitExceeded?: Function;
} = {}) { // factory for security rate limiter
  // Validate input parameters to prevent memory exhaustion
  const maxRequestSize: number = options.maxRequestSize || 1024 * 1024; // 1MB default
  const maxUrlLength: number = options.maxUrlLength || 2048; // 2KB default
  
  if (maxRequestSize > 100 * 1024 * 1024) { // 100MB max
    throw new Error('maxRequestSize too large (max 100MB)');
  }
  if (maxUrlLength > 65536) { // 64KB max
    throw new Error('maxUrlLength too large (max 64KB)');
  }

  const windowMs: number = options.windowMs || SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS;
  const maxRequests: number = options.maxRequests || SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS;
  const blockDurationMs: number = options.blockDurationMs || SECURITY_CONFIG.BLOCK_DURATION_MS;
  const keyGenerator: Function = options.keyGenerator || defaultKeyGenerator;
  const onLimitExceeded: Function | null = options.onLimitExceeded || null;

  // Use bounded caches to prevent memory leaks
  const requestCounts = new BoundedLRUCache<string, { count: number; windowStart: number }>(
    10000, // Maximum 10K IPs tracked
    60000  // 1 minute TTL
  );
  const blockedKeys = new BoundedLRUCache<string, number>(
    5000,  // Maximum 5K blocked IPs
    300000 // 5 minute TTL for blocks
  );

  function defaultKeyGenerator(req: any) { // default: use client IP
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  function cleanup() { // cleanup expired entries with memory leak prevention
    // BoundedLRUCache handles automatic cleanup via TTL
    // No manual cleanup needed - the cache handles eviction automatically
    return 0;
  }

  return function rateLimiterMiddleware(req: any, res: any, next: any) { // rate limiter middleware
    const now: any = Date.now();
    const key: any = keyGenerator(req);

    // Enhanced cleanup strategy to prevent memory leaks
    if (Math.random() < 0.05 || requestCounts.size > 1000 || blockedKeys.size > 500) {
      cleanup();
    }

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
      requestCounts.set(key, data, windowMs); // Set with TTL
    } else {
      // Update existing entry
      requestCounts.set(key, data, windowMs);
    }

    data.count++; // increment request count

    const remaining: any = Math.max(0, maxRequests - data.count);
    const resetTime: any = new Date(data.windowStart + windowMs);

    res.setHeader('X-RateLimit-Limit', maxRequests.toString()); // set rate limit headers
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toISOString());

    if (data.count > maxRequests) { // limit exceeded
      const blockUntilTime: any = now + blockDurationMs;
      blockedKeys.set(key, blockUntilTime, blockDurationMs); // Set with TTL

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

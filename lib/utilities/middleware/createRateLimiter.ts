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
import rateLimit from 'express-rate-limit';
import buildRateLimitKey from '../security/buildRateLimitKey.js'; // rationale: keep existing key building for compatibility

interface RateLimiterConfig {
  windowMs?: number;
  max?: number;
  maxRequests?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  keyGenerator?: (req: any) => string;
  skip?: (req: any) => boolean;
  onLimitReached?: (req: any, res: any) => void;
  handler?: (req: any, res: any) => void;
  store?: any;
  points?: number;
  durationMs?: number;
  strategy?: 'ip' | 'user' | 'apiKey' | 'custom';
  prefix?: string;
}

interface ExpressRateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  keyGenerator?: ((req: any) => string) | null;
  skip?: ((req: any) => boolean) | null;
  onLimitReached?: ((req: any, res: any) => void) | null;
  handler?: ((req: any, res: any) => void) | null;
  store?: any;
  points?: number | null;
  durationMs?: number | null;
  strategy?: 'ip' | 'user' | 'apiKey' | 'custom';
  prefix?: string;
}

function createRateLimiter(config: RateLimiterConfig = {}) {
  const {
    windowMs = 60000,
    max = 100,
    maxRequests,
    message = 'Too many requests',
    standardHeaders = true,
    legacyHeaders = false,
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

  const resolvedMax = typeof maxRequests === 'number' ? maxRequests : max;

  const expressRateLimitConfig: ExpressRateLimitConfig = {
    windowMs,
    max: resolvedMax,
    message,
    standardHeaders,
    legacyHeaders,
    keyGenerator,
    skip,
    onLimitReached,
    handler,
    store,
    points,
    durationMs,
    strategy,
    prefix
  };

  // Handle legacy option names for backward compatibility
  const finalWindowMs: number = (expressRateLimitConfig.windowMs ?? expressRateLimitConfig.durationMs ?? 60000) as number;
  const finalMax: number = (expressRateLimitConfig.max ?? expressRateLimitConfig.points ?? 100) as number;
  
  // Validate configuration
  if (typeof finalWindowMs !== 'number' || finalWindowMs <= 0) {
    throw new Error('Rate limiter windowMs must be a positive number');
  }
  if (typeof finalMax !== 'number' || finalMax <= 0) {
    throw new Error('Rate limiter max must be a positive number');
  }

  // Build express-rate-limit configuration
  const rateLimitConfig: any = {
    windowMs: finalWindowMs,
    max: finalMax,
    message: typeof expressRateLimitConfig.message === 'string' ? expressRateLimitConfig.message : 'Rate limit exceeded. Please try again later.',
    standardHeaders: expressRateLimitConfig.standardHeaders,
    legacyHeaders: expressRateLimitConfig.legacyHeaders,
    store: expressRateLimitConfig.store
  };

  // Add custom key generator if provided
  if (expressRateLimitConfig.keyGenerator) {
    rateLimitConfig.keyGenerator = expressRateLimitConfig.keyGenerator;
  } else if (strategy && strategy !== 'ip') {
    // Use existing key building logic for backward compatibility
    rateLimitConfig.keyGenerator = (req: any) => buildRateLimitKey(req, { strategy, prefix });
  }

  // Add skip function if provided
  if (expressRateLimitConfig.skip && typeof expressRateLimitConfig.skip === 'function') {
    rateLimitConfig.skip = expressRateLimitConfig.skip;
  }

  // Add limit reached handler if provided
  if (expressRateLimitConfig.onLimitReached && typeof expressRateLimitConfig.onLimitReached === 'function') {
    rateLimitConfig.onLimitReached = expressRateLimitConfig.onLimitReached;
  }

  // Add custom handler if provided
  if (expressRateLimitConfig.handler && typeof expressRateLimitConfig.handler === 'function') {
    rateLimitConfig.handler = expressRateLimitConfig.handler;
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

/**
 * Rate Limiter Middleware Factory
 * 
 * Creates Express-compatible middleware for rate limiting requests.
 * Supports configurable limits, multiple key strategies, and skip conditions.
 * 
 * @param {object} config - Rate limiter configuration
 * @param {number} [config.points=100] - Max requests per window
 * @param {number} [config.durationMs=60000] - Window duration in ms
 * @param {string} [config.strategy='ip'] - Key strategy: 'ip', 'user', 'apiKey', 'custom'
 * @param {string} [config.prefix='rl'] - Key prefix
 * @param {Function} [config.keyGenerator] - Custom key generator (overrides strategy)
 * @param {boolean} [config.skipSuccessfulRequests=false] - Don't count 2xx responses
 * @param {boolean} [config.skipFailedRequests=false] - Don't count 4xx/5xx responses
 * @param {Function} [config.onLimitReached] - Called when limit is exceeded
 * @param {object} [config.store] - Custom store (must have consume/get/reset methods)
 * @param {object} [config.response] - Custom 429 response
 * @returns {Function} Express middleware function
 */
const createRateLimitStore = require('../security/createRateLimitStore'); // rationale: default in-memory store
const buildRateLimitKey = require('../security/buildRateLimitKey'); // rationale: modular key generation

let defaultStore = null; // shared default store

function getDefaultStore() { // lazy init default store
  if (!defaultStore) {
    defaultStore = createRateLimitStore({ cleanupInterval: 60000 });
  }
  return defaultStore;
}

function createRateLimiter(config = {}) {
  const {
    points = 100,
    durationMs = 60000,
    strategy = 'ip',
    prefix = 'rl',
    keyGenerator = null,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    onLimitReached = null,
    store = null,
    response = null
  } = config;

  if (!Number.isInteger(points) || points < 1) { // validate config
    throw new Error('Rate limiter points must be a positive integer');
  }
  if (!Number.isInteger(durationMs) || durationMs < 1) {
    throw new Error('Rate limiter durationMs must be a positive integer');
  }

  const limiterStore = store || getDefaultStore(); // use provided or default store

  const defaultResponse = { // default 429 response
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  };

  const buildKey = keyGenerator || ((req) => buildRateLimitKey(req, { strategy, prefix })); // key builder

  return function rateLimiter(req, res, next) { // return middleware function
    const key = buildKey(req);
    const useDeferredConsume = skipSuccessfulRequests || skipFailedRequests;

    const currentUsage = limiterStore.get(key); // check current usage without consuming
    const consumed = currentUsage ? currentUsage.consumed : 0;
    
    if (consumed >= points) { // limit already exceeded - reject immediately
      const resetTime = currentUsage ? currentUsage.resetTime : Date.now() + durationMs;
      const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
      
      res.setHeader('X-RateLimit-Limit', points);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
      res.setHeader('Retry-After', retryAfter);
      
      if (onLimitReached) {
        onLimitReached({ req, key, result: { consumed, remaining: 0, resetTime, exceeded: true } });
      }
      
      const responseBody = response || defaultResponse;
      return res.status(429).json({ ...responseBody, retryAfter });
    }

    if (useDeferredConsume) { // deferred consumption - count after response based on status
      res.once('finish', () => {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        if (skipSuccessfulRequests && isSuccess) return; // skip counting successful
        if (skipFailedRequests && !isSuccess) return; // skip counting failed
        limiterStore.consume(key, points, durationMs);
      });
      
      res.setHeader('X-RateLimit-Limit', points); // set headers even in deferred mode
      res.setHeader('X-RateLimit-Remaining', Math.max(0, points - consumed - 1));
      next();
      return;
    }

    const result = limiterStore.consume(key, points, durationMs); // consume immediately
    
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000); // calculate retry time
    res.setHeader('X-RateLimit-Limit', points);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

    if (result.exceeded) { // limit exceeded
      res.setHeader('Retry-After', Math.max(1, retryAfter));
      
      if (onLimitReached) {
        onLimitReached({ req, key, result }); // call hook
      }

      const responseBody = response || defaultResponse;
      return res.status(429).json({
        ...responseBody,
        retryAfter: Math.max(1, retryAfter)
      });
    }

    next(); // proceed
  };
}

createRateLimiter.resetDefaultStore = function() { // for testing
  if (defaultStore) {
    defaultStore.destroy();
    defaultStore = null;
  }
};

module.exports = createRateLimiter;

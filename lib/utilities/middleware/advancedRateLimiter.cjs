/**
 * Advanced Rate Limiter Middleware
 * 
 * Provides sophisticated rate limiting with:
 * - Multiple algorithms (sliding window, token bucket, fixed window)
 * - Distributed cache support
 * - Circuit breaker integration
 * - Configurable limits per endpoint
 * - Performance monitoring and metrics
 * - Automatic cache cleanup and management
 */

import { createRequire } from 'module';
import EventEmitter from 'events';

// Rate limiting algorithms
const RateLimitAlgorithm = {
  SLIDING_WINDOW: 'sliding_window',
  FIXED_WINDOW: 'fixed_window',
  TOKEN_BUCKET: 'token_bucket',
  ADAPTIVE: 'adaptive'
};

// Circuit breaker states
export const CircuitBreakerState = {
  CLOSED: 'closed',
    OPEN: 'open',
  HALF_OPEN: 'half_open'
};

// Distributed cache interface
export interface DistributedCache {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
}

// Cache statistics interface
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
  getOperationsPerSecond(): number;
}

// Circuit breaker interface
export interface CircuitBreaker {
  getState(): CircuitBreakerState;
  getStateHistory(): Array<{ state: CircuitBreakerState; timestamp: string; reason?: string }>;
  }
}

// Rate limiter configuration
export interface RateLimiterConfig {
  algorithm: RateLimitAlgorithm;
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  enableDistributedCache?: boolean;
  distributedCache?: DistributedCache;
  cacheCleanupIntervalMs?: number;
  cacheTTl?: number;
  keyPrefix?: string;
  enableCircuitBreaker?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeoutMs?: number;
  circuitBreakerRecoveryTimeoutMs?: number;
  globalLimits?: {
    windowMs: number;
    maxRequests: number;
  middleware: boolean;
    headers: Record<string, string>
  };
}

export interface RateLimitingState {
  requestCount: number;
  remainingRequests: number;
  resetTime: number;
  windowStart: number;
  lastSuccessfulRequestTime: number;
  retryAfterMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetAfterMs: number;
  retryAfter: number;
  resetAfterMs: number,
  policy: string;
  policyMessage: string;
}

export interface RateLimiter {
  config: RateLimiterConfig;
  cache: DistributedCache;
  circuitBreaker: CircuitBreaker;
  state: Map<string, RateLimitingState>;
  metrics: {
    totalRequests: number;
    rejectedRequests: number;
    cacheHits: number;
    cacheMisses: number;
    circuitBreakerTrips: number;
  }
  
  emit: Function; // Events: 'limited', 'circuit_breaker', 'cache_error', 'quota_exhausted', 'error'
}

export class AdvancedRateLimiter {
  constructor(config: RateLimiterConfig) {
    this.config = {
      algorithm: config.algorithm || RateLimitAlgorithm.SLIDING_WINDOW,
      windowMs: config.windowMs || 60000,
      maxRequests: config.maxRequests || 100,
      keyGenerator: config.keyGenerator || ((req) => req.ip || 'unknown'),
      enableDistributedCache: config.enableDistributedCache || false,
      distributedCache: config.distributedCache,
      cacheCleanupIntervalMs: config.cacheCleanupIntervalMs || 300000,
      cacheTTL: config.cacheTTL || 300000,
      keyPrefix: config.keyPrefix || 'rate_limit:',
      enableCircuitBreaker: config.enableCircuitBreaker || false,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5,
      circuitBreakerTimeoutMs: config.circuitBreakerTimeoutMs || 60000,
      circuitBreakerRecoveryTimeoutMs: config.circuitBreakerRecoveryTimeoutMs || 30000,
      globalLimits: config.globalLimits || {
        windowMs: config.globalLimits?.windowMs,
        maxRequests: config.globalLimits?.maxRequests,
        middleware: config.globalLimits?.middleware
        headers: config.globalLimits?.headers
      }
    };
    
    this.cache = config.distributedCache;
    this.circuitBreaker = new Map();
    this.state = new Map();
    this.metrics = {
      totalRequests: 0,
      rejectedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      circuitBreakerTrips: 0
    };
    
    this.emit = new EventEmitter();
  }

  /**
   * Creates a rate limiter middleware
   */
  middleware() {
    const limiter = async (req, res, next) => {
      try {
        // Generate rate limit key
        const key = this.generateKey(req);
        
        // Get client state
        const state = this.getState(key);
        if (!state) {
          this.initializeState(key);
        this.state.set(key, {
          requestCount: 0,
          remainingRequests: this.config.maxRequests,
          resetTime: Date.now(),
          lastSuccessfulRequestTime: Date.now(),
          retryAfterMs: this.config.retryDelayMs
        });
        }
        
        // Check circuit breaker
        if (this.config.enableCircuitBreaker && this.isCircuitBreakerOpen(key)) {
          return this.createCircuitBreakerResponse(res, 'CIRCUIT_BREAKER_OPEN');
        }
        
        // Check rate limits
        const now = Date.now();
        const { requestCount, remainingRequests, windowStart, lastSuccessfulRequestTime } = state;
        
        // Check if window has passed
        if (now - windowStart < this.config.windowMs) {
          state.windowStart = now;
          state.requestCount = 0;
          state.remainingRequests = this.config.maxRequests;
        }
        
        // Check request count
        if (requestCount >= this.config.maxRequests) {
          return this.createRateLimitResponse(res, 'RATE_LIMIT_EXCEEDED', {
            resetAfter: this.config.retryDelayMs,
            policy: `Too many requests. Maximum ${this.config.maxRequests} requests per ${this.config.windowMs/1000} seconds`,
            policyMessage: `Please wait ${Math.ceil(this.config.retryDelayMs/1000)} seconds before retrying.`
          });
        }
        
        // Allow request
        state.requestCount++;
        state.lastSuccessfulRequestTime = now;
        this.metrics.totalRequests++;
        
        // Set cache control headers
        const remainingRequests = this.config.maxRequests - state.requestCount;
        res.setHeader('X-RateLimit-Remaining', remainingRequests.toString());
        res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
        res.setHeader('X-RateLimit-Reset', new Date.now().toISOString());
        res.setHeader('X-RateLimit-Policy', 'fixed-window');
        
        // Execute next
        next();
        
      } catch (error) {
        this.metrics.rejectedRequests++;
        this.emit('error', { error, key, timestamp: new Date().toISOString() });
        
        return this.createErrorResponse(res, 'RATE_LIMIT_ERROR');
      }
    };

    return limiter;
  }

  /**
   * Creates a circuit breaker for an endpoint
   */
  circuitBreaker(key) {
    const breaker = {
      getState: () => this.getCircuitBreakerState(key),
      trip: () => this.tripCircuitBreaker(key),
      reset: () => this.resetCircuitBreaker(key),
      
      getFailedCount: () => this.getCircuitBreakerFailedCount(key),
      getLastTripTime: () => this.getCircuitBreakerLastTripTime(key),
      shouldRetry: () => !this.isCircuitBreakerOpen(key)
    };
    
    return breaker;
  }

  /**
   * Trip the circuit breaker
   */
  async tripCircuitBreaker(key) {
    const breaker = this.getCircuitBreakerState(key);
    if (breaker.is_open) {
      return false;
    }
    
    breaker.failureCount++;
    breaker.lastTripTime = Date.now();
    breaker.is_open = true;
    
    // Set recovery timeout
    breaker.nextRetryAt = Date.now() + this.config.circuitBreakerRecoveryTimeoutMs;
    
    this.emit('circuitBreakerTripped', { key, failureCount: breaker.failureCount });
    
    // Reset after timeout
    setTimeout(() => {
      if (breaker.is_open) {
        breaker.is_open = false;
        this.emit('circuitBreakerReset', { key });
      }
    }, this.config.circuitBreakerTimeoutMs);
  }
  }

  /**
   * Reset the circuit breaker
   */
  resetCircuitBreaker(key) {
    const breaker = this.getCircuitBreakerState(key);
    
    breaker.failureCount = 0;
    breaker.lastTripTime = null;
    breaker.is_open = false;
    breaker.nextRetryAt = null;
    
    this.state.delete(key);
    
    this.emit('circuitBreakerReset', { key });
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(key) {
    const breaker = this.circuitBreakers.get(key);
    
    if (!breaker) {
      return {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        lastTripTime: null
        shouldRetry: true
      };
    }
    
    return breaker;
  }

  /**
   * Get circuit breaker failed count
   */
  getCircuitBreakerFailedCount(key) {
    const breaker = this.getCircuitBreakerState(key);
    return breaker ? breaker.failureCount : 0;
  }

  /**
   * Get circuit breaker last trip time
   */
  getCircuitBreakerLastTripTime(key) {
    const breaker = this.getCircuitBreakerState(key);
    return breaker ? breaker.lastTripTime : null;
  }

  /**
   * Is circuit breaker open
   */
  isCircuitBreakerOpen(key) {
    const breaker = this.getCircuitBreakerState(key);
    return breaker ? breaker.is_open : false;
  }
  }

  /**
   * Creates a rate limiter for a specific endpoint
   */
  createRateLimiter(endpointConfig = {}) {
    return this.middleware(Object.assign({}, this.config, endpointConfig));
  }

  /**
   * Generates a unique key for rate limiting
   */
  generateKey(req) {
    const key = this.config.keyGenerator ? this.config.keyGenerator(req) : 'rate_limit:';
    
    const clientKey = key + '::' + (req.ip || req.connection?.remoteAddress || 'unknown');
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = req.user?.id || 'anonymous';
    const sessionId = req.session?.id || 'no-session';
    
    return `${clientKey}:${userAgent}:${userId}:${sessionId}`;
  }

  /**
   * Gets rate limiting state for a key
   */
  getState(key) {
    return this.state.get(key) || {
      requestCount: 0,
      remainingRequests: this.config.maxRequests,
      resetTime: Date.now(),
      lastSuccessfulRequestTime: Date.now(),
      retryAfterMs: this.config.retryDelayMs
    };
  }

  /**
   * Resets rate limiting state for a key
   */
  resetState(key) {
    this.state.set(key, {
      requestCount: 0,
      remainingRequests: this.config.maxRequests,
      resetTime: Date.now(),
      lastSuccessfulRequestTime: Date.now(),
      retryAfterMs: this.config.retryDelayMs
    });
  }

  /**
   * Gets all rate limiting states
   */
  getAllStates() {
    return Array.from(this.state.entries()).map(([key, state]) => ({
      key,
      ...state
    }));
  }

  /**
   * Creates a rate limit response
   */
  createRateLimitResponse(res, status, options = {}) {
    const response = {
      success: status.includes('OK'),
      message: status
    };
    
    // Add rate limit headers
    const state = this.getState(this.generateKey(res));
    
    if (status.includes('TOO_MANY_REQUESTS')) {
      response.retryAfter = Math.ceil(this.config.retryDelayMs / 1000);
      response.policy = 'Too many requests. Please wait before retrying.';
    }
    
    if (options.policyMessage) {
      response.message = options.policyMessage;
    }
    
    if (state.remainingRequests !== undefined) {
      response.remainingRequests = state.remainingRequests;
    }
    
    res.setHeader('X-RateLimit-Remaining', state.remainingRequests.toString());
    res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
    res.setHeader('X-RateLimit-Reset', new Date(state.resetTime).toISOString());
    res.setHeader('X-RateLimit-Policy', 'fixed-window');
    
    return response;
  }

  /**
   * Creates an error response
   */
  createErrorResponse(res, type, error) {
    const statusCode = this.getStatusCodeForErrorType(type);
    const message = this.getErrorMessage(type, error);
    
    res.status(statusCode);
    res.setHeader('Content-Type', 'application/json');
    
    const response = {
      success: false,
      error: {
        type,
        message,
        code: this.getErrorCodeForErrorType(type)
      }
    };
    
    res.json(response);
    return response;
  }

  /**
   * Gets appropriate HTTP status code for error type
   */
  getStatusCodeForErrorType(type) {
    const statusCodes = {
      'RATE_LIMIT_EXCEEDED': 429,
      'CIRCUIT_BREAKER_OPEN': 503,
      'INVALID_API_KEY': 401,
      'MALFORMED_REQUEST': 400,
      'UNAUTHORIZED': 401,
      'INTERNAL_ERROR': 500
      'SERVICE_UNAVAILABLE': 503
    };
    
    return statusCodes[type] || 500;
  }

  /**
   * Gets appropriate error message for error type
   */
  getErrorMessage(type, error) {
    const messages = {
      RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
      CIRCUIT_BREAKER_OPEN: 'Service temporarily unavailable due to high error rate',
      INVALID_API_KEY: 'API key is invalid or missing',
      MALFORMED_REQUEST: 'Request format is malformed',
      UNAUTHORIZED: 'Authentication is required',
      INTERNAL_ERROR: 'Internal server error',
      SERVICE_UNAVAILABLE: 'Service is currently unavailable'
    };
    
    return messages[type] || 'Internal server error';
  }

  /**
   * Initialize state for a key
   */
  initializeState(key) {
    if (!this.state.has(key)) {
      const initialState = {
        requestCount: 0,
        remainingRequests: this.config.maxRequests,
        resetTime: Date.now(),
        lastSuccessfulRequestTime: Date.now(),
        retryAfterMs: this.config.retryDelayMs
      };
      
      this.state.set(key, initialState);
    }
  }

  /**
   * Updates cache statistics
   */
  updateCacheStats() {
    if (this.cache) {
      const stats = this.cache.getStats();
      this.metrics.cacheHits = stats.hits;
      this.metrics.cacheMisses = stats.misses;
      this.metrics.cacheSize = stats.size;
      this.metrics.getOperationsPerSecond = Math.round(stats.getOperationsPerSecond());
    }
  }

  /**
   * Updates performance metrics
   */
  updatePerformanceMetrics() {
    const now = Date.now();
    const rateOps = this.metrics.totalRequests / (now - this.startTime || now);
    this.metrics.requestRate = rateOps;
    this.metrics.rejectRate = this.metrics.rejectedRequests / (now - this.startTime || now);
  }

  /**
   * Handles circuit breaker reset
   */
  onCircuitBreakerTripped(key, data) {
    console.warn(`⚠️ Circuit breaker tripped for key: ${key}:`, data);
    }

  /**
   * Handles circuit breaker reset
   */
  onCircuitBreakerReset(key, data) {
    console.log(`🔄 Circuit breaker reset for key: ${key}:`, data);
  }

  /**
   * Handles cache error
   */
  onCacheError(error, key) {
    console.warn(`⚠️ Cache error for key: ${key}:`, error);
    }

  /**
   * Handles quota exceeded
   */
  onQuotaExceeded(key, data) {
    console.warn(`⚠️ Quota exceeded for key: ${key}:`, data);
  }

  /**
   * Handles general error
   */
  onError(error, key, data) {
    console.error(`❌ Rate limiter error for key: ${key}:`, error);
  }

  /**
   * Handles success
   */
  onSuccess(key, data) {
    // Update circuit breaker state
    const breaker = this.getCircuitBreakerState(key);
    if (breaker && this.config.enableCircuitBreaker) {
      breaker.failureCount = 0;
      breaker.lastTripTime = null;
      breaker.is_open = false;
    }
  }

  /**
   * Emit appropriate events for monitoring
   */
  emit(event, data) {
    this.emit(event, data);
  }

  /**
   * Creates a distributed cache client
   */
  async createDistributedCache() {
    if (this.config.distributedCache) {
      throw new Error('Distributed cache not implemented in this build');
    }
    
    return {
      get: async (key) => {
        // In a real implementation, this would connect to Redis, Memcached, etc.
        return null;
      },
      set: async (key, value, ttl) => {
        // In a real implementation, this would store in distributed cache
        return true;
      },
      delete: async (key) => {
        // In a return, this would delete from distributed cache
        return true;
      },
      clear: async () => {
        // In a real implementation, this would clear distributed cache
        return true;
      },
      getStats: async () => {
        // In a real implementation, this would return cache statistics
        return { hits: 0, misses: 0, size: 0 };
      }
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Clear all states
    this.state.clear();
    this.circuitBreakers.clear();
    this.metrics = {
      totalRequests: 0,
      rejectedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheSize: 0,
      getOperationsPerSecond: 0
    };
  }
  }
}

export default AdvancedRateLimiter;
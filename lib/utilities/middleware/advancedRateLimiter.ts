/**
 * Advanced Rate Limiting Middleware - SCALABILITY FIXES
 * 
 * PURPOSE: Comprehensive rate limiting solution supporting multiple algorithms,
 * distributed environments, and intelligent throttling for API protection.
 * 
 * SCALABILITY IMPROVEMENTS:
 * - Bounded cache with LRU eviction to prevent memory leaks
 * - Optimized cleanup with batched operations
 * - Configurable cache size limits
 * - Efficient sliding window cleanup
 */

import { Request, Response, NextFunction } from 'express';
import { qerrors } from 'qerrors';
import DistributedCache from '../caching/distributedCache.js';
import BoundedRateLimitCache from './boundedRateLimitCache.js';

interface RateLimitConfig {
  algorithm: 'sliding_window' | 'token_bucket' | 'fixed_window';
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  enableDrafting?: boolean;
  distributedCache?: DistributedCache<any>;
  headers?: boolean;
  statusCode?: number;
  message?: string;
  onLimitReached?: (req: Request, res: Response) => void;
  onSkipped?: (req: Request, res: Response) => void;
  maxCacheSize?: number;
}

interface TokenBucketConfig {
  tokens: number;
  refillRate: number; // tokens per second
  maxTokens: number;
  lastRefill?: number;
}

interface SlidingWindowEntry {
  timestamp: number;
  count: number;
}

interface RateLimitMetrics {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  skippedRequests: number;
  averageRequestsPerWindow: number;
  peakRequestsPerWindow: number;
  activeKeys: number;
  blockedByAlgorithm: Map<string, number>;
}

class RateLimiter {
  private config: RateLimitConfig;
  private metrics: RateLimitMetrics;
  private tokenBuckets: BoundedRateLimitCache<string, TokenBucketConfig>;
  private slidingWindows: BoundedRateLimitCache<string, SlidingWindowEntry[]>;
  private fixedWindows: BoundedRateLimitCache<string, { count: number; resetTime: number }>;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = {
      algorithm: config.algorithm,
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      enableDrafting: config.enableDrafting || false,
      distributedCache: config.distributedCache,
      headers: config.headers !== false,
      statusCode: config.statusCode || 429,
      message: config.message || 'Too many requests, please try again later.',
      onLimitReached: config.onLimitReached || (() => {}),
      onSkipped: config.onSkipped || (() => {}),
      maxCacheSize: config.maxCacheSize || 10000
    };

    // Initialize bounded caches to prevent memory leaks
    const cacheSize = this.config.maxCacheSize!;
    this.tokenBuckets = new BoundedRateLimitCache(cacheSize);
    this.slidingWindows = new BoundedRateLimitCache(cacheSize);
    this.fixedWindows = new BoundedRateLimitCache(cacheSize);

    this.metrics = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      skippedRequests: 0,
      averageRequestsPerWindow: 0,
      peakRequestsPerWindow: 0,
      activeKeys: 0,
      blockedByAlgorithm: new Map()
    };

    // Start cleanup interval for expired entries
    this.cleanupInterval = setInterval(() => this.cleanupExpiredEntries(), 60000);
  }

  /**
   * Express middleware function
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.config.keyGenerator!(req);
        const shouldSkip = this.shouldSkipRequest(req, res);

        if (shouldSkip) {
          this.metrics.skippedRequests++;
          this.config.onSkipped!(req, res);
          return next();
        }

        const result = await this.checkLimit(key);
        
        // Update metrics
        this.metrics.totalRequests++;

        if (result.allowed) {
          this.metrics.allowedRequests++;
          this.addResponseHeaders(res, result);
          next();
        } else {
          this.metrics.blockedRequests++;
          
          const algorithmName = this.config.algorithm;
          const currentCount = this.metrics.blockedByAlgorithm.get(algorithmName) || 0;
          this.metrics.blockedByAlgorithm.set(algorithmName, currentCount + 1);

          this.config.onLimitReached!(req, res);
          this.sendLimitResponse(req, res, result);
        }

      } catch (error) {
        qerrors(
          error instanceof Error ? error : new Error(String(error)),
          'RateLimiter.middleware',
          'Rate limiting middleware failed'
        );
        next(); // Allow request to proceed on error
      }
    };
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(key: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const now = Date.now();

    switch (this.config.algorithm) {
      case 'sliding_window':
        return this.checkSlidingWindow(key, now);
      
      case 'token_bucket':
        return this.checkTokenBucket(key, now);
      
      case 'fixed_window':
        return this.checkFixedWindow(key, now);
      
      default:
        throw new Error(`Unknown rate limiting algorithm: ${this.config.algorithm}`);
    }
  }

  /**
   * Sliding window algorithm with optimized cleanup
   */
  private async checkSlidingWindow(key: string, now: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    let entries: SlidingWindowEntry[];

    if (this.config.distributedCache) {
      // Use distributed cache for sliding window
      const cacheKey = `sliding:${key}`;
      const cached = await this.config.distributedCache.get(cacheKey);
      entries = cached || [];
    } else {
      // Use bounded in-memory sliding window
      entries = this.slidingWindows.get(key) || [];
    }

    // Optimized cleanup with binary search for large arrays
    const windowStart = now - this.config.windowMs;
    let validEntries: SlidingWindowEntry[];

    if (entries.length > 100) {
      // Use binary search for large arrays
      let left = 0;
      let right = entries.length;
      
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (entries[mid].timestamp <= windowStart) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      
      validEntries = entries.slice(left);
    } else {
      // Use linear filter for small arrays
      validEntries = entries.filter(entry => entry.timestamp > windowStart);
    }

    // Count current requests in window
    const currentCount = validEntries.reduce((sum, entry) => sum + entry.count, 0);

    // Check if request is allowed
    const allowed = currentCount < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - currentCount);

    // Add current request if allowed
    if (allowed) {
      validEntries.push({ timestamp: now, count: 1 });
    }

    // Update storage
    if (this.config.distributedCache) {
      const cacheKey = `sliding:${key}`;
      await this.config.distributedCache.set(cacheKey, validEntries, this.config.windowMs);
    } else {
      this.slidingWindows.set(key, validEntries);
    }

    // Calculate reset time
    const oldestEntry = validEntries[0];
    const resetTime = oldestEntry ? oldestEntry.timestamp + this.config.windowMs : now + this.config.windowMs;

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil((resetTime - now) / 1000)
    };
  }

  /**
   * Token bucket algorithm
   */
  private async checkTokenBucket(key: string, now: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    let bucket: TokenBucketConfig;

    if (this.config.distributedCache) {
      // Use distributed cache for token bucket
      const cacheKey = `token:${key}`;
      const cached = await this.config.distributedCache.get(cacheKey);
      bucket = cached || {
        tokens: this.config.maxRequests,
        refillRate: this.config.maxRequests / (this.config.windowMs / 1000),
        maxTokens: this.config.maxRequests
      };
    } else {
      // Use bounded in-memory token bucket
      bucket = this.tokenBuckets.get(key) || {
        tokens: this.config.maxRequests,
        refillRate: this.config.maxRequests / (this.config.windowMs / 1000),
        maxTokens: this.config.maxRequests
      };
    }

    // Refill tokens based on time elapsed
    const lastRefill = bucket.lastRefill || now;
    const timeElapsed = (now - lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timeElapsed * bucket.refillRate;
    
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request can be allowed
    const allowed = bucket.tokens >= 1;
    const remaining = Math.floor(bucket.tokens);

    if (allowed) {
      bucket.tokens -= 1;
    }

    // Update storage
    if (this.config.distributedCache) {
      const cacheKey = `token:${key}`;
      await this.config.distributedCache.set(cacheKey, bucket, this.config.windowMs);
    } else {
      this.tokenBuckets.set(key, bucket);
    }

    // Calculate reset time
    const tokensNeeded = 1 - bucket.tokens;
    const resetTime = tokensNeeded > 0 
      ? now + (tokensNeeded / bucket.refillRate) * 1000
      : now + 1000;

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(tokensNeeded / bucket.refillRate)
    };
  }

  /**
   * Fixed window algorithm
   */
  private async checkFixedWindow(key: string, now: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    let window: { count: number; resetTime: number };

    if (this.config.distributedCache) {
      // Use distributed cache for fixed window
      const cacheKey = `fixed:${key}`;
      window = await this.config.distributedCache.get(cacheKey) || {
        count: 0,
        resetTime: now + this.config.windowMs
      };
    } else {
      // Use bounded in-memory fixed window
      window = this.fixedWindows.get(key) || {
        count: 0,
        resetTime: now + this.config.windowMs
      };
    }

    // Reset window if expired
    if (now > window.resetTime) {
      window.count = 0;
      window.resetTime = now + this.config.windowMs;
    }

    // Check if request is allowed
    const allowed = window.count < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - window.count);

    if (allowed) {
      window.count++;
    }

    // Update storage
    if (this.config.distributedCache) {
      const cacheKey = `fixed:${key}`;
      await this.config.distributedCache.set(cacheKey, window, this.config.windowMs);
    } else {
      this.fixedWindows.set(key, window);
    }

    return {
      allowed,
      remaining,
      resetTime: window.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((window.resetTime - now) / 1000)
    };
  }

  /**
   * Check if request should be skipped
   */
  private shouldSkipRequest(req: Request, res: Response): boolean {
    // Skip if response status is available and should be skipped
    if (res.statusCode) {
      if (this.config.skipSuccessfulRequests && res.statusCode >= 200 && res.statusCode < 300) {
        return true;
      }
      if (this.config.skipFailedRequests && res.statusCode >= 400) {
        return true;
      }
    }

    return false;
  }

  /**
   * Add rate limiting headers to response
   */
  private addResponseHeaders(res: Response, result: {
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }): void {
    if (!this.config.headers) return;

    res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

    if (result.retryAfter) {
      res.setHeader('Retry-After', result.retryAfter);
    }
  }

  /**
   * Send rate limit exceeded response
   */
  private sendLimitResponse(req: Request, res: Response, result: {
    resetTime: number;
    retryAfter?: number;
  }): void {
    res.status(this.config.statusCode!);
    
    this.addResponseHeaders(res, {
      remaining: 0,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter
    });

    if (req.accepts('json')) {
      res.json({
        error: 'Rate limit exceeded',
        message: this.config.message,
        resetTime: result.resetTime,
        retryAfter: result.retryAfter
      });
    } else {
      res.send(this.config.message!);
    }
  }

  /**
   * Default key generator
   */
  private defaultKeyGenerator(req: Request): string {
    return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  }

  /**
   * Clean up expired entries with batched operations
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();

    // Batch cleanup for sliding windows
    const windowStart = now - this.config.windowMs;
    this.slidingWindows.cleanup((key, entries) => {
      const validEntries = entries.filter(entry => entry.timestamp > windowStart);
      if (validEntries.length === 0) {
        return true; // Delete this entry
      }
      // Update with filtered entries
      this.slidingWindows.set(key, validEntries);
      return false; // Don't delete
    });

    // Batch cleanup for fixed windows
    this.fixedWindows.cleanup((key, window) => {
      return now > window.resetTime;
    });
  }

  /**
   * Get rate limiting metrics
   */
  getMetrics(): RateLimitMetrics {
    // Calculate active keys
    this.metrics.activeKeys = 
      this.slidingWindows.size + 
      this.tokenBuckets.size + 
      this.fixedWindows.size;

    // Calculate peak and average requests per window
    const totalWindows = 
      this.slidingWindows.size + 
      this.tokenBuckets.size + 
      this.fixedWindows.size;

    this.metrics.peakRequestsPerWindow = this.config.maxRequests;
    this.metrics.averageRequestsPerWindow = totalWindows > 0 
      ? this.metrics.totalRequests / totalWindows 
      : 0;

    return { ...this.metrics };
  }

  /**
   * Reset all rate limiting data
   */
  reset(): void {
    this.slidingWindows.clear();
    this.tokenBuckets.clear();
    this.fixedWindows.clear();
    
    this.metrics = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      skippedRequests: 0,
      averageRequestsPerWindow: 0,
      peakRequestsPerWindow: 0,
      activeKeys: 0,
      blockedByAlgorithm: new Map()
    };
  }

  /**
   * Reset rate limiting for specific key
   */
  resetKey(key: string): void {
    this.slidingWindows.delete(key);
    this.tokenBuckets.delete(key);
    this.fixedWindows.delete(key);
  }

  /**
   * Get current status for a key
   */
  async getKeyStatus(key: string): Promise<{
    algorithm: string;
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const result = await this.checkLimit(key);
    
    return {
      algorithm: this.config.algorithm,
      ...result
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.reset();
  }
}

export default RateLimiter;
export type { RateLimitConfig, TokenBucketConfig, SlidingWindowEntry, RateLimitMetrics };
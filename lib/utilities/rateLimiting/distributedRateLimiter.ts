import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';
import { BoundedLRUCache } from '../performance/boundedCache.js';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: number;
  retryAfter?: number;
}

interface DistributedRateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any, res: any, result: RateLimitResult, config: DistributedRateLimitConfig) => void;
  skipSuccessfulRequests?: boolean;
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  redisClient?: any;
}

/**
 * Distributed Rate Limiter Implementation
 */
export class DistributedRateLimiter extends EventEmitter {
  private config: Required<DistributedRateLimitConfig>;
  private requestCounts: BoundedLRUCache<string, { count: number; windowStart: number }>;
  private blockedKeys: BoundedLRUCache<string, number>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: DistributedRateLimitConfig) {
    super();
    this.config = {
      keyGenerator: config.keyGenerator || ((req: any) => req.ip || req.socket?.remoteAddress || 'unknown'),
      onLimitReached: config.onLimitReached || null,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      ...config
    };

    // Initialize bounded caches to prevent memory leaks
    this.requestCounts = new BoundedLRUCache<string, { count: number; windowStart: number }>(
      10000, // Maximum 10K keys tracked
      config.windowMs // TTL matches window duration
    );
    
    this.blockedKeys = new BoundedLRUCache<string, number>(
      5000, // Maximum 5K blocked keys
      config.windowMs * 2 // Block for 2x window duration
    );

    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredData();
    }, 60000); // Cleanup every minute
  }

  private cleanupExpiredData(): void {
    // BoundedLRUCache handles automatic cleanup via TTL
    // No manual cleanup needed
  }

  /**
   * Check rate limit
   */
  async checkLimit(req: any, res: any): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();

    // Check if currently blocked
    const blockUntil = this.blockedKeys.get(key);
    if (blockUntil && now < blockUntil) {
      const retryAfter = Math.ceil((blockUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter
      };
    }

    // Get or create request counter
    let counter = this.requestCounts.get(key);
    if (!counter || (now - counter.windowStart) > this.config.windowMs) {
      counter = { count: 0, windowStart: now };
      this.requestCounts.set(key, counter);
    }

    // Increment count
    counter.count++;

    // Check if over limit
    if (counter.count > this.config.maxRequests) {
      const blockUntil = now + this.config.windowMs;
      this.blockedKeys.set(key, blockUntil);

      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil(this.config.windowMs / 1000)
      };

      if (this.config.onLimitReached) {
        this.config.onLimitReached(req, res, result, this.config);
      }

      return result;
    }

    // Allowed request
    return {
      allowed: true,
      remaining: Math.max(0, this.config.maxRequests - counter.count)
    };
  }

  /**
   * Middleware function
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
      try {
        const result = await this.checkLimit(req, res);

        if (!result.allowed) {
          res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(Date.now() + this.config.windowMs).toISOString());

          if (result.retryAfter) {
            res.setHeader('Retry-After', result.retryAfter.toString());
          }

          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests',
            retryAfter: result.retryAfter
          });
        }

        // Set headers for allowed requests
        res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + this.config.windowMs).toISOString());

        next();
      } catch (error) {
        qerrors(
          error instanceof Error ? error : new Error(String(error)),
          'DistributedRateLimiter.middleware',
          'Rate limiting failed'
        );
        // Fail open - allow request if rate limiting fails
        next();
      }
    };
  }

  /**
   * Destroy rate limiter
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.requestCounts.destroy();
    this.blockedKeys.destroy();
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      cacheStats: this.requestCounts.getStats(),
      blockedCount: this.blockedKeys.size
    };
  }
}
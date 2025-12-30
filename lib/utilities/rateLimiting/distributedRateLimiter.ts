/**
 * Distributed Rate Limiting with Redis
 * 
 * PURPOSE: Replace in-memory rate limiting with distributed Redis-based
 * rate limiting for horizontal scalability across multiple instances.
 * 
 * FEATURES:
 * - Redis-based distributed rate limiting
 * - Sliding window implementation
 * - Multiple rate limit strategies
 * - Cluster-wide synchronization
 * - Automatic cleanup and expiration
 */

// Note: Redis client implementation depends on your Redis setup
// This is a generic implementation that can be adapted to ioredis, node-redis, etc.

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<string | null>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  del(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  hset(key: string, field: string, value: string): Promise<number>;
  hget(key: string, field: string): Promise<string | null>;
  hgetall(key: string): Promise<Record<string, string>>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zrem(key: string, member: string): Promise<number>;
  zremrangebyscore(key: string, min: number, max: number): Promise<string[]>;
  zcard(key: string): Promise<number>;
  disconnect?(): void;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: any) => string; // Custom key generator
  strategy?: 'fixed-window' | 'sliding-window' | 'token-bucket';
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: any, res: any, options: any) => void;
}

interface RateLimitResult {
  allowed: boolean;
  totalHits: number;
  remainingHits: number;
  resetTime: Date;
  retryAfter?: number;
}

interface RedisRateLimitData {
  count: number;
  windowStart: number;
  lastAccess: number;
}

export class DistributedRateLimiter {
  private redis: RedisClient;
  private config: RateLimitConfig;
  private keyPrefix: string;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(redisClient: RedisClient, config: RateLimitConfig) {
    this.redis = redisClient;
    this.config = {
      strategy: 'sliding-window',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };
    this.keyPrefix = 'rate_limit:';
    
    this.startCleanupInterval();
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(req: any, res: any): Promise<RateLimitResult> {
    const key = this.generateKey(req);
    const now = Date.now();

    switch (this.config.strategy) {
      case 'sliding-window':
        return await this.checkSlidingWindow(key, now);
      case 'token-bucket':
        return await this.checkTokenBucket(key, now);
      default:
        return await this.checkFixedWindow(key, now);
    }
  }

  /**
   * Generate rate limit key
   */
  private generateKey(req: any): string {
    if (this.config.keyGenerator) {
      return this.keyPrefix + this.config.keyGenerator(req);
    }

    // Default key based on IP and user ID
    const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    const userId = req.user?.id || req.headers['x-user-id'] || 'anonymous';
    return `${this.keyPrefix}${ip}:${userId}`;
  }

  /**
   * Fixed window rate limiting
   */
  private async checkFixedWindow(key: string, now: number): Promise<RateLimitResult> {
    const windowStart = now - (now % this.config.windowMs);
    const windowEnd = windowStart + this.config.windowMs;

    // Get current count
    const currentData = await this.redis.get(key);
    let count = 0;

    if (currentData) {
      try {
        const parsed: RedisRateLimitData = JSON.parse(currentData);
        if (parsed.windowStart >= windowStart) {
          count = parsed.count;
        }
      } catch (error) {
        console.warn('Failed to parse rate limit data:', error);
      }
    }

    // Check if limit exceeded
    const allowed = count < this.config.maxRequests;

    if (allowed) {
      // Increment count and set expiration
      const newData: RedisRateLimitData = {
        count: count + 1,
        windowStart,
        lastAccess: now
      };
      
      await this.redis.setex(key, Math.ceil(this.config.windowMs / 1000), JSON.stringify(newData));
    }

    return {
      allowed,
      totalHits: count + (allowed ? 1 : 0),
      remainingHits: Math.max(0, this.config.maxRequests - count - (allowed ? 1 : 0)),
      resetTime: new Date(windowEnd),
      retryAfter: allowed ? undefined : Math.ceil(this.config.windowMs / 1000)
    };
  }

  /**
   * Sliding window rate limiting
   */
  private async checkSlidingWindow(key: string, now: number): Promise<RateLimitResult> {
    const windowStart = now - this.config.windowMs;
    
    // Use Redis sorted set for sliding window
    const memberKey = `${key}:members`;
    const timestamp = now + Math.random(); // Add small random for uniqueness

    // Add current request
    await this.redis.zadd(memberKey, timestamp, timestamp);
    
    // Remove old entries
    await this.redis.zremrangebyscore(memberKey, 0, windowStart);

    // Get current count
    const count = await this.redis.zcard(memberKey);
    
    // Set expiration on sorted set
    await this.redis.expire(memberKey, Math.ceil(this.config.windowMs / 1000));

    const allowed = count <= this.config.maxRequests;

    if (!allowed) {
      // Remove the entry we just added since limit exceeded
      await this.redis.zrem(memberKey, timestamp);
    }

    return {
      allowed,
      totalHits: count,
      remainingHits: Math.max(0, this.config.maxRequests - count),
      resetTime: new Date(now + this.config.windowMs),
      retryAfter: allowed ? undefined : Math.ceil(this.config.windowMs / 1000)
    };
  }

  /**
   * Token bucket rate limiting
   */
  private async checkTokenBucket(key: string, now: number): Promise<RateLimitResult> {
    const bucketKey = `${key}:bucket`;
    const refillRate = this.config.maxRequests / (this.config.windowMs / 1000); // tokens per second

    // Get current bucket state
    const currentData = await this.redis.hgetall(bucketKey);
    let tokens = this.config.maxRequests; // Start with max tokens
    let lastRefill = now - this.config.windowMs;

    if (currentData && currentData.tokens) {
      tokens = parseFloat(currentData.tokens);
      lastRefill = parseInt(currentData.lastRefill);
    }

    // Refill tokens based on time passed
    const timePassed = Math.max(0, now - lastRefill) / 1000; // seconds
    const updatedTokens = Math.min(this.config.maxRequests, tokens + (timePassed * refillRate));

    // Check if we have enough tokens
    const allowed = newTokens >= 1;

if (allowed) {
      // Consume one token
      updatedTokens -= 1;
    }

    // Update bucket state
    await this.redis.hset(bucketKey, 'tokens', updatedTokens.toString());
    await this.redis.hset(bucketKey, 'lastRefill', now.toString());

      if (!result.allowed) {
        // Call custom limit handler if provided
        if (config.onLimitReached) {
          config.onLimitReached(req, res, { ...result, config });
        } else {
          res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: result.retryAfter,
            resetTime: result.resetTime
          });
        }
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiting fails
      next();
    }
  };
}
/**
 * Common Retry and Async Utilities
 * 
 * Simplified version with core functionality to avoid compilation issues
 */

import { handleError } from '../error/commonErrorHandling.js';

/**
 * Retry configuration options
 */
interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential' | 'fixed';
  jitter?: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

/**
 * Implements retry logic with different backoff strategies
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 'exponential',
    jitter = true,
    retryCondition,
    onRetry
  } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || (retryCondition && !retryCondition(error))) {
        throw error;
      }
      
      if (onRetry) {
        onRetry(error, attempt + 1);
      }
      
      let nextDelay = delay;
      switch (backoff) {
        case 'linear':
          nextDelay = delay * (attempt + 1);
          break;
        case 'exponential':
          nextDelay = delay * Math.pow(2, attempt);
          break;
        case 'fixed':
          nextDelay = delay;
          break;
      }
      
      if (jitter) {
        nextDelay = nextDelay * (0.5 + Math.random() * 0.5);
      }
      
      await new Promise(resolve => setTimeout(resolve, nextDelay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Creates a delay with optional value
 */
export function delay<T = void>(delayMs: number, value?: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value as T);
    }, delayMs);
  });
}

/**
 * Simple async queue implementation
 */
export class AsyncQueue<T> {
  private queue: Array<{ item: T; resolve: (value: T) => void; reject: (error: any) => void }> = [];
  private processing = false;

  enqueue(item: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const { item, resolve, reject } = this.queue.shift()!;

    try {
      await (item as any)();
      resolve(item as T);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      this.process();
    }
  }

  size(): number {
    return this.queue.length;
  }
}

/**
 * Creates a basic rate limiter
 */
export function createRateLimiter(maxRequests: number, windowMs: number = 60000) {
  let requests = 0;
  let lastReset = Date.now();

  return {
    async acquire<T>(fn: () => Promise<T>): Promise<T> {
      const now = Date.now();
      
      if (now - lastReset >= windowMs) {
        requests = 0;
        lastReset = now;
      }
      
      if (requests >= maxRequests) {
        const timeToReset = windowMs - (now - lastReset);
        await delay(timeToReset);
      }
      
      requests++;
      return fn();
    },
    
    getStats() {
      return {
        requests,
        remaining: Math.max(0, maxRequests - requests),
        resetTime: new Date(lastReset + windowMs)
      };
    }
  };
}

export const AsyncUtils = {
  withRetry,
  delay,
  AsyncQueue,
  createRateLimiter
};
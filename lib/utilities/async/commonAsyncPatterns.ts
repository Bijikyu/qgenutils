/**
 * Common Retry and Async Utilities
 * 
 * Centralized retry and async utilities to eliminate code duplication across
 * codebase. These utilities handle common async patterns including
 * retry logic, timeout handling, and promise utilities.
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
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Promise with retry logic
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
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const shouldRetry = attempt < maxRetries && 
        (retryCondition ? retryCondition(error) : true);
      
      if (!shouldRetry) {
        throw error;
      }
      
      // Call retry callback
      if (onRetry) {
        onRetry(error, attempt + 1);
      }
      
      // Calculate delay for next attempt
      if (attempt < maxRetries) {
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
        
        // Add jitter if enabled
        if (jitter) {
          nextDelay = nextDelay * (0.5 + Math.random() * 0.5);
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.max(nextDelay, 100)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Creates a timeout wrapper for promises
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param error - Custom error to throw on timeout
 * @returns Promise with timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  error: Error = new Error('Operation timed out')
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(error), timeoutMs);
    })
  ]);
}

/**
 * Creates a debounced function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Creates a throttled function
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>): void => {
    if (inThrottle) {
      return;
    }
    
    inThrottle = true;
    fn(...args);
    
    setTimeout(() => {
      inThrottle = false;
    }, limit);
  };
}

/**
 * Creates a memoized function
 * @param fn - Function to memoize
 * @param keyGenerator - Optional key generator
 * @param maxCacheSize - Maximum cache size
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, { value: any; timestamp: number }>();
  
  return (...args: Parameters<T>): any => {
    // Generate cache key
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // Check cache
    const cached = cache.get(key);
    if (cached) {
      return cached.value;
    }
    
    // Execute function
    const result = fn(...args);
    
    // Limit cache size
    if (cache.size >= maxCacheSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    // Store result
    cache.set(key, { value: result, timestamp: Date.now() });
    
    return result;
  };
}

/**
 * Executes promises in parallel with concurrency limit
 * @param tasks - Array of tasks to execute
 * @param concurrency - Maximum concurrent tasks
 * @returns Promise with all results
 */
export async function parallel<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number = 10
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    // Wait for slot if concurrency reached
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove completed tasks from executing list
      for (let j = executing.length - 1; j >= 0; j--) {
        if (executing[j] && await Promise.race([executing[j], Promise.resolve()])) {
          executing.splice(j, 1);
        }
      }
    }
    
    // Execute task
    const promise = task().then(result => {
      results[i] = result;
    });
    executing.push(promise);
  }
  
  // Wait for all remaining tasks
  await Promise.all(executing);
  
  return results;
}

/**
 * Creates a queue for async tasks
 */
export class AsyncQueue<T = any> {
  private queue: Array<{ task: () => Promise<T>; resolve: (value: T) => void; reject: (error: any) => void }> = [];
  private running = 0;
  private maxConcurrency: number;
  
  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }
  
  /**
   * Adds a task to the queue
   */
  async add(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  /**
   * Processes the queue
   */
  private async process(): Promise<void> {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    
    const { task, resolve, reject } = this.queue.shift()!;
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
  
  /**
   * Gets queue statistics
   */
  getStats(): { pending: number; running: number; maxConcurrency: number } {
    return {
      pending: this.queue.length,
      running: this.running,
      maxConcurrency: this.maxConcurrency
    };
  }
  
  /**
   * Clears the queue
   */
  clear(): void {
    this.queue.forEach(({ reject }) => {
      reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

/**
 * Creates a circuit breaker for async operations
 */
export class CircuitBreaker<T extends (...args: any[]) => Promise<any>> {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private fn: T,
    private options: {
      failureThreshold?: number;
      recoveryTime?: number;
      monitoringPeriod?: number;
    } = {}
  ) {
    this.options = {
      failureThreshold: 5,
      recoveryTime: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      ...options
    };
  }
  
  async execute(...args: Parameters<T>): Promise<ReturnType<T>> {
    const now = Date.now();
    
    // Check if circuit should reset
    if (this.state === 'OPEN' && now - this.lastFailureTime > this.options.recoveryTime!) {
      this.state = 'HALF_OPEN';
    }
    
    // Reject if circuit is open
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await this.fn(...args);
      
      // Reset on success if in half-open state
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      this.lastFailureTime = now;
      this.failureCount++;
      
      // Open circuit if threshold exceeded
      if (this.failureCount >= this.options.failureThreshold!) {
        this.state = 'OPEN';
      }
      
      throw error;
    }
  }
  
  /**
   * Gets current circuit state
   */
  getState(): string {
    return this.state;
  }
  
  /**
   * Resets the circuit breaker
   */
  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

/**
 * Creates a promise that resolves after a delay
 * @param delayMs - Delay in milliseconds
 * @param value - Value to resolve with
 * @returns Promise that resolves after delay
 */
export function delay<T = void>(delayMs: number, value?: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value as T), delayMs);
  });
}

/**
 * Creates a retrying fetch function
 * @param input - Fetch input
 * @param init - Fetch init options
 * @param retryOptions - Retry options
 * @returns Fetch result with retry logic
 */
export function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(
    () => fetch(input, init),
    {
      ...retryOptions,
      retryCondition: (error: any) => {
        // Retry on network errors and 5xx responses
        return error.name === 'TypeError' || 
          (error.response && error.response.status >= 500);
      }
    }
  );
}

/**
 * Creates a concurrent rate limiter
 */
export class RateLimiter {
  private requests: number = 0;
  private lastReset = Date.now();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  /**
   * Executes a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    
    // Reset counter if window passed
    if (now - this.lastReset > this.windowMs) {
      this.requests = 0;
      this.lastReset = now;
    }
    
    // Wait if limit exceeded
    if (this.requests >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.lastReset);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.execute(fn);
    }
    
    this.requests++;
    
    try {
      return await fn();
    } finally {
      this.requests--;
    }
  }
  
  /**
   * Gets current statistics
   */
  getStats(): { requests: number; remaining: number; resetTime: Date } {
    return {
      requests: this.requests,
      remaining: Math.max(0, this.maxRequests - this.requests),
      resetTime: new Date(this.lastReset + this.windowMs)
    };
  }
}
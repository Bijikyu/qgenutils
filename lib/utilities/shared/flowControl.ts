/**
 * SHARED FLOW CONTROL UTILITIES
 * 
 * PURPOSE: Provides common async flow control and retry patterns.
 * This utility eliminates duplication of retry, throttling, and scheduling logic.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized async flow control
 * - Exponential backoff with jitter
 * - Composable operation patterns
 * - Cancellation support
 * - Performance optimized
 */

import { ErrorHandlers } from './index.js';

/**
 * Retry options interface.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Base delay in milliseconds */
  baseDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Enable exponential backoff */
  exponentialBackoff?: boolean;
  /** Enable jitter to prevent thundering herd */
  enableJitter?: boolean;
  /** Custom retry condition function */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** Custom delay calculation function */
  delayFn?: (attempt: number, baseDelay: number, maxDelay: number) => number;
}

/**
 * Throttle options interface.
 */
export interface ThrottleOptions {
  /** Maximum number of concurrent operations */
  limit: number;
  /** Time window in milliseconds */
  windowMs?: number;
  /** Strategy: 'queue' or 'drop' */
  strategy?: 'queue' | 'drop';
}

/**
 * Schedule options interface.
 */
export interface ScheduleOptions {
  /** Delay before first execution */
  delay?: number;
  /** Repeat interval in milliseconds */
  interval?: number;
  /** Maximum number of executions */
  maxExecutions?: number;
  /** Enable automatic cleanup */
  autoCleanup?: boolean;
}

/**
 * Flow control result interface.
 */
export interface FlowControlResult<T> {
  /** Operation result */
  result?: T;
  /** Error if operation failed */
  error?: Error;
  /** Number of attempts made */
  attempts: number;
  /** Total time taken */
  duration: number;
  /** Whether operation was cancelled */
  cancelled: boolean;
}

/**
 * Creates a retry function with exponential backoff.
 * 
 * @param options - Retry configuration
 * @returns Retry function wrapper
 */
export const createRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    exponentialBackoff = true,
    enableJitter = true,
    shouldRetry = defaultShouldRetry,
    delayFn = defaultDelayFn
  } = options;

  /**
   * Default retry condition.
   */
  function defaultShouldRetry(error: Error, attempt: number): boolean {
    return attempt < maxAttempts && isRetryableError(error);
  }

  /**
   * Checks if error is retryable.
   */
  function isRetryableError(error: Error): boolean {
    // Network errors
    if (error.name === 'ECONNRESET' || error.name === 'ECONNREFUSED') return true;
    // HTTP errors
    if (error.message.includes('timeout') || error.message.includes('network')) return true;
    // Retryable status codes (if available)
    if ('status' in error && typeof error.status === 'number') {
      const retryableCodes = [408, 429, 500, 502, 503, 504];
      return retryableCodes.includes(error.status);
    }
    return false;
  }

  /**
   * Default delay calculation with jitter.
   */
  function defaultDelayFn(attempt: number, base: number, max: number): number {
    if (!exponentialBackoff) return base;

    const exponentialDelay = Math.min(base * Math.pow(2, attempt - 1), max);
    
    if (!enableJitter) return exponentialDelay;

    // Add jitter: +/- 25% of delay
    const jitterRange = exponentialDelay * 0.5; // 25% * 2 = 50% total range
    const jitter = (Math.random() - 0.5) * jitterRange;
    return Math.max(0, exponentialDelay + jitter);
  }

  /**
   * Executes function with retry logic.
   */
  const execute = async <T>(fn: () => Promise<T>): Promise<FlowControlResult<T>> => {
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        const duration = Date.now() - startTime;
        
        return {
          result,
          attempts: attempt,
          duration,
          cancelled: false
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        if (!shouldRetry(lastError, attempt)) {
          break;
        }

        // If not the last attempt, wait before retrying
        if (attempt < maxAttempts) {
          const delay = delayFn(attempt, baseDelay, maxDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const duration = Date.now() - startTime;
    
    return {
      error: lastError,
      attempts: maxAttempts,
      duration,
      cancelled: false
    };
  };

  return { execute };
};

/**
 * Creates a throttle function for controlling concurrent operations.
 * 
 * @param options - Throttle configuration
 * @returns Throttle function wrapper
 */
export const createThrottle = <T>(options: ThrottleOptions) => {
  const { limit, windowMs = 1000, strategy = 'queue' } = options;
  
  let queue: Array<() => Promise<T>> = [];
  let running = 0;
  let windowStart = Date.now();
  let completedInWindow = 0;

  /**
   * Executes next item in queue.
   */
  const executeNext = async () => {
    if (queue.length === 0) return;

    running++;
    const fn = queue.shift()!;
    
    try {
      await fn();
      completedInWindow++;
    } finally {
      running--;
      
      // Check if we need to reset window
      if (Date.now() - windowStart >= windowMs) {
        windowStart = Date.now();
        completedInWindow = 0;
      }
      
      // Continue processing
      process.nextTick(executeNext);
    }
  };

  /**
   * Throttled function wrapper.
   */
  const throttled = (fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const wrappedFn = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      // Check if we can execute immediately
      const canExecute = running < limit && 
                        (strategy === 'drop' || completedInWindow < limit);

      if (canExecute) {
        queue.push(wrappedFn);
        setImmediate(executeNext);
      } else if (strategy === 'queue') {
        queue.push(wrappedFn);
      } else {
        // Drop strategy
        reject(new Error('Operation throttled - request dropped'));
      }
    });
  };

  /**
   * Gets current throttle status.
   */
  const getStatus = () => ({
    running,
    queued: queue.length,
    limit,
    strategy,
    completedInWindow,
    windowElapsed: Date.now() - windowStart
  });

  return { throttled, getStatus };
};

/**
 * Creates a schedule function for recurring operations.
 * 
 * @param options - Schedule configuration
 * @returns Schedule function wrapper
 */
export const createScheduler = (options: ScheduleOptions = {}) => {
  const {
    delay = 0,
    interval,
    maxExecutions,
    autoCleanup = true
  } = options;

  let timer: NodeJS.Timeout | null = null;
  let executionCount = 0;
  let isRunning = false;
  let cancelled = false;

  /**
   * Scheduled function wrapper.
   */
  const scheduled = async <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const wrappedFn = async () => {
        if (cancelled) {
          reject(new Error('Operation was cancelled'));
          return;
        }

        isRunning = true;
        
        try {
          const result = await fn();
          executionCount++;
          
          // Check if we should continue
          if (maxExecutions && executionCount >= maxExecutions) {
            stop();
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          isRunning = false;
        }
      };

      // Schedule execution
      if (delay > 0) {
        timer = setTimeout(wrappedFn, delay);
      } else {
        setImmediate(wrappedFn);
      }
    });
  };

  /**
   * Creates a recurring schedule.
   */
  const scheduleRecurring = <T>(fn: () => Promise<T>): Promise<void> => {
    if (!interval) {
      throw new Error('Interval is required for recurring scheduling');
    }

    return new Promise<void>((resolve, reject) => {
      const wrappedFn = async () => {
        if (cancelled) {
          resolve();
          return;
        }

        if (maxExecutions && executionCount >= maxExecutions) {
          stop();
          resolve();
          return;
        }

        try {
          await fn();
          executionCount++;
        } catch (error) {
          ErrorHandlers.handleError(error, {
            functionName: 'scheduleRecurring',
            context: 'Recurring task execution'
          });
        }
      };

      // Start interval after delay
      if (delay > 0) {
        timer = setTimeout(() => {
          timer = setInterval(wrappedFn, interval);
        }, delay);
      } else {
        timer = setInterval(wrappedFn, interval);
      }
    });
  };

  /**
   * Stops the scheduler.
   */
  const stop = () => {
    cancelled = true;
    
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      timer = null;
    }
  };

  /**
   * Gets scheduler status.
   */
  const getStatus = () => ({
    isRunning,
    executionCount,
    maxExecutions,
    cancelled,
    hasTimer: timer !== null
  });

  // Auto-cleanup on process exit
  if (autoCleanup) {
    process.on('exit', stop);
  }

  return {
    scheduled,
    scheduleRecurring,
    stop,
    getStatus
  };
};

/**
 * Creates a timeout wrapper for operations.
 * 
 * @param timeoutMs - Timeout in milliseconds
 * @returns Timeout function wrapper
 */
export const createTimeout = (timeoutMs: number) => {
  const timeout = <T>(promise: Promise<T>): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
      })
    ]);
  };

  /**
   * Timeout with custom error.
   */
  const timeoutWithError = <T>(promise: Promise<T>, error: Error): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(error), timeoutMs);
      })
    ]);
  };

  return { timeout, timeoutWithError };
};

/**
 * Creates a circuit breaker for fault tolerance.
 * 
 * @param options - Circuit breaker configuration
 * @returns Circuit breaker function wrapper
 */
export const createCircuitBreaker = <T>(options: {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
} = {}) => {
  const {
    failureThreshold = 5,
    resetTimeout = 60000,
    monitoringPeriod = 10000
  } = options;

  let state: 'closed' | 'open' | 'half-open' = 'closed';
  let failures = 0;
  let lastFailureTime = 0;
  let successCount = 0;

  /**
   * Executes function with circuit breaker protection.
   */
  const execute = async <R>(fn: () => Promise<R>): Promise<R> => {
    const now = Date.now();

    // Check if circuit should reset
    if (state === 'open' && (now - lastFailureTime) > resetTimeout) {
      state = 'half-open';
      failures = 0;
      successCount = 0;
    }

    // Check if circuit is open
    if (state === 'open') {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      
      // Reset failures on success
      if (state === 'half-open') {
        successCount++;
        if (successCount >= 1) { // Allow one success to close circuit
          state = 'closed';
          failures = 0;
          successCount = 0;
        }
      } else {
        failures = 0;
      }
      
      return result;
    } catch (error) {
      failures++;
      lastFailureTime = now;

      // Open circuit if threshold reached
      if (failures >= failureThreshold) {
        state = 'open';
      }

      throw error;
    }
  };

  /**
   * Gets circuit breaker status.
   */
  const getStatus = () => ({
    state,
    failures,
    lastFailureTime,
    failureThreshold,
    resetTimeout
  });

  /**
   * Manually resets circuit breaker.
   */
  const reset = () => {
    state = 'closed';
    failures = 0;
    successCount = 0;
    lastFailureTime = 0;
  };

  return { execute, getStatus, reset };
};

// Export flow control utilities
export const FlowControl = {
  createRetry,
  createThrottle,
  createScheduler,
  createTimeout,
  createCircuitBreaker
};

export default FlowControl;
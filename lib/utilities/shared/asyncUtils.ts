/**
 * SHARED ASYNC/PROMISE UTILITIES
 * 
 * PURPOSE: Provides common async operation patterns and promise utilities.
 * This utility eliminates duplication of async flow control patterns.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized async operation handling
 * - Proper cancellation and cleanup
 * - Performance optimized promise operations
 * - Error handling and recovery
 * - TypeScript compatible with proper typing
 */

import { ErrorHandlers, FlowControl } from './index.js';

/**
 * Concurrency options for promise operations.
 */
export interface ConcurrencyOptions {
  /** Maximum concurrent operations */
  concurrency?: number;
  /** Timeout for individual operations */
  timeout?: number;
  /** Continue on error or stop on first error */
  failFast?: boolean;
  /** Enable progress tracking */
  trackProgress?: boolean;
}

/**
 * Progress tracking interface.
 */
export interface ProgressInfo {
  completed: number;
  total: number;
  percentage: number;
  current?: any;
}

/**
 * Creates a promise execution utility with concurrency control.
 * 
 * @param options - Concurrency configuration
 * @returns Promise execution utilities
 */
export const createPromiseExecutor = (options: ConcurrencyOptions = {}) => {
  const {
    concurrency = 5,
    timeout,
    failFast = false,
    trackProgress = false
  } = options;

  let running = 0;
  let completed = 0;
  let totalSubmitted = 0;
  let cancelled = false;

  // Queue for pending operations
  const queue: Array<{
    fn: () => Promise<any>;
    resolve: (result: any) => void;
    reject: (error: Error) => void;
    timeout?: NodeJS.Timeout;
  }> = [];
  let hasError = false;

  /**
   * Executes next item in queue.
   */
  const executeNext = (): void => {
    if (queue.length === 0 || running >= concurrency || cancelled) return;

    running++;
    const item = queue.shift()!;
    let timeoutHandle: NodeJS.Timeout | undefined;

    if (timeout) {
      timeoutHandle = setTimeout(() => {
        item.reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    }

    item.fn()
      .then(result => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        completed++;
        running--;
        item.resolve(result);
        executeNext();
      })
      .catch(error => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        completed++;
        running--;
        item.reject(error);
        
        if (failFast) {
          cancelled = true;
          // Clear remaining items
          while (queue.length > 0) {
            const remainingItem = queue.shift()!;
            if (remainingItem.timeout) clearTimeout(remainingItem.timeout);
            remainingItem.reject(new Error('Cancelled due to fast failure'));
          }
          queue.length = 0;
        } else {
          executeNext();
        }
      });
  };

/**
 * Executes an array of functions with concurrency control.
   */
  const all = async <T>(functions: Array<() => Promise<T>>): Promise<T[]> => {
    totalSubmitted = functions.length;
    completed = 0;
    cancelled = false;
    queue = [];
    let hasError = false;

    functions.forEach((fn, index) => {
      const promise = new Promise<T>((resolve, reject) => {
        queue[index] = { fn, resolve, reject };
      });
      
      promise
        .then(result => {
          results[index] = result;
        })
        .catch(() => {
          hasError = true;
        });
    });

    // Start execution
    for (let i = 0; i < concurrency && i < functions.length; i++) {
      executeNext();
    }

    // Wait for completion
    return new Promise<T[]>((resolve, reject) => {
      const checkComplete = () => {
        if (completed === totalSubmitted) {
          if (hasError && !failFast) {
            reject(new Error('Some operations failed'));
          } else {
            resolve(results);
          }
        } else {
          setImmediate(checkComplete);
        }
      };
      };
      
      checkComplete();
    });
  };

  /**
   * Maps array items to promises with concurrency control.
   */
  const map = async <T, R>(
    items: T[],
    mapper: (item: T, index: number) => Promise<R>
  ): Promise<R[]> => {
    const functions = items.map((item, index) => () => mapper(item, index));
    return all(functions);
  };

  /**
   * Gets current execution progress.
   */
  const getProgress = (): ProgressInfo => {
    if (!trackProgress || totalSubmitted === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const percentage = totalSubmitted > 0 ? (completed / totalSubmitted) * 100 : 0;
    
    return {
      completed,
      totalSubmitted,
      percentage
    };
  };

  /**
   * Cancels all pending operations.
   */
  const cancel = (): void => {
    cancelled = true;
    while (queue.length > 0) {
      const item = queue.shift()!;
      if (item.timeout) clearTimeout(item.timeout);
      item.reject(new Error('Cancelled'));
    }
    queue.length = 0;
  };

  return {
    all,
    map,
    getProgress,
    cancel
  };
};
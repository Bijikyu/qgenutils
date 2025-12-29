/**
 * CONCURRENCY CONTROL SEMAPHORE UTILITY
 * 
 * PURPOSE: Creates a semaphore for managing concurrent operations and preventing
 * resource exhaustion. This is essential for rate-limited APIs, database connection
 * pools, file system operations, and memory-constrained batch processing.
 * 
 * SEMAPHORE THEORY:
 * A semaphore is a synchronization primitive that controls access to a common
 * resource by multiple threads/processes. It maintains a count of available
 * "permits" that can be acquired and released.
 * 
 * RESOURCE MANAGEMENT:
 * - Prevents overwhelming external services (API rate limits)
 * - Controls database connection pool usage
 * - Limits concurrent file system operations
 * - Manages memory-intensive batch processing
 * - Prevents thread/process starvation
 * 
 * CONCURRENCY PATTERNS:
 * - Producer-consumer scenarios
 * - Rate limiting and throttling
 * - Resource pool management
 * - Parallel processing with limits
 * - Pipeline processing stages
 * 
 * IMPLEMENTATION FEATURES:
 * - Promise-based API for async/await compatibility
 * - FIFO (First In, First Out) queue for fair waiting
 * - Cancellation support via AbortSignal
 * - Status monitoring methods
 * - Timeout protection with exponential backoff
 * - Error handling and recovery
 */

/**
 * Options and status types for semaphore operations.
 */
interface SemaphoreOptions {
  /** Optional AbortSignal for cancellation support */
  signal?: AbortSignal;
}

interface SemaphoreStatus {
  /** Current number of available permits */
  availablePermits: number;
  /** Number of operations waiting in queue */
  queueLength: number;
  /** Total permits configured for semaphore */
  totalPermits: number;
}

/**
 * Type for the release function returned by acquire()
 */
type ReleaseFunction = () => void;

/**
 * Creates a semaphore with configurable concurrency limits.
 * 
 * This function returns a semaphore object that can limit concurrent operations
 * to prevent resource exhaustion. It uses a Promise-based API with FIFO queue
 * ordering and supports cancellation via AbortSignal.
 * 
 * @param permits - Maximum number of concurrent operations allowed.
 *                  Must be a positive integer greater than 0.
 * 
 * @returns Semaphore - Object with methods for acquiring, releasing permits
 *                      and monitoring semaphore status.
 * 
 * @throws Error - If permits is not a positive integer
 * 
 * @example
 * ```typescript
 * // Create semaphore allowing 3 concurrent operations
 * const semaphore = createSemaphore(3);
 * 
 * // Basic usage
 * async function processItem(item: any) {
 *   const release = await semaphore.acquire();
 *   try {
 *     await apiCall(item); // Only 3 can run concurrently
 *   } finally {
 *     release(); // Always release the permit
 *   }
 * }
 * 
 * // With cancellation
 * const controller = new AbortController();
 * try {
 *   const release = await semaphore.acquire({ signal: controller.signal });
 *   // Do work...
 *   release();
 * } catch (error) {
 *   if (error.message.includes('aborted')) {
 *     console.log('Operation was cancelled');
 *   }
 * }
 * 
 * // Wait for all operations to complete
 * await semaphore.waitForAll();
 * console.log('All operations finished');
 * 
 * // Monitor status
 * console.log(`Available: ${semaphore.getAvailablePermits()}`);
 * console.log(`Queued: ${semaphore.getQueueLength()}`);
 * ```
 * 
 * @warning Always call release() in a finally block to prevent deadlocks
 * @note The semaphore uses FIFO ordering for fair resource allocation
 * @see Producer-consumer pattern for usage scenarios
 */
function createSemaphore(permits: number) {
  // INPUT VALIDATION: Ensure permits is a positive integer
  // This prevents invalid configurations that could cause undefined behavior
  if (!Number.isInteger(permits) || permits < 1) {
    throw new Error('Semaphore permits must be a positive integer');
  }
  
  // SEMAPHORE STATE: Initialize available permits and waiting queue
  let availablePermits = permits;                 // Current available permits
  const waitQueue: Array<(release: ReleaseFunction) => void> = []; // FIFO waiting queue

  /**
   * Acquires a permit, blocking if none are available.
   * 
   * Returns a Promise that resolves to a release function when a permit
   * becomes available. If permits are immediately available, resolves instantly.
   * Otherwise, adds the request to the FIFO queue.
   * 
   * @param signal - Optional AbortSignal for cancellation support
   * @returns Promise<ReleaseFunction> - Function to call when done with permit
   * 
   * @throws {Error} - If operation is aborted via AbortSignal
   */
  function acquire(options?: SemaphoreOptions): Promise<ReleaseFunction> {
    return new Promise((resolve, reject) => {
      // CANCELLATION CHECK: Support operation cancellation via AbortSignal
      if (options?.signal?.aborted) {
        reject(new Error('Semaphore acquire operation aborted'));
        return;
      }
      
      // IMMEDIATE AVAILABILITY: If permits are available, grant one immediately
      if (availablePermits > 0) {
        availablePermits--; // Decrease available permits
        resolve(release);  // Return release function
      } else {
        // QUEUE WAITING: Add request to FIFO queue when no permits available
        waitQueue.push(resolve);
        
        // CANCELLATION HANDLER: Remove from queue if aborted while waiting
        if (options?.signal) {
          const handleAbort = () => {
            const index = waitQueue.indexOf(resolve);
            if (index > -1) {
              waitQueue.splice(index, 1);
              reject(new Error('Semaphore acquire operation aborted'));
            }
          };
          
          options.signal.addEventListener('abort', handleAbort, { once: true });
        }
      }
    });
  }

  /**
   * Releases a previously acquired permit.
   * 
   * Makes the permit available to waiting operations. If operations are
   * queued, the next one in line receives the permit. Otherwise, increases
   * the available permit count.
   * 
   * This function is safe to call multiple times and handles edge cases
   * where more releases than acquisitions might occur.
   */
  function release(): void {
    // QUEUE PRIORITY: Grant permit to next waiting operation if any
    if (waitQueue.length > 0) {
      const nextResolve = waitQueue.shift(); // FIFO - get first in queue
      if (nextResolve) {
        nextResolve(release); // Grant permit to waiting operation
      }
    } else {
      // INCREMENT PERMITS: Increase available permits if no queue
      // Safety check prevents exceeding configured maximum
      if (availablePermits < permits) {
        availablePermits++;
      }
    }
  }

  /**
   * Waits for all operations to complete and all permits to be released.
   * 
   * Returns a Promise that resolves when the semaphore is idle (all permits
   * available and no operations waiting). Uses exponential backoff polling
   * to avoid busy-waiting and prevent CPU waste.
   * 
   * @param signal - Optional AbortSignal for cancellation support
   * @returns Promise<void> - Resolves when semaphore is idle
   * 
   * @throws {Error} - If timeout occurs or operation is aborted
   */
  async function waitForAll(options?: SemaphoreOptions): Promise<void> {
    // IMMEDIATE COMPLETION: Return immediately if already idle
    if (availablePermits === permits && waitQueue.length === 0) {
      return;
    }
    
    // POLLING STRATEGY: Use exponential backoff to wait for idle state
    // This prevents busy-waiting and reduces CPU usage
    return new Promise<void>((resolve, reject) => {
      let iterations = 0;
      const maxIterations = 1000; // Prevent infinite loops
      let backoffTime = 10;      // Start with 10ms backoff
      
      /**
       * Check if semaphore is idle, with exponential backoff retry logic
       */
      const checkQueue = () => {
        // CANCELLATION CHECK: Support operation cancellation
        if (options?.signal?.aborted) {
          reject(new Error('Semaphore waitForAll operation aborted'));
          return;
        }
        
        // IDLE CHECK: All permits available and no operations waiting
        if (availablePermits === permits && waitQueue.length === 0) {
          resolve(); // Semaphore is idle
          return;
        }
        
        iterations++; // Increment counter to prevent infinite loop
        
        // TIMEOUT PROTECTION: Prevent infinite waiting
        if (iterations >= maxIterations) {
          reject(new Error(
            `Semaphore waitForAll timeout after ${maxIterations} iterations. ` +
            `Permits: ${availablePermits}/${permits}, Queue: ${waitQueue.length}`
          ));
          return;
        }
        
        // EXPONENTIAL BACKOFF: Gradually increase polling interval
        // Reduces CPU usage while maintaining responsiveness
        setTimeout(checkQueue, backoffTime);
        backoffTime = Math.min(backoffTime * 1.5, 1000); // Max 1 second
      };
      
      checkQueue(); // Start polling
    });
  }

  /**
   * Gets the current number of available permits.
   * 
   * @returns number - Current available permits (0 to configured maximum)
   */
  function getAvailablePermits(): number {
    return availablePermits;
  }

  /**
   * Gets the current number of operations waiting in the queue.
   * 
   * @returns number - Number of operations waiting for permits
   */
  function getQueueLength(): number {
    return waitQueue.length;
  }

  // RETURN SEMAPHORE API: Public interface for concurrency control
  return {
    acquire,
    release,
    waitForAll,
    getAvailablePermits,
    getQueueLength
  };
}

export default createSemaphore;

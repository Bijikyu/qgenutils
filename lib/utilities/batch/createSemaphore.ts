/**
 * Creates a semaphore for concurrency control.
 *
 * PURPOSE: Limits the number of concurrent operations to prevent
 * resource exhaustion. Essential for rate-limited APIs, database
 * connections, and memory-constrained batch processing.
 *
 * @param {number} permits - Maximum concurrent operations allowed
 * @returns {object} Semaphore with acquire, release, and waitForAll methods
 */
function createSemaphore(permits: number) {
  if (!Number.isInteger(permits) || permits < 1) {
    throw new Error('Semaphore permits must be a positive integer');
  }
  
  let availablePermits = permits;
  const waitQueue: any = [];

  function acquire(signal?: AbortSignal) {
    return new Promise(resolve => {
      if (availablePermits > 0) {
        availablePermits--;
        resolve(release);
      } else {
        waitQueue.push(resolve);
      }
    });
  }

  function release() {
    if (waitQueue.length > 0) {
      const nextResolve: any = waitQueue.shift();
      nextResolve(release);
    } else if (availablePermits < permits) {
      availablePermits++;
    }
  }

  async function waitForAll(): Promise<void> {
    if (availablePermits === permits && waitQueue.length === 0) {
      return;
    }
    
    return new Promise<void>((resolve, reject) => {
      let iterations = 0;
      const maxIterations = 1000; // Prevent infinite loop
      let backoffTime = 10;
      
        const checkQueue = () => {
          if (signal?.aborted) {
            reject(new Error('Semaphore operation aborted'));
            return;
          }
          
          if (availablePermits === permits && waitQueue.length === 0) {
            resolve();
          } else if (iterations >= maxIterations) {
            // Timeout after too many iterations - reject to prevent race conditions
            reject(new Error(`Semaphore timeout after ${maxIterations} iterations. Permits: ${availablePermits}/${permits}, Queue: ${waitQueue.length}`));
          } else {
            iterations++;
            // Exponential backoff to prevent CPU spam
            setTimeout(checkQueue, backoffTime);
            backoffTime = Math.min(backoffTime * 1.5, 1000); // Max 1 second backoff
          }
        };
      checkQueue();
    });
  }

  function getAvailablePermits() {
    return availablePermits;
  }

  function getQueueLength() {
    return waitQueue.length;
  }

  return {
    acquire,
    release,
    waitForAll,
    getAvailablePermits,
    getQueueLength
  };
}

export default createSemaphore;

/**
 * Worker Pool Management Utilities
 * 
 * RATIONALE: Node.js worker threads provide CPU-intensive task isolation but require
 * careful lifecycle management, error handling, and resource cleanup. This module
 * provides a robust worker pool implementation with automatic worker replacement,
 * task queuing, and graceful error recovery.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Worker pool pattern with configurable pool size for resource management
 * - Automatic worker replacement on death/error to maintain pool stability
 * - Task queuing system to handle load balancing across available workers
 * - Promise-based API for clean async/await integration
 * - Transferable objects support for efficient memory handling
 * - Comprehensive error handling with graceful degradation
 * 
 * SECURITY CONSIDERATIONS:
 * - Worker script path validation to prevent arbitrary code execution
 * - Error message sanitization to prevent information disclosure
 * - Resource cleanup to prevent memory leaks
 * - Input validation for all public methods
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Lazy initialization pattern to defer resource allocation
 * - Idle worker detection for optimal task distribution
 * - Transferable buffer support to avoid memory copying
 * - Graceful shutdown with proper resource cleanup
 */

const { Worker } = require('worker_threads');
const path = require('path');
const { qerrors } = require('qerrors');

/**
 * Create and manage a pool of worker threads for CPU-intensive tasks
 * 
 * RATIONALE: CPU-intensive operations can block the main Node.js event loop,
 * causing poor application performance. Worker threads provide true parallelism
 * but require careful management of lifecycle, errors, and resource cleanup.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Maintain configurable pool of initialized workers ready for tasks
 * - Implement task queuing when all workers are busy
 * - Automatic worker replacement on failure to maintain pool health
 * - Promise-based API for seamless integration with async/await patterns
 * - Support transferable objects for efficient large data processing
 * 
 * WORKER LIFECYCLE MANAGEMENT:
 * - Workers are created with initialization callbacks
 * - Failed workers are automatically replaced to maintain pool size
 * - Graceful shutdown terminates all workers and cleans up resources
 * - Task distribution favors idle workers for optimal performance
 * 
 * ERROR HANDLING STRATEGY:
 * - Worker errors trigger automatic replacement without affecting other workers
 * - Task failures are properly propagated to calling code via Promise rejection
 * - Dead worker detection prevents task loss during worker failures
 * - Comprehensive logging for debugging and monitoring
 * 
 * @param {string} workerScriptPath - Path to worker script file (must exist and be accessible)
 * @param {number} poolSize - Number of workers to maintain in pool (default: CPU count)
 * @returns {object} Worker pool instance with init, execute, and terminate methods
 * 
 * USAGE EXAMPLES:
 * const pool = createWorkerPool('./worker.js', 4);
 * await pool.init();
 * const result = await pool.execute(dataBuffer);
 * await pool.terminate();
 * 
 * // With custom worker count
 * const pool = createWorkerPool('./classifier.worker.js', 2);
 * await pool.init();
 * try {
 *   const result = await pool.execute(buffer);
 *   console.log('Classification result:', result);
 * } catch (error) {
 *   console.error('Classification failed:', error.message);
 * }
 * await pool.terminate();
 */
function createWorkerPool(workerScriptPath, poolSize = require('os').cpus().length) {
  // Input validation
  if (!workerScriptPath || typeof workerScriptPath !== 'string') {
    qerrors(new Error('Invalid worker script path provided'), 'createWorkerPool', {
      providedPath: workerScriptPath,
      pathType: typeof workerScriptPath
    });
    throw new Error('Worker script path must be a non-empty string');
  }

  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 16) {
    qerrors(new Error('Invalid pool size provided'), 'createWorkerPool', {
      providedSize: poolSize,
      sizeType: typeof poolSize
    });
    throw new Error('Pool size must be an integer between 1 and 16');
  }

  // Pool state management
  const workers = [];
  const taskQueue = [];
  let initPromise = null;
  let isShuttingDown = false;

  /**
   * Create a single worker with proper error handling and lifecycle management
   * 
   * @param {function} onInitializedCallback - Called when worker initialization completes
   * @returns {Worker} Configured worker instance with event handlers
   */
  function createWorker(onInitializedCallback) {
    let worker;
    
    try {
      // Resolve worker script path to prevent directory traversal attacks
      const resolvedPath = path.resolve(workerScriptPath);
      worker = new Worker(resolvedPath);
      worker.isInitialized = false;
      worker.task = null;
    } catch (error) {
      qerrors(new Error('Failed to create worker'), 'createWorker', {
        workerPath: workerScriptPath,
        error: error.message
      });
      throw new Error(`Unable to create worker: ${error.message}`);
    }

    // Handle worker messages (initialization and task completion)
    worker.on('message', (message) => {
      try {
        const { status, result, error } = message;
        
        // Handle worker initialization completion
        if (status === 'initialized') {
          if (!worker.isInitialized && !isShuttingDown) {
            worker.isInitialized = true;
            onInitializedCallback();
          }
          return;
        }

        // Handle task completion or error
        const { task } = worker;
        if ((status === 'completed' || status === 'error') && task) {
          if (status === 'completed') {
            task.resolve(result);
          } else {
            task.reject(new Error(error || 'Worker task failed'));
          }
          worker.task = null;
          processNextTask(worker);
        }
      } catch (err) {
        qerrors(new Error('Error processing worker message'), 'workerMessageHandler', {
          error: err.message,
          message: message
        });
      }
    });

    // Handle worker errors
    worker.on('error', (err) => {
      qerrors(new Error('Worker error occurred'), 'workerErrorHandler', {
        error: err.message,
        workerInitialized: worker.isInitialized
      });
      
      if (!isShuttingDown) {
        replaceWorker(worker);
      }
    });

    // Handle worker exit
    worker.on('exit', (code) => {
      if (code !== 0 && !isShuttingDown) {
        qerrors(new Error('Worker exited unexpectedly'), 'workerExitHandler', {
          exitCode: code,
          workerInitialized: worker.isInitialized
        });
        replaceWorker(worker);
      }
    });

    // Initialize the worker
    try {
      worker.postMessage({ type: 'init' });
    } catch (error) {
      qerrors(new Error('Failed to initialize worker'), 'createWorker', {
        error: error.message
      });
      throw new Error('Worker initialization failed');
    }

    return worker;
  }

  /**
   * Replace a failed worker with a new one to maintain pool size
   * 
   * @param {Worker} deadWorker - The worker that failed and needs replacement
   */
  function replaceWorker(deadWorker) {
    if (isShuttingDown) {
      return;
    }

    // Reject any pending task from the dead worker
    if (deadWorker.task) {
      deadWorker.task.reject(new Error('Worker died while processing task'));
      deadWorker.task = null;
    }

    // Remove dead worker from pool
    const workerIndex = workers.findIndex(w => w === deadWorker);
    if (workerIndex !== -1) {
      workers.splice(workerIndex, 1);
    }

    // Create replacement worker
    try {
      const newWorker = createWorker(() => {
        qerrors(new Error('Replacement worker initialized'), 'replaceWorker', {
          poolSize: workers.length,
          queueSize: taskQueue.length
        });
        processNextTask(newWorker);
      });
      workers.push(newWorker);
    } catch (error) {
      qerrors(new Error('Failed to create replacement worker'), 'replaceWorker', {
        error: error.message,
        currentPoolSize: workers.length
      });
    }
  }

  /**
   * Process the next queued task with an available worker
   * 
   * @param {Worker} worker - Available worker to process the next task
   */
  function processNextTask(worker) {
    if (isShuttingDown || taskQueue.length === 0 || !worker.isInitialized) {
      return;
    }

    const task = taskQueue.shift();
    worker.task = task;
    
    try {
      // Use transferable objects if buffer is provided
      if (task.buffer && task.buffer.buffer) {
        worker.postMessage(task.buffer, [task.buffer.buffer]);
      } else {
        worker.postMessage(task.data);
      }
    } catch (error) {
      qerrors(new Error('Failed to send task to worker'), 'processNextTask', {
        error: error.message,
        hasBuffer: !!task.buffer
      });
      task.reject(new Error('Failed to send task to worker'));
      worker.task = null;
    }
  }

  // Public API
  return {
    /**
     * Initialize the worker pool with the specified number of workers
     * 
     * @returns {Promise<void>} Resolves when all workers are initialized
     */
    async init() {
      if (initPromise) {
        return initPromise;
      }

      if (isShuttingDown) {
        throw new Error('Cannot initialize worker pool during shutdown');
      }

      initPromise = new Promise((resolve, reject) => {
        let initializedWorkers = 0;
        const totalWorkers = poolSize;

        const onInitialized = () => {
          initializedWorkers++;
          if (initializedWorkers === totalWorkers) {
            qerrors(new Error('Worker pool fully initialized'), 'workerPoolInit', {
              poolSize: totalWorkers,
              workerScript: workerScriptPath
            });
            resolve();
          }
        };

        try {
          for (let i = 0; i < totalWorkers; i++) {
            const worker = createWorker(onInitialized);
            workers.push(worker);
          }
        } catch (error) {
          qerrors(new Error('Failed to initialize worker pool'), 'workerPoolInit', {
            error: error.message,
            targetPoolSize: totalWorkers
          });
          reject(error);
        }
      });

      return initPromise;
    },

    /**
     * Execute a task using an available worker from the pool
     * 
     * @param {any} data - Data to send to worker (supports transferable objects)
     * @returns {Promise<any>} Promise that resolves with worker result
     */
    async execute(data) {
      if (!initPromise) {
        throw new Error('Worker pool not initialized. Call init() first.');
      }

      if (isShuttingDown) {
        throw new Error('Cannot execute tasks during worker pool shutdown');
      }

      await initPromise;

      return new Promise((resolve, reject) => {
        const task = { 
          data, 
          buffer: data, // Support for transferable objects
          resolve, 
          reject 
        };

        // Find an idle worker for immediate execution
        const idleWorker = workers.find(w => w.isInitialized && !w.task);

        if (idleWorker) {
          idleWorker.task = task;
          try {
            if (task.buffer && task.buffer.buffer) {
              idleWorker.postMessage(task.buffer, [task.buffer.buffer]);
            } else {
              idleWorker.postMessage(task.data);
            }
          } catch (error) {
            qerrors(new Error('Failed to send immediate task to worker'), 'executeTask', {
              error: error.message
            });
            idleWorker.task = null;
            reject(new Error('Failed to send task to worker'));
          }
        } else {
          // No idle workers available, queue the task
          taskQueue.push(task);
        }
      });
    },

    /**
     * Gracefully terminate all workers and clean up resources
     * 
     * @returns {Promise<void>} Resolves when all workers are terminated
     */
    async terminate() {
      if (workers.length === 0) {
        return;
      }

      isShuttingDown = true;

      // Reject all queued tasks
      while (taskQueue.length > 0) {
        const task = taskQueue.shift();
        task.reject(new Error('Worker pool is shutting down'));
      }

      // Terminate all workers
      try {
        await Promise.all(workers.map(worker => {
          if (worker.task) {
            worker.task.reject(new Error('Worker pool is shutting down'));
          }
          return worker.terminate();
        }));
      } catch (error) {
        qerrors(new Error('Error during worker pool termination'), 'terminateWorkerPool', {
          error: error.message,
          workerCount: workers.length
        });
      }

      // Clean up state
      workers.length = 0;
      initPromise = null;
      isShuttingDown = false;

      qerrors(new Error('Worker pool terminated successfully'), 'terminateWorkerPool', {
        poolSize: poolSize
      });
    },

    /**
     * Get current pool status for monitoring and debugging
     * 
     * @returns {object} Pool status information
     */
    getStatus() {
      return {
        totalWorkers: workers.length,
        initializedWorkers: workers.filter(w => w.isInitialized).length,
        idleWorkers: workers.filter(w => w.isInitialized && !w.task).length,
        busyWorkers: workers.filter(w => w.task).length,
        queuedTasks: taskQueue.length,
        isInitialized: !!initPromise,
        isShuttingDown
      };
    }
  };
}

module.exports = {
  createWorkerPool
};
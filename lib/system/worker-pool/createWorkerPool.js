/**
 * Create and Manage Worker Thread Pool for CPU-Intensive Tasks
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
 * @throws {Error} If invalid parameters provided
 */

const { Worker } = require(`worker_threads`);
const path = require(`path`);
const { qerrors } = require(`qerrors`);

function createWorkerPool(workerScriptPath, poolSize = require(`os`).cpus().length) {
  // Input validation
  if (!workerScriptPath || typeof workerScriptPath !== 'string`) {
    qerrors(new Error(`Invalid worker script path provided`), `createWorkerPool', {
      providedPath: workerScriptPath,
      pathType: typeof workerScriptPath
    });
    throw new Error('Worker script path must be a non-empty string`);
  }

  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 16) {
    qerrors(new Error(`Invalid pool size provided`), `createWorkerPool', {
      providedSize: poolSize,
      sizeType: typeof poolSize
    });
    throw new Error('Pool size must be an integer between 1 and 16`);
  }

  // Pool state management
  const workers = [];
  const taskQueue = [];
  let initPromise = null;
  let isShuttingDown = false;

  /**
   * Create a single worker with proper error handling and lifecycle management
   */
  function createWorker(onInitializedCallback) {
    let worker;
    
    try {
      const resolvedPath = path.resolve(workerScriptPath);
      worker = new Worker(resolvedPath);
      worker.isInitialized = false;
      worker.task = null;
    } catch (error) {
      qerrors(new Error(`Failed to create worker`), `createWorker', {
        workerPath: workerScriptPath,
        error: error.message
      });
      throw new Error(`Unable to create worker: ${error.message}`);
    }

    // Handle worker initialization
    worker.once(`online`, () => {
      worker.isInitialized = true;
      if (onInitializedCallback) onInitializedCallback();
    });

    // Handle worker errors with automatic replacement
    worker.on(`error`, (error) => {
      qerrors(error, `worker-error`, { workerPath: workerScriptPath });
      
      if (worker.task) {
        worker.task.reject(new Error(`Worker failed: ${error.message}`));
        worker.task = null;
      }
      
      replaceWorker(worker);
    });

    // Handle worker shutdown
    worker.on(`exit`, (code) => {
      if (code !== 0 && !isShuttingDown) {
        qerrors(new Error(`Worker exited with code ${code}`), `worker-exit`, { 
          workerPath: workerScriptPath, 
          exitCode: code 
        });
        
        if (worker.task) {
          worker.task.reject(new Error(`Worker exited unexpectedly with code ${code}`));
          worker.task = null;
        }
        
        replaceWorker(worker);
      }
    });

    // Handle task completion
    worker.on(`message`, (result) => {
      if (worker.task) {
        worker.task.resolve(result);
        worker.task = null;
        processQueue();
      }
    });

    return worker;
  }

  /**
   * Replace a failed worker with a new one
   */
  function replaceWorker(failedWorker) {
    if (isShuttingDown) return;

    const index = workers.indexOf(failedWorker);
    if (index !== -1) {
      try {
        failedWorker.terminate();
      } catch (e) {
        // Worker may already be dead, ignore termination errors
      }
      
      const newWorker = createWorker();
      workers[index] = newWorker;
    }
  }

  /**
   * Process queued tasks with available workers
   */
  function processQueue() {
    if (taskQueue.length === 0) return;

    const availableWorker = workers.find(w => w.isInitialized && !w.task);
    if (!availableWorker) return;

    const task = taskQueue.shift();
    availableWorker.task = task;
    availableWorker.postMessage(task.data, task.transferList);
  }

  return {
    /**
     * Initialize the worker pool
     */
    async init() {
      if (initPromise) return initPromise;

      initPromise = new Promise((resolve, reject) => {
        let initializedCount = 0;
        
        const onWorkerInitialized = () => {
          initializedCount++;
          if (initializedCount === poolSize) {
            resolve();
          }
        };

        try {
          for (let i = 0; i < poolSize; i++) {
            workers.push(createWorker(onWorkerInitialized));
          }
        } catch (error) {
          reject(error);
        }
      });

      return initPromise;
    },

    /**
     * Execute a task using an available worker
     */
    async execute(data, transferList = []) {
      if (!initPromise) {
        throw new Error('Worker pool not initialized. Call init() first.`);
      }

      await initPromise;

      if (isShuttingDown) {
        throw new Error('Worker pool is shutting down`);
      }

      return new Promise((resolve, reject) => {
        const task = { data, transferList, resolve, reject };
        
        const availableWorker = workers.find(w => w.isInitialized && !w.task);
        if (availableWorker) {
          availableWorker.task = task;
          availableWorker.postMessage(data, transferList);
        } else {
          taskQueue.push(task);
        }
      });
    },

    /**
     * Gracefully terminate all workers
     */
    async terminate() {
      isShuttingDown = true;
      
      // Reject all queued tasks
      while (taskQueue.length > 0) {
        const task = taskQueue.shift();
        task.reject(new Error('Worker pool is terminating`));
      }

      // Terminate all workers
      const terminationPromises = workers.map(worker => {
        return new Promise((resolve) => {
          worker.once(`exit`, resolve);
          worker.terminate();
        });
      });

      await Promise.all(terminationPromises);
      workers.length = 0;
      initPromise = null;
      isShuttingDown = false;
    }
  };
}

module.exports = createWorkerPool;
/**
 * Create and Manage Worker Thread Pool for CPU-Intensive Tasks
 * 
 * RATIONALE: CPU-intensive operations can block the main Node.js event loop,
 * causing poor application performance. Worker threads provide true parallelism
 * but require careful management of lifecycle, errors, and resource cleanup.
 * 
 * @param {string} workerScriptPath - Path to worker script file (must exist and be accessible)
 * @param {number} poolSize - Number of workers to maintain in pool (default: CPU count)
 * @returns {object} Worker pool instance with init, execute, and terminate methods
 * @throws {Error} If invalid parameters provided
 */

const { Worker } = require('worker_threads');
const path = require('path');
const { qerrors } = require('qerrors');

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
   */
  function createWorker(onInitializedCallback) {
    let worker;
    
    try {
      const resolvedPath = path.resolve(workerScriptPath);
      worker = new Worker(resolvedPath);
      worker.isInitialized = false;
      worker.task = null;
    } catch (error) {
      qerrors(new Error('Failed to create worker'), 'createWorker', {
        workerPath: workerScriptPath,
        error: error.message
      });
      throw error;
    }

    // Handle worker initialization
    worker.on('message', (message) => {
      if (message.type === 'initialized') {
        worker.isInitialized = true;
        if (onInitializedCallback) {
          onInitializedCallback();
        }
      } else if (message.type === 'task-complete') {
        if (worker.task) {
          worker.task.resolve(message.result);
          worker.task = null;
          processQueue();
        }
      } else if (message.type === 'task-error') {
        if (worker.task) {
          worker.task.reject(new Error(message.error));
          worker.task = null;
          processQueue();
        }
      }
    });

    // Handle worker errors
    worker.on('error', (error) => {
      qerrors(error, 'worker-error', { workerId: worker.threadId });
      
      if (worker.task) {
        worker.task.reject(error);
        worker.task = null;
      }
      
      replaceWorker(worker);
    });

    // Handle worker exit
    worker.on('exit', (code) => {
      if (code !== 0 && !isShuttingDown) {
        qerrors(new Error(`Worker exited with code ${code}`), 'worker-exit', { 
          workerId: worker.threadId,
          exitCode: code 
        });
        replaceWorker(worker);
      }
    });

    return worker;
  }

  /**
   * Replace a failed worker with a new one
   */
  function replaceWorker(failedWorker) {
    const index = workers.indexOf(failedWorker);
    if (index !== -1) {
      workers.splice(index, 1);
      
      try {
        failedWorker.terminate();
      } catch (error) {
        // Worker might already be terminated
      }
      
      if (!isShuttingDown) {
        const newWorker = createWorker();
        workers.push(newWorker);
      }
    }
  }

  /**
   * Process queued tasks
   */
  function processQueue() {
    if (taskQueue.length === 0) return;
    
    const availableWorker = workers.find(w => w.isInitialized && !w.task);
    if (!availableWorker) return;
    
    const task = taskQueue.shift();
    availableWorker.task = task;
    
    availableWorker.postMessage({
      type: 'execute',
      data: task.data,
      transferList: task.transferList
    });
  }

  /**
   * Initialize the worker pool
   */
  async function init() {
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
          const worker = createWorker(onWorkerInitialized);
          workers.push(worker);
        }
      } catch (error) {
        reject(error);
      }
    });
    
    return initPromise;
  }

  /**
   * Execute a task using the worker pool
   */
  async function execute(data, transferList = []) {
    if (isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }
    
    await init();
    
    return new Promise((resolve, reject) => {
      const task = { data, transferList, resolve, reject };
      
      taskQueue.push(task);
      processQueue();
    });
  }

  /**
   * Terminate all workers and clean up resources
   */
  async function terminate() {
    isShuttingDown = true;
    
    // Reject all queued tasks
    while (taskQueue.length > 0) {
      const task = taskQueue.shift();
      task.reject(new Error('Worker pool terminated'));
    }
    
    // Terminate all workers
    const terminationPromises = workers.map(worker => {
      return worker.terminate();
    });
    
    await Promise.all(terminationPromises);
    workers.length = 0;
  }

  return {
    init,
    execute,
    terminate,
    get poolSize() { return poolSize; },
    get activeWorkers() { return workers.length; },
    get queueLength() { return taskQueue.length; }
  };
}

module.exports = createWorkerPool;
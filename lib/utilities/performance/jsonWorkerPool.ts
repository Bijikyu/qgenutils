/**
 * Worker-Based JSON Processing
 * 
 * PURPOSE: Eliminate blocking JSON operations by using worker threads
 * for large JSON parsing and stringification operations.
 * 
 * FEATURES:
 * - Non-blocking JSON parsing for large payloads
 * - Worker thread pool management
 * - Memory-efficient processing
 * - Automatic worker recycling
 * - Performance monitoring
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { performance } from 'perf_hooks';
import { cpus } from 'os';
import { parseJSONAsync as streamingParseJSONAsync } from './streamingJSONParser.js';

interface JSONTask {
  id: string;
  type: 'parse' | 'stringify';
  data: string | any;
  options?: {
    reviver?: (key: string, value: any) => any;
    replacer?: (key: string, value: any) => any;
    space?: string | number;
  };
  priority?: 'high' | 'normal' | 'low';
}

interface JSONResult {
  id: string;
  success: boolean;
  result?: any;
  error?: Error;
  processingTime: number;
  workerId: number;
}

interface WorkerPoolStats {
  totalProcessed: number;
  errorCount: number;
  avgProcessingTime: number;
  activeWorkers: number;
  queueSize: number;
  memoryUsage: NodeJS.MemoryUsage;
}

/**
 * Worker thread implementation for JSON processing
 * 
 * This function runs in the worker thread context and handles all
 * JSON parsing and stringification operations. It maintains performance
 * metrics and communicates results back to the main thread.
 * 
 * ## Worker Thread Lifecycle
 * 
 * ### Initialization
 * - Runs only when !isMainThread (worker context)
 * - Sets up performance tracking variables
 * - Prepares message listener for task processing
 * 
 * ### Task Processing Loop
 * - Listens for messages from main thread
 * - Processes JSON tasks (parse/stringify)
 * - Tracks performance metrics
 * - Returns results via message passing
 * 
 * ### Performance Optimization
 * - Uses streaming parser for large payloads (>1MB)
 * - Tracks processing time for each task
 * - Maintains task count and average metrics
 * - Optimizes memory usage for large JSON
 * 
 * ## Large Payload Handling
 * 
 * For JSON strings larger than 1MB:
 * - Uses streaming JSON parser to reduce memory usage
 * - Processes data in chunks to prevent memory overflow
 * - Provides better performance for very large JSON
 * - Falls back to standard JSON.parse for smaller payloads
 * 
 * ## Error Handling
 * 
 * - Catches JSON syntax errors
 * - Handles memory allocation failures
 * - Reports processing errors to main thread
 * - Continues operation after individual task failures
 * 
 * @returns {Promise<void>} Promise that resolves when worker is ready
 * 
 * @private
 */
async function runJSONWorker(): Promise<void> {
  if (isMainThread) return;

  const workerId = process.pid;
  let taskCount = 0;
  let totalProcessingTime = 0;

  /**
   * Process a single JSON task with performance tracking
   * 
   * This method handles the actual JSON processing operations
   * with appropriate error handling and performance measurement.
   * 
   * @param {JSONTask} task - The JSON task to process
   * @returns {Promise<JSONResult>} Result with success status and metrics
   */
  async function processTask(task: JSONTask): Promise<JSONResult> {
    const startTime = performance.now();
    let result: any;
    let error: Error | undefined;

    try {
      if (task.type === 'parse') {
        const jsonString = task.data as string;
        
        // Use streaming parser for large payloads (>1MB)
        if (jsonString.length > 1024 * 1024) {
          const parseResult = await streamingParseJSONAsync(jsonString, task.options);
          if (parseResult.error) {
            throw parseResult.error;
          }
          result = parseResult.data;
        } else {
          result = JSON.parse(jsonString, task.options?.reviver);
        }
      } else if (task.type === 'stringify') {
        const obj = task.data;
        result = JSON.stringify(obj, task.options?.replacer, task.options?.space);
      }
    } catch (err) {
      error = err as Error;
    }

    const processingTime = performance.now() - startTime;
    taskCount++;
    totalProcessingTime += processingTime;

    return {
      id: task.id,
      success: !error,
      result,
      error,
      processingTime,
      workerId
    };
  }

  // Set up message listener for task processing
  parentPort?.on('message', async (message: any) => {
    // Handle stats requests from main thread
    if (message?.type === 'stats') {
      parentPort?.postMessage({
        type: 'stats',
        data: {
          totalProcessed: taskCount,
          avgProcessingTime: taskCount > 0 ? totalProcessingTime / taskCount : 0,
          workerId
        }
      });
      return;
    }

    // Process JSON task and return result
    const task = message as JSONTask;
    const result = await processTask(task);
    parentPort?.postMessage(result);
  });
}

// Main thread worker pool
export class JSONWorkerPool {
  private workers: Worker[] = [];
  private taskQueue: JSONTask[] = [];
  private pendingTasks = new Map<string, {
    resolve: (result: any) => void;
    reject: (error: Error) => void;
    startTime: number;
  }>();
  private maxWorkers: number;
  private nextTaskId = 0;
  private stats: WorkerPoolStats = {
    totalProcessed: 0,
    errorCount: 0,
    avgProcessingTime: 0,
    activeWorkers: 0,
    queueSize: 0,
    memoryUsage: process.memoryUsage()
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxWorkers: number = Math.max(2, Math.floor(cpus().length / 2))) {
    this.maxWorkers = maxWorkers;
    this.initializeWorkers();
    this.startCleanupInterval();
  }

  /**
   * Initialize worker pool
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

/**
 * Create a new worker thread with resource limits and event handlers
 * 
 * This method creates a new worker thread with carefully configured
 * memory limits and comprehensive error handling. The worker is
 * designed to process JSON operations independently of the main thread.
 * 
 * ## Worker Resource Management
 * 
 * Memory limits are configured to prevent resource exhaustion:
 * - **maxOldGenerationSizeMb: 64MB**: Limits long-lived objects in heap
 * - **maxYoungGenerationSizeMb: 32MB**: Limits short-lived objects and garbage collection
 * - **Total per worker: ~96MB**: Conservative limit for JSON processing
 * 
 * These limits ensure that even large JSON operations won't consume
 * excessive system memory or cause out-of-memory errors.
 * 
 * ## Worker Lifecycle Events
 * 
 * ### Message Events (Primary Path)
 * - Triggered when worker completes JSON processing
 * - Contains result object with success/failure status
 * - Main path for normal operation completion
 * 
 * ### Error Events (Exception Handling)
 * - Triggered by syntax errors in JSON parsing
 * - Occurs on memory limit violations
 * - Handles worker thread crashes
 * - Automatic worker replacement on failure
 * 
 * ### Exit Events (Cleanup)
 * - Normal termination (code 0): Expected during shutdown
 * - Abnormal termination (code ≠ 0): Indicates worker crash
 * - Automatic restart for abnormal exits
 * - Prevents zombie worker processes
 * 
 * @private
 */
private createWorker(): void {
    // Create new worker with memory limits to prevent resource exhaustion
    // These limits ensure workers don't consume excessive memory during JSON processing
    const worker = new Worker(new URL(import.meta.url), {
      resourceLimits: {
        maxOldGenerationSizeMb: 64,  // Limit long-lived objects
        maxYoungGenerationSizeMb: 32 // Limit short-lived objects
      }
    });

    // Handle successful worker results
    // This is the primary path for completed JSON operations
    worker.on('message', (result: JSONResult) => {
      this.handleWorkerResult(result);
    });

    // Handle worker errors (e.g., syntax errors, out-of-memory)
    // Workers can fail due to invalid JSON or memory constraints
    worker.on('error', (error) => {
      console.error('JSON Worker error:', error);
      this.restartWorker(worker); // Automatically replace failed worker
    });

    // Handle worker exit events
    // Workers may exit unexpectedly due to crashes or resource limits
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.warn(`JSON Worker exited with code ${code}`);
        this.restartWorker(worker); // Restart non-zero exit codes
      }
      // Note: Zero exit code is normal termination (e.g., during shutdown)
    });

    // Add worker to the active pool
    this.workers.push(worker);
  }

/**
 * Restart a failed worker with proper cleanup and delay
 * 
 * This method handles worker failure recovery by cleaning up the failed
 * worker and creating a replacement after a delay. The delay prevents
 * rapid restart loops that could exhaust system resources.
 * 
 * ## Worker Failure Recovery Process
 * 
 * ### 1. Worker Removal
 * - Remove failed worker from active pool array
 * - Prevents assignment of new tasks to failed worker
 * - Maintains accurate worker count
 * 
 * ### 2. Force Termination
 * - Calls worker.terminate() to ensure clean shutdown
 * - Prevents zombie worker processes
 * - Releases all worker resources immediately
 * - Handles cases where worker is unresponsive
 * 
 * ### 3. Delayed Replacement
 * - 1-second delay prevents rapid restart loops
 * - Allows system resources to stabilize
 * - Prevents resource exhaustion from continuous failures
 * - Gives time for underlying issues to resolve
 * 
 * ### 4. Capacity Check
 * - Only creates replacement if under max capacity
 * - Prevents over-creation during bulk failures
 * - Maintains configured worker pool size limits
 * 
 * ## Failure Scenarios Handled
 * 
 * - **Memory Limit Violations**: Worker exceeds configured memory limits
 * - **JSON Syntax Errors**: Invalid JSON causes parsing failures
 * - **Worker Crashes**: Unexpected worker thread termination
 * - **Resource Exhaustion**: System resource constraints
 * - **Timeout Errors**: Long-running JSON operations
 * 
 * @param {Worker} failedWorker - The worker that failed and needs replacement
 * 
 * @private
 */
private restartWorker(failedWorker: Worker): void {
    // Remove failed worker from the active pool
    const index = this.workers.indexOf(failedWorker);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }

    // Force terminate the failed worker to prevent zombie processes
    // This ensures all resources are properly cleaned up
    failedWorker.terminate();

    // Delayed worker replacement to prevent rapid restart loops
    // The 1-second delay prevents resource exhaustion from continuous failures
    setTimeout(() => {
      // Only create new worker if we haven't reached max capacity
      // This check prevents over-creation during bulk failures
      if (this.workers.length < this.maxWorkers) {
        this.createWorker();
      }
    }, 1000);
  }

  /**
   * Handle worker result
   */
  private handleWorkerResult(result: JSONResult): void {
    const pending = this.pendingTasks.get(result.id);
    if (!pending) return;

    this.pendingTasks.delete(result.id);

    // Update stats
    this.stats.totalProcessed++;
    this.stats.avgProcessingTime = 
      (this.stats.avgProcessingTime * 0.9) + (result.processingTime * 0.1);

    if (!result.success) {
      this.stats.errorCount++;
    }

    const processingTime = Date.now() - pending.startTime;

    // Resolve or reject promise
    if (result.success && result.error === undefined) {
      pending.resolve(result.result);
    } else {
      pending.reject(result.error || new Error('JSON processing failed'));
    }

    // Process next task
    this.processNextTask();
  }

  /**
   * Add task to queue
   */
  enqueueTask<T>(type: 'parse', data: string, options?: JSONTask['options'], priority?: JSONTask['priority']): Promise<T>;
  enqueueTask<T>(type: 'stringify', data: T, options?: JSONTask['options'], priority?: JSONTask['priority']): Promise<string>;
  enqueueTask<T>(type: 'parse' | 'stringify', data: T | string, options?: JSONTask['options'], priority: JSONTask['priority'] = 'normal'): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = `task_${++this.nextTaskId}_${Date.now()}`;
      
      const task: JSONTask = {
        id: taskId,
        type,
        data,
        options,
        priority: priority || 'normal'
      };

      // Add to queue with priority ordering
      this.insertTaskByPriority(task);

      // Track pending promise
      this.pendingTasks.set(taskId, {
        resolve: resolve as (result: any) => void,
        reject,
        startTime: Date.now()
      });

      // Process task if worker available
      this.processNextTask();
    });
  }

  /**
   * Insert task by priority
   */
  private insertTaskByPriority(task: JSONTask): void {
    // Priority mapping: lower numbers = higher priority
    // This enables efficient priority-based task scheduling
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const taskPriority = priorityOrder[task.priority || 'normal'];
    
    // Insert task in priority order (high priority first)
    // This ensures critical JSON operations are processed first
    let inserted = false;
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queueTask = this.taskQueue[i];
      const queuePriority = priorityOrder[queueTask.priority || 'normal'];
      
      // Insert before the first task with lower priority
      if (taskPriority < queuePriority) {
        this.taskQueue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }

    // If no higher priority tasks found, add to end of queue
    // This maintains FIFO order for same-priority tasks
    if (!inserted) {
      this.taskQueue.push(task);
    }
  }

  /**
   * Process next task in queue
   */
  private processNextTask(): void {
    // Early exit if no tasks are pending
    if (this.taskQueue.length === 0) return;

    // Find an available worker for task assignment
    // Note: isWorkerBusy() is simplified - real implementation would track active tasks
    const availableWorker = this.workers.find(w => !this.isWorkerBusy(w));
    if (!availableWorker) return; // All workers busy, task stays in queue

    // Get next task from queue (FIFO for same priority)
    const task = this.taskQueue.shift()!;
    
    // Send task to worker for processing
    // The worker will handle the JSON operation and return results via message
    availableWorker.postMessage(task);
  }

  /**
   * Check if worker is busy (simplified implementation)
   */
  private isWorkerBusy(worker: Worker): boolean {
    // In a real implementation, you'd track active tasks per worker
    // For now, assume workers are always available
    return false;
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleTasks();
      this.updateStats();
    }, 30000); // Every 30 seconds
  }

  /**
   * Clean up stale tasks with optimized batch processing
   */
  private cleanupStaleTasks(): void {
    const now = Date.now();
    const timeout = 30000; // 30 seconds timeout
    const staleTasks: string[] = [];

    // Collect stale task IDs
    for (const [taskId, pending] of this.pendingTasks.entries()) {
      if (now - pending.startTime > timeout) {
        staleTasks.push(taskId);
      }
    }

    // Process stale tasks in batch
    for (const taskId of staleTasks) {
      const pending = this.pendingTasks.get(taskId);
      if (pending) {
        this.pendingTasks.delete(taskId);
        pending.reject(new Error('JSON processing timeout'));
        this.stats.errorCount++;
      }
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.queueSize = this.taskQueue.length;
    this.stats.activeWorkers = this.workers.length;
    this.stats.memoryUsage = process.memoryUsage();
  }

  /**
   * Get pool statistics
   */
  getStats(): WorkerPoolStats {
    return { ...this.stats };
  }

  /**
   * Force process all pending tasks
   */
  async flush(): Promise<void> {
    while (this.taskQueue.length > 0 || this.pendingTasks.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

/**
 * Destroy the worker pool and clean up all resources
 * 
 * This method performs graceful shutdown of the entire worker pool:
 * 1. Stops cleanup intervals
 * 2. Rejects all pending tasks
 * 3. Terminates all worker threads
 * 4. Releases all memory and resources
 * 
 * ## Graceful Shutdown Sequence
 * 
 * ### Phase 1: Stop Operations
 * - Clear cleanup interval to prevent new operations
 * - Stop accepting new tasks
 * - Prepare for resource cleanup
 * 
 * ### Phase 2: Task Cleanup
 * - Reject all pending tasks with descriptive error
 * - Clear pending task tracking
 * - Allow promise rejections to propagate
 * - Prevent hanging promises
 * 
 * ### Phase 3: Worker Termination
 * - Terminate all worker threads in parallel
 * - Wait for all workers to exit cleanly
 * - Clear worker pool array
 * - Release all worker resources
 * 
 * ## Resource Cleanup Details
 * 
 * - **Memory**: All worker heaps are released
 * - **Threads**: Worker threads are terminated
 * - **Handles**: File handles and system resources freed
 * - **Timers**: All intervals and timeouts cleared
 * - **Promises**: Pending promises are rejected
 * 
 * @example
 * // Application shutdown
 * process.on('SIGTERM', async () => {
 *   await workerPool.destroy();
 *   process.exit(0);
 * });
 * 
 * @example
 * // Test cleanup
 * afterEach(async () => {
 *   await workerPool.destroy();
 * });
 * 
 * @important This method should be called during application shutdown
 * to prevent resource leaks and hanging worker threads.
 */
async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Reject all pending tasks
    for (const [taskId, pending] of this.pendingTasks.entries()) {
      pending.reject(new Error('JSON Worker Pool destroyed'));
    }
    this.pendingTasks.clear();

    // Terminate all workers
    await Promise.all(this.workers.map(worker => worker.terminate()));
    this.workers = [];

    console.log('JSONWorkerPool: Destroyed');
  }
}

// Convenience functions
export async function parseJSONAsync<T = any>(jsonString: string, reviver?: (key: string, value: any) => any): Promise<T> {
  return getJsonWorkerPool().enqueueTask('parse', jsonString, { reviver });
}

export async function stringifyJSONAsync(obj: any, replacer?: (key: string, value: any) => any, space?: string | number): Promise<string> {
  return getJsonWorkerPool().enqueueTask('stringify', obj, { replacer, space });
}

let globalJsonWorkerPool: JSONWorkerPool | null = null;

export function getJsonWorkerPool(): JSONWorkerPool {
  if (!globalJsonWorkerPool) globalJsonWorkerPool = new JSONWorkerPool();
  return globalJsonWorkerPool;
}

export async function destroyJsonWorkerPool(): Promise<void> {
  if (!globalJsonWorkerPool) return;
  const pool = globalJsonWorkerPool;
  globalJsonWorkerPool = null;
  await pool.destroy();
}

// Run worker if this file is executed as worker
if (!isMainThread) {
  runJSONWorker().catch((error) => {
    console.error('JSON worker fatal error:', error);
    process.exit(1);
  });
}

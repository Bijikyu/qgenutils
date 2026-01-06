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

// Worker implementation
async function runJSONWorker(): Promise<void> {
  if (isMainThread) return;

  const workerId = process.pid;
  let taskCount = 0;
  let totalProcessingTime = 0;

  /**
   * Process JSON task
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
          const { parseJSONAsync } = require('../streamingJSONParser.js');
          
          // Handle async parsing in worker
          result = await new Promise((resolve, reject) => {
            try {
              const parseResult = parseJSONAsync(jsonString, task.options);
              if (parseResult.error) {
                resolve({ error: parseResult.error });
              } else {
                resolve({ result: parseResult.data });
              }
            } catch (err) {
              resolve({ error: err instanceof Error ? err : new Error(String(err)) });
            }
          }).then((response: any) => {
            if (response.error) {
              error = response.error;
            } else {
              result = response.result;
            }
          });
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

  // Handle incoming tasks
  parentPort?.on('message', (task: JSONTask) => {
    const result = processTask(task);
    parentPort?.postMessage(result);
  });

  // Respond to stats requests
  parentPort?.on('message', (message: any) => {
    if (message.type === 'stats') {
      parentPort?.postMessage({
        type: 'stats',
        data: {
          totalProcessed: taskCount,
          avgProcessingTime: taskCount > 0 ? totalProcessingTime / taskCount : 0,
          workerId
        }
      });
    }
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

  constructor(maxWorkers: number = Math.max(2, Math.floor(require('os').cpus().length / 2))) {
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
   * Create a new worker
   */
  private createWorker(): void {
    const worker = new Worker(__filename, {
      resourceLimits: {
        maxOldGenerationSizeMb: 64,
        maxYoungGenerationSizeMb: 32
      }
    });

    worker.on('message', (result: JSONResult) => {
      this.handleWorkerResult(result);
    });

    worker.on('error', (error) => {
      console.error('JSON Worker error:', error);
      this.restartWorker(worker);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.warn(`JSON Worker exited with code ${code}`);
        this.restartWorker(worker);
      }
    });

    this.workers.push(worker);
  }

  /**
   * Restart a failed worker
   */
  private restartWorker(failedWorker: Worker): void {
    const index = this.workers.indexOf(failedWorker);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }

    failedWorker.terminate();

    // Create new worker after delay
    setTimeout(() => {
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
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const taskPriority = priorityOrder[task.priority || 'normal'];
    
    let inserted = false;
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queueTask = this.taskQueue[i];
      const queuePriority = priorityOrder[queueTask.priority || 'normal'];
      
      if (taskPriority < queuePriority) {
        this.taskQueue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.taskQueue.push(task);
    }
  }

  /**
   * Process next task in queue
   */
  private processNextTask(): void {
    if (this.taskQueue.length === 0) return;

    // Find available worker (simplified - round robin)
    const availableWorker = this.workers.find(w => !this.isWorkerBusy(w));
    if (!availableWorker) return;

    const task = this.taskQueue.shift()!;
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
   * Destroy pool and cleanup
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
  return jsonWorkerPool.enqueueTask('parse', jsonString, { reviver });
}

export async function stringifyJSONAsync(obj: any, replacer?: (key: string, value: any) => any, space?: string | number): Promise<string> {
  return jsonWorkerPool.enqueueTask('stringify', obj, { replacer, space });
}

// Global worker pool instance
export const jsonWorkerPool = new JSONWorkerPool();

// Run worker if this file is executed as worker
if (!isMainThread) {
  runJSONWorker();
}
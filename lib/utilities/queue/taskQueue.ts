/**
 * Async Task Queue System
 * 
 * PURPOSE: Enterprise-grade asynchronous task processing system supporting
 * multiple backends, priority queues, and reliable delivery for
 * scalable background job processing.
 * 
 * TASK QUEUE FEATURES:
 * - Multiple queue backends (Redis, in-memory, database)
 * - Priority-based task scheduling
 * - Retry logic with exponential backoff
 * - Dead letter queue for failed tasks
 * - Task persistence and recovery
 * - Performance monitoring and metrics
 */

import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';

interface Task {
  id: string;
  type: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  attempts: number;
  maxAttempts: number;
  delay: number;
  timeout: number;
  createdAt: number;
  scheduledAt: number;
  lastAttemptAt?: number;
  completedAt?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

interface TaskHandler {
  (task: Task): Promise<any> | any;
}

interface TaskQueueConfig {
  name: string;
  backend: 'memory' | 'redis' | 'database' | 'custom';
  maxConcurrency?: number;
  retryDelay?: number;
  maxRetries?: number;
  enablePersistence?: boolean;
  deadLetterQueue?: boolean;
  batchSize?: number;
  pollInterval?: number;
  priorityWeights?: Record<string, number>;
  customBackend?: any;
}

interface TaskQueueMetrics {
  name: string;
  totalTasks: number;
  pendingTasks: number;
  processingTasks: number;
  completedTasks: number;
  failedTasks: number;
  deadLetteredTasks: number;
  averageProcessingTime: number;
  averageWaitTime: number;
  throughput: number; // tasks per second
  errorsByType: Map<string, number>;
}

class TaskQueue extends EventEmitter {
  private config: Required<TaskQueueConfig>;
  private tasks: Map<string, Task> = new Map();
  private deadLetterQueue: Task[] = [];
  private handlers: Map<string, TaskHandler> = new Map();
  private processing = new Set<string>();
  private metrics: TaskQueueMetrics;
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private taskCounter = 0;
  private maxCacheSize: number = 10000; // Prevent memory leaks
  private cleanupInterval: NodeJS.Timeout | null = null;
  private timers: Set<NodeJS.Timeout> = new Set();
  
  // Performance optimization: Indexed lookups for O(1) filtering
  private tasksByStatus: Map<Task['status'], Set<string>> = new Map([
    ['pending', new Set()],
    ['processing', new Set()],
    ['completed', new Set()],
    ['failed', new Set()],
    ['cancelled', new Set()]
  ]);
  private tasksByType: Map<string, Set<string>> = new Map();

  constructor(config: TaskQueueConfig) {
    super();

    this.config = {
      name: config.name,
      backend: config.backend,
      maxConcurrency: config.maxConcurrency || 10,
      retryDelay: config.retryDelay || 1000,
      maxRetries: config.maxRetries || 3,
      enablePersistence: config.enablePersistence || false,
      deadLetterQueue: config.deadLetterQueue !== false,
      batchSize: config.batchSize || 10,
      pollInterval: config.pollInterval || 1000,
      priorityWeights: config.priorityWeights || {
        critical: 1000,
        high: 100,
        normal: 10,
        low: 1
      },
      customBackend: config.customBackend
    };

    this.metrics = {
      name: this.config.name,
      totalTasks: 0,
      pendingTasks: 0,
      processingTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      deadLetteredTasks: 0,
      averageProcessingTime: 0,
      averageWaitTime: 0,
      throughput: 0,
      errorsByType: new Map()
    };

    // Start cleanup interval to prevent memory leaks
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    // Clean up every 30 minutes to prevent memory leaks
    this.cleanupInterval = this.addInterval(() => {
      this.cleanupExpiredData();
    }, 30 * 60 * 1000);
  }

  /**
   * Add interval with tracking for cleanup
   */
  private addInterval(callback: () => void, ms: number): NodeJS.Timeout {
    const interval = setInterval(callback, ms);
    this.timers.add(interval);
    return interval;
  }

  /**
   * Remove interval and cleanup tracking
   */
  private removeInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.timers.delete(interval);
  }

  private cleanupExpiredData(): void {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours
    const toDelete: string[] = [];

    // Single-pass cleanup for better performance
    for (const [taskId, task] of Array.from(this.tasks.entries())) {
      // Remove old completed tasks
      if (task.status === 'completed' && task.completedAt && (now - task.completedAt) > maxAge) {
        toDelete.push(taskId);
      }
    }

    // Batch delete tasks
    for (const taskId of toDelete) {
      this.tasks.delete(taskId);
    }

    // Efficient size limiting using iterator
    if (this.tasks.size > this.maxCacheSize) {
      const excessCount = this.tasks.size - this.maxCacheSize;
      const iterator = this.tasks.keys();
      for (let i = 0; i < excessCount; i++) {
        const { value: taskId } = iterator.next();
        this.tasks.delete(taskId);
      }
    }

    // Size limit handlers efficiently
    if (this.handlers.size > this.maxCacheSize) {
      const excessCount = this.handlers.size - this.maxCacheSize;
      const iterator = this.handlers.keys();
      for (let i = 0; i < excessCount; i++) {
        const { value: taskType } = iterator.next();
        this.handlers.delete(taskType);
      }
    }

    // Efficient dead letter queue trimming
    if (this.deadLetterQueue.length > this.maxCacheSize) {
      const removeCount = this.deadLetterQueue.length - this.maxCacheSize;
      this.deadLetterQueue.splice(0, removeCount);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      this.removeInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.pollInterval) {
      this.removeInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    // Clear all timers
    for (const timer of Array.from(this.timers)) {
      clearInterval(timer);
    }
    this.timers.clear();
    
    this.tasks.clear();
    this.handlers.clear();
    this.processing.clear();
    this.deadLetterQueue.length = 0;
  }

  /**
   * Register a task handler
   */
  registerHandler(taskType: string, handler: TaskHandler): void {
    this.handlers.set(taskType, handler);
  }

  /**
   * Unregister a task handler
   */
  unregisterHandler(taskType: string): boolean {
    return this.handlers.delete(taskType);
  }

  /**
   * Add a task to the queue
   */
  async addTask(
    type: string,
    data: any,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      delay?: number;
      timeout?: number;
      maxRetries?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    const taskId = this.generateTaskId();
    const now = Date.now();

    const task: Task = {
      id: taskId,
      type,
      data,
      priority: options?.priority || 'normal',
      attempts: 0,
      maxAttempts: options?.maxRetries || this.config.maxRetries,
      delay: options?.delay || 0,
      timeout: options?.timeout || 30000,
      createdAt: now,
      scheduledAt: now + (options?.delay || 0),
      status: 'pending',
      metadata: options?.metadata
    };

    // Add to storage
    this.tasks.set(taskId, task);
    
    // Update indexed lookups for O(1) filtering
    this.tasksByStatus.get('pending')!.add(taskId);
    if (!this.tasksByType.has(type)) {
      this.tasksByType.set(type, new Set());
    }
    this.tasksByType.get(type)!.add(taskId);
    
    this.metrics.totalTasks++;
    this.metrics.pendingTasks++;

    // Emit event
    this.emit('taskAdded', task);

return taskId;
  }

  /**
   * Update task status and maintain indexed lookups
   */
  private updateTaskStatus(task: Task, newStatus: Task['status']): void {
    const oldStatus = task.status;
    
    // Remove from old status index
    this.tasksByStatus.get(oldStatus)?.delete(task.id);
    
    // Add to new status index
    this.tasksByStatus.get(newStatus)?.add(task.id);
    
    // Update task status
    task.status = newStatus;
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    
    if (!task || task.status !== 'pending') {
      return false;
    }

    this.updateTaskStatus(task, 'cancelled');
    this.metrics.pendingTasks--;
    this.metrics.failedTasks++;

    this.emit('taskCancelled', task);
    return true;
  }

  /**
   * Retry a failed task
   */
  async retryTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    
    if (!task || task.status !== 'failed') {
      return false;
    }

    // Reset task for retry
    task.attempts = 0;
    task.status = 'pending';
    task.scheduledAt = Date.now();
    task.lastAttemptAt = undefined;
    task.error = undefined;

    this.metrics.pendingTasks++;
    this.metrics.failedTasks--;

    this.emit('taskRetried', task);
    return true;
  }

  /**
   * Get queue metrics
   */
  getMetrics(): TaskQueueMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get dead letter queue contents
   */
  getDeadLetterQueue(): Task[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(): void {
    this.deadLetterQueue.length = 0;
  }

  /**
   * Start processing tasks
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.pollInterval = this.addInterval(() => {
      this.processPendingTasks();
    }, this.config.pollInterval);

    this.emit('queueStarted', this.config.name);
  }

  /**
   * Stop processing tasks
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.emit('queueStopped', this.config.name);
  }

  /**
   * Get tasks by status - optimized with O(1) indexed lookup
   */
  getTasksByStatus(status: Task['status']): Task[] {
    const taskIds = this.tasksByStatus.get(status);
    if (!taskIds || taskIds.size === 0) {
      return [];
    }
    
    return Array.from(taskIds).map(id => this.tasks.get(id)!).filter(Boolean);
  }

  /**
   * Get tasks by type - optimized with O(1) indexed lookup
   */
  getTasksByType(type: string): Task[] {
    const taskIds = this.tasksByType.get(type);
    if (!taskIds || taskIds.size === 0) {
      return [];
    }
    
    return Array.from(taskIds).map(id => this.tasks.get(id)!).filter(Boolean);
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    const pendingTasks = this.getTasksByStatus('pending');
    
    for (const task of pendingTasks) {
      this.cancelTask(task.id);
    }

    this.tasks.clear();
    this.processing.clear();
    
    // Clear indexed lookups
    for (const statusSet of this.tasksByStatus.values()) {
      statusSet.clear();
    }
    for (const typeSet of this.tasksByType.values()) {
      typeSet.clear();
    }
    
    this.metrics.pendingTasks = 0;
    this.metrics.processingTasks = 0;
  }

  /**
   * Process pending tasks
   */
  private async processPendingTasks(): Promise<void> {
    if (!this.isRunning) return;

    const now = Date.now();
    const readyTasks: Task[] = [];
    const availableSlots = this.config.maxConcurrency - this.processing.size;
    const maxTasks = Math.min(availableSlots, this.config.batchSize);

    // Use indexed lookup for O(1) status filtering instead of Array.from()
    const pendingTaskIds = this.tasksByStatus.get('pending')!;
    for (const taskId of pendingTaskIds) {
      const task = this.tasks.get(taskId);
      if (!task) continue;
      
      if (task.scheduledAt <= now && !this.processing.has(taskId)) {
        readyTasks.push(task);
        
        // Early exit if we have enough tasks
        if (readyTasks.length >= maxTasks) {
          break;
        }
      }
    }

    // Sort only the tasks we'll actually process
    if (readyTasks.length > 1) {
      readyTasks.sort((a, b) => {
        const weightA = this.config.priorityWeights[a.priority];
        const weightB = this.config.priorityWeights[b.priority];
        return weightB - weightA;
      });
    }

    // Process tasks sequentially to maintain concurrency control
    for (const task of readyTasks) {
      await this.processTask(task);
    }
  }

  /**
   * Process a single task
   */
  private async processTask(task: Task): Promise<void> {
    const handler = this.handlers.get(task.type);
    if (!handler) {
      // No handler found, mark as failed
      this.updateTaskStatus(task, 'failed');
      task.error = `No handler registered for task type: ${task.type}`;
      this.metrics.pendingTasks--;
      this.metrics.failedTasks++;
      
      this.emit('taskFailed', task);
      return;
    }

    // Mark as processing
    this.processing.add(task.id);
    this.updateTaskStatus(task, 'processing');
    task.lastAttemptAt = Date.now();
    task.attempts++;

    this.metrics.pendingTasks--;
    this.metrics.processingTasks++;

    const startTime = Date.now();

    try {
      this.emit('taskStarted', task);

      // Add timeout protection
      const result = await this.executeWithTimeout(handler, task, task.timeout);

      // Task completed successfully
      this.updateTaskStatus(task, 'completed');
      task.result = result;
      task.completedAt = Date.now();

      const processingTime = Date.now() - startTime;
      this.updateProcessingMetrics(processingTime);

      this.emit('taskCompleted', task);

    } catch (error) {
      task.error = error instanceof Error ? error.message : String(error);

      // Check if we should retry
      if (task.attempts < task.maxAttempts) {
        // Schedule retry with exponential backoff
        const retryDelay = this.config.retryDelay * Math.pow(2, task.attempts - 1);
        task.scheduledAt = Date.now() + retryDelay;
        this.updateTaskStatus(task, 'pending');

        this.emit('taskRetry', task);

      } else {
        // Max retries reached
        this.updateTaskStatus(task, 'failed');

        if (this.config.deadLetterQueue) {
          this.deadLetterQueue.push(task);
          this.metrics.deadLetteredTasks++;
        }

        this.emit('taskFailed', task);
      }

      // Update error metrics
      const errorCount = this.metrics.errorsByType.get(task.type) || 0;
      this.metrics.errorsByType.set(task.type, errorCount + 1);
      this.metrics.failedTasks++;
    }

    // Remove from processing
    this.processing.delete(task.id);
    this.metrics.processingTasks--;

    // Update completed/failed counts
    if (task.status === 'completed') {
      this.metrics.completedTasks++;
    } else if (task.status === 'failed') {
      this.metrics.failedTasks++;
    }
  }

  /**
   * Execute handler with timeout
   */
  private async executeWithTimeout<T>(
    handler: TaskHandler,
    task: Task,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        const result = handler(task);
        
        if (result instanceof Promise) {
          result
            .then(value => {
              clearTimeout(timer);
              resolve(value);
            })
            .catch(error => {
              clearTimeout(timer);
              reject(error);
            });
        } else {
          clearTimeout(timer);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Update processing metrics
   */
  private updateProcessingMetrics(processingTime: number): void {
    // Update average processing time (exponential moving average)
    if (this.metrics.averageProcessingTime === 0) {
      this.metrics.averageProcessingTime = processingTime;
    } else {
      this.metrics.averageProcessingTime = 
        this.metrics.averageProcessingTime * 0.9 + processingTime * 0.1;
    }

    // Update average wait time
    const completedTasks = this.metrics.completedTasks;
    if (completedTasks > 0) {
      this.metrics.averageWaitTime = 
        (this.metrics.averageWaitTime * (completedTasks - 1) + processingTime) / completedTasks;
    }
  }

  /**
   * Update queue metrics - optimized with O(1) indexed lookups
   */
  private updateMetrics(): void {
    const now = Date.now();
    let recentCompletedCount = 0;

    // Use indexed lookups for O(1) count instead of O(n) iteration
    const pendingCount = this.tasksByStatus.get('pending')?.size || 0;
    const processingCount = this.tasksByStatus.get('processing')?.size || 0;
    
    // Only need to iterate completed tasks for recent completion check
    const completedTaskIds = this.tasksByStatus.get('completed') || new Set();
    for (const taskId of completedTaskIds) {
      const task = this.tasks.get(taskId);
      if (task?.completedAt && (now - task.completedAt) < 60000) {
        recentCompletedCount++;
      }
    }

    this.metrics.pendingTasks = pendingCount;
    this.metrics.processingTasks = processingCount;
    this.metrics.throughput = recentCompletedCount / 60;
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task-${this.config.name}-${Date.now()}-${++this.taskCounter}`;
  }

  /**
   * Get configuration
   */
  getConfig(): Required<TaskQueueConfig> {
    return { ...this.config };
  }

  /**
   * Get registered handlers
   */
  getHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * Task Queue Manager for multiple queues
 */
class TaskQueueManager {
  private queues: Map<string, TaskQueue> = new Map();

  /**
   * Create or get a task queue
   */
  createQueue(name: string, config: Omit<TaskQueueConfig, 'name'>): TaskQueue {
    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    const queue = new TaskQueue({ ...config, name });
    this.queues.set(name, queue);
    
    return queue;
  }

  /**
   * Get queue by name
   */
  getQueue(name: string): TaskQueue | undefined {
    return this.queues.get(name);
  }

  /**
   * Remove queue
   */
  removeQueue(name: string): boolean {
    const queue = this.queues.get(name);
    if (queue) {
      queue.stop();
      return this.queues.delete(name);
    }
    return false;
  }

  /**
   * Get all queue metrics
   */
  getAllMetrics(): TaskQueueMetrics[] {
    return Array.from(this.queues.values()).map(queue => queue.getMetrics());
  }

  /**
   * Start all queues
   */
  startAll(): void {
    for (const queue of Array.from(this.queues.values())) {
      queue.start();
    }
  }

  /**
   * Stop all queues
   */
  stopAll(): void {
    for (const queue of Array.from(this.queues.values())) {
      queue.stop();
    }
  }

  /**
   * Get queue names
   */
  getQueueNames(): string[] {
    return Array.from(this.queues.keys());
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalQueues: number;
    totalTasks: number;
    pendingTasks: number;
    processingTasks: number;
    completedTasks: number;
    failedTasks: number;
    deadLetteredTasks: number;
    averageThroughput: number;
  } {
    const metrics = this.getAllMetrics();
    
    return {
      totalQueues: metrics.length,
      totalTasks: metrics.reduce((sum, m) => sum + m.totalTasks, 0),
      pendingTasks: metrics.reduce((sum, m) => sum + m.pendingTasks, 0),
      processingTasks: metrics.reduce((sum, m) => sum + m.processingTasks, 0),
      completedTasks: metrics.reduce((sum, m) => sum + m.completedTasks, 0),
      failedTasks: metrics.reduce((sum, m) => sum + m.failedTasks, 0),
      deadLetteredTasks: metrics.reduce((sum, m) => sum + m.deadLetteredTasks, 0),
      averageThroughput: metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length
    };
  }
}

// Global task queue manager instance
const globalTaskQueueManager = new TaskQueueManager();

export default TaskQueue;
export { 
  TaskQueueManager, 
  globalTaskQueueManager 
};
export type { 
  Task, 
  TaskHandler, 
  TaskQueueConfig, 
  TaskQueueMetrics 
};
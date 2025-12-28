/**
 * Interval Scheduler with Advanced Job Tracking and Control
 * 
 * PURPOSE: Provides a robust mechanism for scheduling recurring jobs with
 * comprehensive lifecycle management, execution tracking, and graceful error handling.
 * This utility is designed for production systems requiring precise control over
 * background tasks, periodic maintenance, and repeated operations.
 * 
 * SCHEDULING FEATURES:
 * - Native Performance: Uses setInterval for optimal CPU and memory efficiency
 * - Execution Tracking: Monitors job execution count and status
 * - Max Execution Control: Automatically stops after specified execution count
 * - Immediate Execution: Optional immediate execution on scheduler start
 * - Race Condition Prevention: Atomic operations prevent concurrent state issues
 * - Comprehensive Error Handling: Isolates job errors from scheduler stability
 * 
 * PRODUCTION USE CASES:
 * - Periodic data cleanup and maintenance tasks
 * - Health check monitoring and status reporting
 * - Batch processing with controlled execution limits
 * - Caching and data synchronization operations
 * - Backup and archival processes with scheduling
 * 
 * ARCHITECTURAL BENEFITS:
 * - Memory Efficient: Single timer instance per job
 * - CPU Optimized: Native setInterval for timing accuracy
 * - Error Isolated: Job failures don't affect scheduler
 * - State Consistent: Atomic state transitions prevent race conditions
 * - Debugging Ready: Unique job identifiers enable tracing
 * 
 * @param {Function} callback - Function to execute periodically (supports async/await)
 * @param {number} intervalMs - Interval in milliseconds (must be positive)
 * @param {object} [options] - Scheduling options with intelligent defaults
 * @param {string} [options.identifier] - Unique job identifier for tracking and debugging
 * @param {boolean} [options.immediate=false] - Execute callback immediately on scheduler start
 * @param {number} [options.maxExecutions] - Maximum number of executions before auto-stop (null for unlimited)
 * @param {Function} [options.onError] - Error handler called when job execution fails
 * @returns {object} Job control object with cancel, isRunning, getExecutionCount methods
 * 
 * @example
 * // Basic interval scheduling
 * const heartbeat = scheduleInterval(
 *   () => console.log('Heartbeat'),
 *   5000 // Every 5 seconds
 * );
 * 
 * @example
 * // Interval with execution limit
 * const limitedJob = scheduleInterval(
 *   () => processQueue(),
 *   60000, // Every minute
 *   { maxExecutions: 100 } // Stop after 100 executions
 * );
 * 
 * @example
 * // Immediate execution with error handling
 * const robustJob = scheduleInterval(
 *   async () => {
 *     await fetchData();
 *     await processData();
 *   },
 *   300000, // Every 5 minutes
 *   {
 *     immediate: true,
 *     identifier: 'data-processor',
 *     onError: (error, context) => {
 *       logger.error('Processing job failed', { error, context });
 *       notifyAdmin(context.identifier);
 *     }
 *   }
 * );
 * 
 * @example
 * // Job control and monitoring
 * const job = scheduleInterval(myCallback, 10000);
 * console.log('Job running:', job.isRunning());
 * console.log('Execution count:', job.getExecutionCount());
 * 
 * // Later, if needed:
 * if (job.getExecutionCount() > 50) {
 *   const wasCancelled = job.cancel();
 *   console.log('Job cancelled:', wasCancelled);
 * }
 */
import { qerrors } from 'qerrors';

function scheduleInterval(callback: any, intervalMs: any, options: any = {}) { // robust interval scheduler with comprehensive job management
  // Validate callback function to ensure it's executable
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  // Validate interval to ensure it's a positive number (prevents invalid timers)
  if (typeof intervalMs !== 'number' || intervalMs <= 0) {
    throw new Error('Interval must be a positive number');
  }

  // Extract and normalize options with intelligent defaults
  const {
    identifier = null,           // Unique job identifier for debugging and monitoring
    immediate = false,           // Whether to execute immediately on scheduler start
    maxExecutions = null,        // Maximum executions before auto-stop (null = unlimited)
    onError = null               // Error handler for failed job executions
  } = options;

  // Job state management for tracking and control
  let executionCount = 0;    // Current execution count for max execution limits
  let intervalId: any = null;  // Native setInterval reference for cleanup
  let cancelled = false;        // Cancellation flag to prevent further executions

  // Generate unique job identifier if not provided
  // Combines timestamp with random string for collision resistance
  const jobId: any = identifier || `interval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const executeCallback = async (): Promise<any> => { // async execution wrapper with comprehensive error handling and state management
    // Early return if job has been cancelled to prevent further executions
    if (cancelled) return;

    // Check max executions limit BEFORE incrementing to prevent race conditions
    // This atomic check ensures we don't exceed the limit in concurrent scenarios
    if (maxExecutions !== null && executionCount >= maxExecutions) {
      if (intervalId) {
        clearInterval(intervalId);    // Clear the interval timer
        intervalId = null;           // Mark as cleaned up
      }
      cancelled = true;           // Mark job as cancelled
      return;                    // Exit without executing
    }

    // Atomically increment execution count AFTER the limit check
    // This prevents race conditions where multiple executions could increment simultaneously
    const currentExecutionCount = ++executionCount;

    // Check if this execution reaches the max limit and we should stop after it
    // This allows the final execution to complete before stopping
    if (maxExecutions !== null && currentExecutionCount >= maxExecutions) {
      if (intervalId) {
        clearInterval(intervalId);    // Clean up the timer
        intervalId = null;           // Mark timer as cleared
      }
      cancelled = true;           // Mark job as stopped
      // Note: We don't return here - let the current execution complete
    }

    try {
      // Execute the callback function (supports both sync and async)
      await callback();
    } catch (error) {
      // Log the error for monitoring and debugging with full context
      qerrors(error instanceof Error ? error : new Error(String(error)), 'scheduleInterval', `Job execution failed for: ${jobId} (execution: ${currentExecutionCount})`);
      
      // Log error details for immediate debugging visibility
      console.error(`[scheduleInterval] Error in job ${jobId} (execution ${currentExecutionCount}):`, error instanceof Error ? error.message : String(error));
      
      // Call custom error handler if provided (allows application-specific error handling)
      if (onError && typeof onError === 'function') {
        try {
          onError(error, { identifier: jobId, executionCount: currentExecutionCount, intervalMs });
        } catch (handlerError) {
          // Log handler errors separately to prevent masking original job errors
          qerrors(handlerError instanceof Error ? handlerError : new Error(String(handlerError)), 'scheduleInterval', `Error handler failed for job: ${jobId}`);
          console.error('[scheduleInterval] Error handler threw:', handlerError instanceof Error ? handlerError.message : String(handlerError));
          // Don't re-throw to prevent unhandled promise rejection in the job execution
        }
      } else {
        // If no error handler provided, log error but don't re-throw
        // This maintains scheduler stability even without error handling
        console.error(`[scheduleInterval] Unhandled error in job ${jobId} (execution ${currentExecutionCount}):`, error instanceof Error ? error.message : String(error));
      }
    }
  };

  // Schedule the recurring interval using native setInterval
  // setInterval is used for optimal performance and timing accuracy
  intervalId = setInterval(executeCallback, intervalMs);

  // Execute immediately if requested (useful for initialization or immediate start)
  if (immediate) {
    setImmediate(executeCallback);  // Execute on next tick of event loop
  }

  // Return job control object for external management and monitoring
  return {
    id: jobId,  // Unique job identifier for tracking and debugging

    /**
     * Cancel the interval job and stop further executions
     * @returns {boolean} True if cancellation succeeded, false if already cancelled
     */
    cancel() { // cancel job with proper cleanup
      if (cancelled) { // already cancelled
        return false;
      }
      if (intervalId) {
        clearInterval(intervalId);  // Clear the native interval timer
        intervalId = null;           // Mark timer as cleaned up
      }
      cancelled = true;  // Set cancellation flag
      return true;
    },

    /**
     * Check if the interval job is currently active and running
     * @returns {boolean} True if job is running, false if cancelled or stopped
     */
    isRunning() { // check if job is still running (not cancelled and has active timer)
      return intervalId !== null && !cancelled;
    },

    /**
     * Get the current execution count for monitoring and debugging
     * @returns {number} Number of times the job has executed
     */
    getExecutionCount() { // get current execution count for monitoring and limits
      return executionCount;
    }
  };
}

export default scheduleInterval;

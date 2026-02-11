/**
 * One-Time Job Scheduler - Precise Timing with Error Handling
 *
 * PURPOSE: Provides a robust mechanism for scheduling functions to execute
 * exactly once at a specified future time. This utility is designed for
 * critical tasks like notifications, cleanup operations, and delayed processing
 * where precise timing and reliability are essential.
 *
 * TIMING CHARACTERISTICS:
 * - Precision: Uses setTimeout/setImmediate for millisecond accuracy
 * - Flexibility: Accepts both Date objects and Unix timestamps
 * - Immediate Execution: Handles past dates by executing immediately
 * - Cancellation: Supports job cancellation before execution
 * - State Management: Tracks job lifecycle (pending, executed, cancelled)
 *
 * ERROR HANDLING STRATEGY:
 * - Async Support: Fully supports async/await callback functions
 * - Graceful Degradation: Never throws during callback execution
 * - Error Isolation: Callback errors don't affect scheduler stability
 * - Optional Error Handlers: Custom error handling for application logic
 * - Comprehensive Logging: Errors are logged for debugging and monitoring
 *
 * PRODUCTION CONSIDERATIONS:
 * - Memory Management: Proper cleanup of timeout references
 * - Race Conditions: Atomic state transitions prevent concurrent execution
 * - Process Boundaries: Works correctly across Node.js event loop cycles
 * - Monitoring: Job identifiers enable tracking and debugging
 *
 * @param {Function} callback - Function to execute (supports async/await)
 * @param {Date|number} when - When to execute (Date object or Unix timestamp in milliseconds)
 * @param {object} [options] - Scheduling options for customization and error handling
 * @param {string} [options.identifier] - Custom job identifier for tracking and debugging
 * @param {Function} [options.onError] - Error handler callback called when execution fails
 * @returns {object} Job object with control methods (cancel, isRunning, getScheduledFor)
 *
 * @example
 * // Schedule notification for 5 minutes from now
 * const job = scheduleOnce(
 *   () => console.log('Meeting reminder!'),
 *   Date.now() + 5 * 60 * 1000
 * );
 *
 * @example
 * // Schedule with error handling and custom ID
 * const backupJob = scheduleOnce(
 *   async () => {
 *     await performBackup();
 *   },
 *   new Date('2024-01-01T02:00:00Z'),
 *   {
 *     identifier: 'daily-backup',
 *     onError: (error, context) => {
 *       logger.error('Backup failed', { error, context });
 *       notifyAdmin(context.identifier);
 *     }
 *   }
 * );
 *
 * @example
 * // Cancel scheduled job
 * const job = scheduleOnce(myCallback, futureTime);
 * setTimeout(() => {
 *   const wasCancelled = job.cancel();
 *   console.log('Job cancelled:', wasCancelled);
 * }, 1000);
 */
import { qerr as qerrors } from '@bijikyu/qerrors';
function scheduleOnce(callback: any, when: any, options: any = {}) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  let executionDate = when;
  if (typeof when === 'number') { // convert timestamp to Date
    executionDate = new Date(when);
  }

  if (!(executionDate instanceof Date) || isNaN(executionDate.getTime())) {
    throw new Error('When must be a valid Date or timestamp');
  }

  const {
    identifier = null,
    onError = null
  } = options;

  let timeoutId: any = null;
  let immediateId: any = null;
  let executed = false;
  let cancelled = false;

  const jobId: any = identifier || `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const currentTime = Date.now();
  const scheduledTime = executionDate.getTime();
  const delayMs = Math.max(0, scheduledTime - currentTime); // Ensure non-negative

  const executeCallback = async (): Promise<any> => {
    if (cancelled) {
      return;
    }
    executed = true;

    try {
      await callback();
    } catch (error) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'scheduleOnce', `One-time job execution failed for: ${jobId}`);

      if (onError && typeof onError === 'function') {
        try {
          onError(error, { identifier: jobId, scheduledFor: executionDate });
        } catch (handlerError) {
          qerrors(handlerError instanceof Error ? handlerError : new Error(String(handlerError)), 'scheduleOnce', `Error handler failed for job: ${jobId}`);
          console.error('[scheduleOnce] Error handler threw:', handlerError);
        }
      }
    }
  };

  if (delayMs <= 0) { // if time has passed, execute immediately
    immediateId = setImmediate(executeCallback);
  } else {
    timeoutId = setTimeout(executeCallback, delayMs);
  }

  return {
    id: jobId,

    cancel() { // cancel the job
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (immediateId) {
        clearImmediate(immediateId);
        immediateId = null;
      }
      cancelled = true;
      return !executed;
    },

    isRunning() { // check if job is pending
      return !executed && !cancelled && (timeoutId !== null || immediateId !== null);
    },

    getScheduledFor() { // get scheduled execution time
      return executionDate;
    }
  };
}

export default scheduleOnce;

/**
 * Schedule Interval with Job Tracking
 * 
 * Schedules a recurring job with execution tracking, max executions,
 * and error handling. Uses native setInterval for simplicity.
 * 
 * @param {Function} callback - Function to execute (can be async)
 * @param {number} intervalMs - Interval in milliseconds
 * @param {object} [options] - Scheduling options
 * @param {string} [options.identifier] - Job identifier
 * @param {boolean} [options.immediate=false] - Execute immediately on start
 * @param {number} [options.maxExecutions] - Max number of executions
 * @param {Function} [options.onError] - Error handler callback
 * @returns {object} Job object with cancel, isRunning, getExecutionCount methods
 */
function scheduleInterval(callback: any, intervalMs: any, options: any = {}) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  if (typeof intervalMs !== 'number' || intervalMs <= 0) {
    throw new Error('Interval must be a positive number');
  }

  const {
    identifier = null,
    immediate = false,
    maxExecutions = null,
    onError = null
  } = options;

  let executionCount = 0;
  let intervalId: any = null;
  let cancelled = false;

  const jobId: any = identifier || `interval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const executeCallback = async (): Promise<any> => { // wrapper to handle async execution
    if (cancelled) return;

    if (maxExecutions !== null && executionCount >= maxExecutions) { // check max executions before incrementing
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      cancelled = true;
      return;
    }

    executionCount++;

    try {
      await callback();
    } catch (error) {
      // Log the error for debugging even if there's an error handler
      console.error(`[scheduleInterval] Error in job ${jobId} (execution ${executionCount}):`, error instanceof Error ? error.message : String(error));
      
      if (onError && typeof onError === 'function') {
        try {
          onError(error, { identifier: jobId, executionCount, intervalMs });
        } catch (handlerError) {
          console.error('[scheduleInterval] Error handler threw:', handlerError instanceof Error ? handlerError.message : String(handlerError));
          // Don't re-throw to prevent unhandled promise rejection
        }
      } else {
        // If no error handler, log the error but don't re-throw to prevent unhandled promise rejection
        console.error(`[scheduleInterval] Unhandled error in job ${jobId} (execution ${executionCount}):`, error instanceof Error ? error.message : String(error));
      }
    }
  };

  intervalId = setInterval(executeCallback, intervalMs); // schedule the interval

  if (immediate) { // execute immediately if requested
    setImmediate(executeCallback);
  }

  return {
    id: jobId,

    cancel() { // cancel the job
      if (cancelled) { // already cancelled
        return false;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      cancelled = true;
      return true;
    },

    isRunning() { // check if job is still running
      return intervalId !== null && !cancelled;
    },

    getExecutionCount() { // get current execution count
      return executionCount;
    }
  };
}

export default scheduleInterval;

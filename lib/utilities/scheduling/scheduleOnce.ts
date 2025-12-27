import { qerrors } from 'qerrors';

/**
 * Schedule One-Time Job
 * 
 * Schedules a function to execute once at a specified time.
 * 
 * @param {Function} callback - Function to execute (can be async)
 * @param {Date|number} when - When to execute (Date object or timestamp)
 * @param {object} [options] - Scheduling options
 * @param {string} [options.identifier] - Job identifier
 * @param {Function} [options.onError] - Error handler callback
 * @returns {object} Job object with cancel, isRunning, getScheduledFor methods
 */
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
  let executed = false;
  let cancelled = false;

  const jobId: any = identifier || `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const currentTime = Date.now();
  const scheduledTime = executionDate.getTime();
  const delayMs = Math.max(0, scheduledTime - currentTime); // Ensure non-negative

  const executeCallback = async (): Promise<any> => {
    if (cancelled) return;
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
    setImmediate(executeCallback);
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
      cancelled = true;
      return !executed;
    },

    isRunning() { // check if job is pending
      return !executed && !cancelled && (timeoutId !== null);
    },

    getScheduledFor() { // get scheduled execution time
      return executionDate;
    }
  };
}

export default scheduleOnce;

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
function scheduleOnce(callback, when, options = {}) {
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

  let timeoutId = null;
  let executed = false;
  let cancelled = false;

  const jobId = identifier || `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const delayMs = executionDate.getTime() - Date.now(); // calculate delay

  const executeCallback = async () => {
    if (cancelled) return;
    executed = true;

    try {
      await callback();
    } catch (error) {
      if (onError && typeof onError === 'function') {
        try {
          onError(error, { identifier: jobId, scheduledFor: executionDate });
        } catch (handlerError) {
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
      return !executed && !cancelled && (timeoutId !== null || delayMs <= 0);
    },

    getScheduledFor() { // get scheduled execution time
      return executionDate;
    }
  };
}

module.exports = scheduleOnce;

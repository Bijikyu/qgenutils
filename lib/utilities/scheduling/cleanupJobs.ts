/**
 * Bulk Cleanup of Scheduled Jobs
 * 
 * Cancels multiple scheduled jobs in bulk and returns the count of cancelled jobs.
 * 
 * @param {Array} jobs - Array of job objects from scheduleInterval/scheduleOnce
 * @returns {number} Number of jobs successfully cancelled
 */
function cleanupJobs(jobs) {
  if (!Array.isArray(jobs)) {
    throw new Error('Jobs must be an array');
  }

  let cancelledCount = 0;

  for (const job of jobs) {
    try {
      if (job && typeof job.cancel === 'function') {
        if (job.cancel()) {
          cancelledCount++;
        }
      }
    } catch (error) {
      console.error('[cleanupJobs] Failed to cancel job:', error);
    }
  }

  return cancelledCount;
}

export default cleanupJobs;

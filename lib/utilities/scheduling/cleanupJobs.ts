/**
 * Bulk Job Cleanup Utility - Graceful Scheduler Shutdown Management
 *
 * PURPOSE: Provides a reliable mechanism for cleaning up multiple scheduled
 * jobs in bulk operations. This utility is essential for application shutdown,
 * test cleanup, resource management, and preventing memory leaks from
 * abandoned timers and pending operations.
 *
 * CLEANUP STRATEGY:
 * - Bulk Processing: Handles multiple job objects in single operation
 * - Graceful Cancellation: Calls each job's cancel method properly
 * - Error Isolation: Individual job failures don't stop cleanup process
 * - Count Tracking: Returns count of successfully cancelled jobs
 * - Validation: Ensures input is proper array structure
 *
 * PRODUCTION USE CASES:
 * - Application shutdown procedures to prevent orphaned timers
 * - Test suite cleanup to avoid test interference
 * - Resource management before configuration changes
 * - Memory leak prevention during long-running processes
 * - Graceful degradation during maintenance operations
 *
 * ERROR HANDLING:
 * - Individual Job Errors: Logged but don't prevent other cleanup
 * - Validation Errors: Thrown to prevent invalid operation execution
 * - Comprehensive Logging: Failed cancellations logged for debugging
 * - Non-Blocking: Returns success count even with partial failures
 *
 * MEMORY MANAGEMENT:
 * - Timer Cleanup: Properly clears setInterval/setTimeout references
 * - Resource Release: Allows garbage collection of job objects
 * - Reference Management: Handles null/undefined job objects safely
 * - Consistency: Ensures all jobs have chance to cancel cleanly
 *
 * @param {Array} jobsArray - Array of job objects from scheduleInterval/scheduleOnce schedulers
 * @returns {number} Number of jobs successfully cancelled (may be less than array length)
 * @throws {Error} If jobs parameter is not a valid array
 *
 * @example
 * // Basic cleanup
 * const jobs = [heartbeatJob, backupJob, cleanupJob];
 * const cancelledCount = cleanupJobs(jobs);
 * console.log(`Cancelled ${cancelledCount} jobs`);
 *
 * @example
 * // Cleanup with error handling
 * try {
 *   const cancelledCount = cleanupJobs(activeJobs);
 *   console.log('Cleanup completed:', cancelledCount);
 * } catch (error) {
 *   console.error('Cleanup failed:', error.message);
 * }
 *
 * @example
 * // Safe cleanup with validation
 * const safeJobs = allJobs.filter(job => job && typeof job.cancel === 'function');
 * const result = cleanupJobs(safeJobs);
 * console.log('Safe cleanup result:', result);
 */
function cleanupJobs(jobsArray) {
  // Validate input to ensure we have a proper array structure
  if (!Array.isArray(jobsArray)) {
    throw new Error('Jobs must be an array');
  }

  let cancelledCount = 0;  // Track successful cancellations for reporting

  // Process each job individually to ensure complete cleanup
  // Use forEach for consistent iteration and better error handling
  jobsArray.forEach((jobItem) => {
    try {
      // Verify job exists and has cancel method before attempting cancellation
      if (jobItem && typeof jobItem.cancel === 'function') {
        // Attempt to cancel the job and count successful cancellations
        if (jobItem.cancel()) {
          cancelledCount++;  // Increment counter for successful cleanup
        }
      }
    } catch (error) {
      // Log individual job cancellation failures without stopping entire cleanup process
      // This ensures best-effort cleanup even if some jobs fail to cancel
      console.error('[cleanupJobs] Failed to cancel job:', error);
    }
  });

  // Return count of successfully cancelled jobs (may be less than total array length)
  // This allows calling code to know if cleanup was fully or partially successful
  return cancelledCount;
}

export default cleanupJobs;

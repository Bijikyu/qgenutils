/**
 * BATCH PROCESSING UTILITY
 *
 * PURPOSE: High-performance batch processing system for large datasets with
 * configurable concurrency control, retry logic, timeout handling, and detailed
 * progress tracking. Essential for data migrations, bulk API operations, and
 * background job processing.
 *
 * PROCESSING STRATEGY:
 * - Divides large datasets into manageable batches for memory efficiency
 * - Uses semaphores to control concurrent operation limits
 * - Implements exponential backoff retry for transient failures
 * - Provides comprehensive progress tracking and ETA calculations
 * - Handles timeouts gracefully without resource leaks
 *
 * CONCURRENCY AND PERFORMANCE:
 * - Configurable concurrent operation limits prevent resource exhaustion
 * - Batch size optimization for memory vs. throughput balance
 * - Promise.allSettled ensures all operations complete or fail gracefully
 * - Resource cleanup prevents memory leaks and connection issues
 *
 * ERROR HANDLING AND RELIABILITY:
 * - Individual item retry with configurable attempts and delays
 * - Timeout protection prevents hanging operations
 * - Comprehensive error reporting with context and retry counts
 * - Optional early termination on critical errors
 * - Error callbacks for custom error handling and logging
 *
 * MONITORING AND OBSERVABILITY:
 * - Real-time progress tracking with percentage completion
 * - ETA calculation based on current processing rate
 * - Throughput metrics and performance statistics
 * - Detailed success/failure reporting with item-level results
 */

import { qerr as qerrors } from '@bijikyu/qerrors'; // Centralized error handling system
import createSemaphore from './createSemaphore.js'; // Concurrency control
import retryWithBackoff from './retryWithBackoff.js'; // Retry logic with backoff

/**
 * Configuration options for batch processing behavior.
 */
interface ProcessBatchOptions<T, R> {
  /** Maximum number of concurrent operations (default: 10) */
  concurrency?: number;
  /** Number of items to process in each batch (default: 100) */
  batchSize?: number;
  /** Maximum retry attempts per item (default: 3) */
  retries?: number;
  /** Base delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Timeout for individual operations in milliseconds (default: 30000) */
  timeout?: number;
  /** Stop processing on first error (default: false) */
  stopOnError?: boolean;
  /** Progress callback function (progress: ProgressInfo) => void */
  onProgress?: (progress: ProgressInfo) => void;
  /** Error callback function (error: Error, item: T, index: number) => void */
  onError?: (error: Error, item: T, index: number) => void;
}

/**
 * Progress tracking information for batch processing.
 */
interface ProgressInfo {
  /** Total number of items to process */
  total: number;
  /** Number of items processed so far */
  processed: number;
  /** Number of successfully processed items */
  successful: number;
  /** Number of failed items */
  failed: number;
  /** Percentage of completion (0-100) */
  percentage: number;
  /** Processing start timestamp */
  startTime: number;
  /** Estimated time remaining in milliseconds */
  eta: number;
}

/**
 * Result of processing a single item.
 */
interface ItemResult<T, R> {
  success: boolean;
  item: T;
  index: number;
  retries: number;
  result?: R;
  error?: Error;
}

/**
 * Overall batch processing result with comprehensive metrics.
 */
interface BatchResult<T, R> {
  /** Array of successfully processed items with results */
  successful: Array<{ item: T; result: R; index: number }>;
  /** Array of failed items with error details */
  failed: Array<{ item: T; error: Error; index: number; retries: number }>;
  /** Total number of items processed */
  total: number;
  /** Number of successful operations */
  successCount: number;
  /** Number of failed operations */
  failureCount: number;
  /** Total processing duration in milliseconds */
  duration: number;
  /** Items processed per second */
  throughput: number;
}

/**
 * Processes items in batches with configurable concurrency, retries, and progress tracking.
 *
 * This function provides a comprehensive batch processing solution that handles
 * large datasets efficiently while providing detailed monitoring and error handling.
 * It uses a combination of batching, concurrency control, and retry logic to ensure
 * reliable processing of diverse workloads.
 *
 * @param items - Array of items to process. Can be any type.
 * @param processor - Async function that processes each item: (item: T, index: number) => Promise<R>
 * @param options - Configuration options for processing behavior
 *
 * @returns Promise<BatchResult<T, R>> - Comprehensive result with success/failure details and metrics
 *
 * @example
 * ```typescript
 * // Basic usage
 * const users = await fetchUsers();
 * const result = await processBatch(
 *   users,
 *   async (user, index) => {
 *     return await updateUserInDatabase(user);
 *   },
 *   {
 *     concurrency: 5,
 *     batchSize: 50,
 *     onProgress: (progress) => {
 *       console.log(`Progress: ${progress.percentage.toFixed(1)}%`);
 *     },
 *     onError: (error, user, index) => {
 *       console.error(`Failed to update user ${user.id}:`, error.message);
 *     }
 *   }
 * );
 *
 * console.log(`Processed ${result.successCount}/${result.total} successfully`);
 * console.log(`Throughput: ${result.throughput.toFixed(2)} items/second`);
 *
 * // Advanced usage with retry and timeout
 * const apiResult = await processBatch(
 *   apiRequests,
 *   async (request, index) => {
 *     return await makeApiCall(request);
 *   },
 *   {
 *     concurrency: 3,
 *     retries: 5,
 *     retryDelay: 2000,
 *     timeout: 10000,
 *     stopOnError: false
 *   }
 * );
 * ```
 *
 * @warning Ensure the processor function handles errors appropriately and doesn't leave resources open
 * @note Memory usage scales with batch size - adjust based on available memory and item size
 * @see createSemaphore for concurrency control details
 * @see retryWithBackoff for retry strategy implementation
 */
async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: ProcessBatchOptions<T, R> = {}
): Promise<BatchResult<T, R>> {
  // OPTIONS CONFIGURATION: Merge defaults with provided options
  const {
    concurrency = 10,    // Concurrent operations limit
    batchSize = 100,     // Items per batch for memory management
    retries = 3,         // Retry attempts per item
    retryDelay = 1000,   // Base delay between retries
    timeout = 30000,     // Per-item timeout
    stopOnError = false, // Stop on first error flag
    onProgress = () => {}, // Progress callback (no-op default)
    onError = () => {}      // Error callback (no-op default)
  } = options;

  // TIMING INITIALIZATION: Start timing for metrics calculation
  const startTime = Date.now();

  // MEMORY OPTIMIZATION: Use typed arrays for better memory efficiency
  const successful: Array<{ item: T; result: R; index: number }> = [];
  const failed: Array<{ item: T; error: Error; index: number; retries: number }> = [];

  // RESULT INITIALIZATION: Prepare result object for comprehensive reporting
  const result: BatchResult<T, R> = {
    successful, // Direct reference to avoid copying
    failed,     // Direct reference to avoid copying
    total: items.length,
    successCount: 0,
    failureCount: 0,
    duration: 0,
    throughput: 0
  };

  // PROGRESS TRACKING: Initialize progress monitoring
  const progress: ProgressInfo = {
    total: items.length,
    processed: 0,
    successful: 0,
    failed: 0,
    percentage: 0,
    startTime,
    eta: 0
  };

  // BATCH PROCESSING LOOP: Process items in configurable batch sizes
  // This approach balances memory usage with throughput efficiency
  for (let i = 0; i < items.length; i += batchSize) {
    // EARLY TERMINATION: Check if we should stop due to errors
    if (stopOnError && result.failureCount > 0) {
      break; // Exit processing loop on first error if configured
    }

    // BATCH PREPARATION: Extract current batch from items array
    const batch = items.slice(i, i + batchSize);

    // CONCURRENCY CONTROL: Create semaphore for this batch's operations
    const semaphore = createSemaphore(concurrency);

    // CONCURRENT PROCESSING: Map items to concurrent processing promises
    const promises = batch.map(async (item, batchIndex): Promise<ItemResult<T, R>> => {
      const globalIndex = i + batchIndex; // Global index in entire dataset
      const release = await semaphore.acquire(); // Acquire concurrency permit
      let timeoutHandle: NodeJS.Timeout | undefined = undefined;

      try {
        // TIMEOUT PROTECTION: Wrap processor with timeout to prevent hanging
        const wrappedProcessor = async (): Promise<R> => {
          return Promise.race([
            processor(item, globalIndex),
            new Promise<never>((_, reject) =>
              timeoutHandle = setTimeout(() => reject(new Error('Operation timeout')), timeout)
            )
          ]);
        };

        // RETRY LOGIC: Process item with exponential backoff retry
        const retryResult = await retryWithBackoff(wrappedProcessor, {
          maxRetries: retries,
          baseDelay: retryDelay
        });

        // TIMEOUT CLEANUP: Clear timeout if operation completed successfully
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = undefined; // Prevent double cleanup
        }

        // SUCCESS HANDLING: Return successful result with retry count
        if (retryResult.ok) {
          return {
            success: true,
            item,
            result: retryResult.value,
            index: globalIndex,
            retries: retryResult.attempts - 1
          };
        } else {
          // RETRY EXHAUSTION: Handle retry failure with error callback
          onError(retryResult.error as Error, item, globalIndex);
          return {
            success: false,
            item,
            error: retryResult.error as Error,
            index: globalIndex,
            retries: retryResult.attempts - 1
          };
        }
      } catch (processorError) {
        // EXCEPTION HANDLING: Catch unexpected processor errors
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = undefined; // Prevent double cleanup
        }

        // LOG UNEXPECTED ERRORS: Use centralized error handling
        const error = processorError instanceof Error ? processorError : new Error(String(processorError));
        qerrors(error, 'processBatch', `Batch item processing failed for index: ${globalIndex}`);

        return {
          success: false,
          item,
          error,
          index: globalIndex,
          retries: 0
        };
      } finally {
        // RESOURCE CLEANUP: Always release semaphore permit
        release();
      }
    });

    // BATCH EXECUTION: Wait for all items in batch to complete
    // Promise.allSettled ensures we get results for all operations
    const batchResults = await Promise.allSettled(promises);

    // RESULT AGGREGATION: Process batch results and update counters
    batchResults.forEach((settled, idx) => {
      if (settled.status === 'fulfilled') {
        // SUCCESSFUL PROMISE: Process the item result
        const itemResult = settled.value;
        if (itemResult.success) {
          // ADD SUCCESS: Store successful result with processing outcome
          result.successful.push({
            item: itemResult.item,
            result: itemResult.result!,
            index: itemResult.index
          });
          result.successCount++;
        } else {
          // ADD FAILURE: Store failed result with error details
          result.failed.push({
            item: itemResult.item,
            error: itemResult.error!,
            index: itemResult.index,
            retries: itemResult.retries
          });
          result.failureCount++;
        }
      } else {
        // FAILED PROMISE: Handle promise rejection
        result.failed.push({
          item: batch[idx],
          error: settled.reason instanceof Error ? settled.reason : new Error(String(settled.reason)),
          index: i + idx,
          retries: 0
        });
        result.failureCount++;
      }
    });

    // PROGRESS UPDATE: Calculate and report progress for this batch
    progress.processed += batch.length;
    progress.successful = result.successCount;
    progress.failed = result.failureCount;
    progress.percentage = (progress.processed / progress.total) * 100;

    // ETA CALCULATION: Estimate remaining time based on current processing rate
    if (progress.processed > 0) {
      const elapsed = Date.now() - startTime;
      if (elapsed > 0) {
        const rate = progress.processed / elapsed; // Items per millisecond
        progress.eta = rate > 0 ? (progress.total - progress.processed) / rate : 0;
      } else {
        progress.eta = 0; // Avoid division by zero when elapsed time is zero
      }
    }

    // PROGRESS CALLBACK: Report current progress to caller
    onProgress({ ...progress });
  }

  // FINAL METRICS: Calculate processing duration and throughput
  result.duration = Date.now() - startTime;
  result.throughput = result.duration > 0
    ? (result.successCount + result.failureCount) / (result.duration / 1000)
    : 0;

  return result;
}

export default processBatch;

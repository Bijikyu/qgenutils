/**
 * Processes items in batches with concurrency control and progress tracking.
 *
 * PURPOSE: High-performance batch processing for large datasets with
 * configurable concurrency, retry logic, and detailed progress/error reporting.
 * Essential for data migrations, bulk API calls, and background processing.
 *
 * @param {Array} items - Items to process
 * @param {Function} processor - Async function (item, index) => result
 * @param {object} [options] - Processing configuration
 * @param {number} [options.concurrency=10] - Max concurrent operations
 * @param {number} [options.batchSize=100] - Items per batch
 * @param {number} [options.retries=3] - Retry attempts per item
 * @param {number} [options.retryDelay=1000] - Base retry delay in ms
 * @param {number} [options.timeout=30000] - Per-item timeout in ms
 * @param {boolean} [options.stopOnError=false] - Stop processing on first error
 * @param {Function} [options.onProgress] - Progress callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Promise<object>} Batch result with successful, failed, metrics
 */
import createSemaphore from './createSemaphore.js';
import retryWithBackoff from './retryWithBackoff.js';

async function processBatch(items: any, processor: any, options: any = {}) {
  const {
    concurrency = 10,
    batchSize = 100,
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    stopOnError = false,
    onProgress = () => {},
    onError = () => {}
  } = options;

  const startTime: any = Date.now();
  const result = {
    successful: [] as any[],
    failed: [] as any[],
    total: items.length,
    successCount: 0,
    failureCount: 0,
    duration: 0,
    throughput: 0
  };

  const progress = {
    total: items.length,
    processed: 0,
    successful: 0,
    failed: 0,
    percentage: 0,
    startTime,
    eta: 0
  };

  for (let i = 0; i < items.length; i += batchSize) {
    if (stopOnError && result.failureCount > 0) break;

    const batch: any = items.slice(i, i + batchSize);
    const semaphore: any = createSemaphore(concurrency);

    const promises = batch.map(async (item, batchIndex: any): Promise<any> => {
      const globalIndex: any = i + batchIndex;
      const release: any = await semaphore.acquire();

      try {
        const wrappedProcessor = async (): Promise<any> => {
          return Promise.race([
            processor(item, globalIndex),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ]);
        };

        const retryResult = await retryWithBackoff(wrappedProcessor, {
          maxRetries: retries,
          baseDelay: retryDelay
        });

        if (retryResult.ok) {
          return { success: true, item, result: retryResult.value, index: globalIndex, retries: retryResult.attempts - 1 };
        } else {
          onError(retryResult.error, item, globalIndex);
          return { success: false, item, error: retryResult.error, index: globalIndex, retries: retryResult.attempts - 1 };
        }
      } finally {
        release();
      }
    });

    const batchResults: any = await Promise.allSettled(promises);

    batchResults.forEach((settled, idx: any): any => {
      if (settled.status === 'fulfilled') {
        const itemResult: any = settled.value;
        if (itemResult.success) {
          result.successful.push({ item: itemResult.item, result: itemResult.result, index: itemResult.index });
          result.successCount++;
        } else {
          result.failed.push({ item: itemResult.item, error: itemResult.error, index: itemResult.index, retries: itemResult.retries });
          result.failureCount++;
        }
      } else {
        result.failed.push({ item: batch[idx], error: settled.reason, index: i + idx, retries: 0 });
        result.failureCount++;
      }
    });

    progress.processed += batch.length;
    progress.successful = result.successCount;
    progress.failed = result.failureCount;
    progress.percentage = (progress.processed / progress.total) * 100;

    if (progress.processed > 0) {
      const elapsed: any = Date.now() - startTime;
      const rate: any = progress.processed / elapsed;
      progress.eta = (progress.total - progress.processed) / rate;
    }

    onProgress({ ...progress });
  }

  result.duration = Date.now() - startTime;
  result.throughput = result.duration > 0 ? (result.successCount + result.failureCount) / (result.duration / 1000) : 0;

  return result;
}

export default processBatch;

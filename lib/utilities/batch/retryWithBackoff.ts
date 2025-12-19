/**
 * Retries an async operation with exponential backoff.
 *
 * PURPOSE: Provides robust retry logic for transient failures like
 * network timeouts, rate limits, and temporary service unavailability.
 * Exponential backoff prevents overwhelming recovering services.
 *
 * @param {Function} fn - Async function to retry
 * @param {object} [options] - Retry configuration
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.baseDelay=1000] - Initial delay in ms
 * @param {number} [options.maxDelay=30000] - Maximum delay cap in ms
 * @param {Function} [options.shouldRetry] - Predicate to determine if error is retryable
 * @returns {Promise<{ok: boolean, value?: any, error?: Error, attempts: number}>}
 */
async function retryWithBackoff(fn: any, options: any = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true
  } = options;

  let lastError;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;
    
    try {
      const result: any = await fn();
      return { ok: true, value: result, attempts };
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        return { ok: false, error: lastError, attempts };
      }
      
      const delay: any = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return { ok: false, error: lastError, attempts };
}

export default retryWithBackoff;

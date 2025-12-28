/**
 * EXPONENTIAL BACKOFF RETRY UTILITY
 * 
 * PURPOSE: Provides robust retry logic with exponential backoff for handling
 * transient failures in distributed systems. Essential for network operations,
 * API calls, database connections, and any operations that may experience
 * temporary failures.
 * 
 * TRANSIENT FAILURE HANDLING:
 * - Network timeouts and connection issues
 * - Rate limiting and service throttling
 * - Temporary service unavailability
 * - Database connection pool exhaustion
 * - Resource contention and temporary locks
 * - Cloud service intermittent failures
 * 
 * EXPONENTIAL BACKOFF STRATEGY:
 * - Initial delay followed by exponential increase (2^n)
 * - Prevents overwhelming recovering services
 * - Reduces retry storms in distributed systems
 * - Gives services time to recover between attempts
 * - Configurable maximum delay to prevent excessive waiting
 * 
 * RETRY LOGIC FEATURES:
 * - Configurable maximum retry attempts
 * - Customizable delay parameters and jitter
 * - Selective retry based on error types
 * - Comprehensive attempt tracking and reporting
 * - Immediate retry termination for non-retryable errors
 * 
 * PERFORMANCE AND RELIABILITY:
 * - Prevents cascading failures through backoff
 * - Reduces system load during recovery periods
 * - Maintains operation resilience without manual intervention
 * - Provides detailed success/failure reporting
 */

/**
 * Configuration options for retry behavior.
 */
interface RetryOptions<T> {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay between retries in milliseconds (default: 1000) */
  baseDelay?: number;
  /** Maximum delay between retries in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Function to determine if an error should be retried (default: retry all) */
  shouldRetry?: (error: unknown) => boolean;
  /** Optional jitter function to add randomness to delays */
  jitter?: (delay: number) => number;
}

/**
 * Result of retry operation with comprehensive status information.
 */
interface RetryResult<T> {
  /** Indicates if the operation succeeded */
  ok: boolean;
  /** The successful result value (only if ok: true) */
  value?: T;
  /** The final error if operation failed (only if ok: false) */
  error?: Error;
  /** Total number of attempts made (including initial attempt) */
  attempts: number;
}

/**
 * Retries an async operation with exponential backoff and configurable options.
 * 
 * This function implements a robust retry strategy with exponential backoff to handle
 * transient failures in distributed systems. It provides fine-grained control over
 * retry behavior while preventing retry storms and overwhelming recovering services.
 * 
 * @param fn - Async function to retry. Should return a Promise<T>.
 * @param options - Configuration options for retry behavior
 * 
 * @returns Promise<RetryResult<T>> - Result object with success status and detailed attempt information
 * 
 * @example
 * ```typescript
 * // Basic retry with default settings
 * const result = await retryWithBackoff(async () => {
 *   return await fetchApiData();
 * });
 * 
 * if (result.ok) {
 *   console.log('Success:', result.value);
 * } else {
 *   console.error('Failed after', result.attempts, 'attempts:', result.error?.message);
 * }
 * 
 * // Advanced configuration with selective retry
 * const apiResult = await retryWithBackoff(
 *   async () => {
 *     const response = await fetch('https://api.example.com/data');
 *     if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *     return response.json();
 *   },
 *   {
 *     maxRetries: 5,
 *     baseDelay: 2000,
 *     maxDelay: 60000,
 *     shouldRetry: (error) => {
 *       // Only retry on network or server errors
 *       return error.message.includes('ECONNRESET') || 
 *              error.message.includes('ETIMEDOUT') ||
 *              error.message.includes('HTTP 5');
 *     },
 *     jitter: (delay) => delay + Math.random() * 1000 // Add jitter
 *   }
 * );
 * 
 * // Database operation with timeout and retry
 * const dbResult = await retryWithBackoff(
 *   async () => {
 *     return await database.query('SELECT * FROM users WHERE active = true');
 *   },
 *   {
 *     maxRetries: 3,
 *     baseDelay: 1000,
 *     maxDelay: 10000
 *   }
 * );
 * ```
 * 
 * @warning Be careful with shouldRetry logic - some errors should never be retried (authentication, validation)
 * @note Exponential backoff: delay = min(baseDelay * 2^attempt, maxDelay)
 * @see Circuit breaker pattern for complementary failure handling
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  options: RetryOptions<T> = {}
): Promise<RetryResult<T>> {
  // OPTIONS CONFIGURATION: Merge defaults with provided options
  const {
    maxRetries = 3,           // Maximum retry attempts
    baseDelay = 1000,         // Starting delay in milliseconds
    maxDelay = 30000,         // Maximum delay cap
    shouldRetry = () => true, // Default: retry all errors
    jitter = (delay) => delay  // Default: no jitter
  } = options;

  let lastError: unknown;      // Store last encountered error
  let attempts = 0;           // Track total attempts made

  // RETRY LOOP: Execute function with retry logic
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;    // Count attempts starting from 1
    
    try {
      // ATTEMPT EXECUTION: Try to execute the function
      const result = await fn();
      
      // SUCCESS: Return successful result immediately
      return { ok: true, value: result, attempts };
      
    } catch (error) {
      // ERROR HANDLING: Store error and determine retry strategy
      lastError = error;
      
      // RETRY CONDITION: Check if we should retry this error
      const isRetryable = shouldRetry(error);
      const isLastAttempt = attempt === maxRetries;
      
      if (isLastAttempt || !isRetryable) {
        // TERMINATION: No more retries or non-retryable error
        return { 
          ok: false, 
          error: error instanceof Error ? error : new Error(String(error)), 
          attempts 
        };
      }
      
      // EXPONENTIAL BACKOFF: Calculate delay for next attempt
      // Formula: delay = min(baseDelay * 2^attempt, maxDelay)
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      // JITTER APPLICATION: Add randomness to prevent thundering herd
      // This helps distribute retry attempts when multiple clients retry simultaneously
      const actualDelay = jitter(exponentialDelay);
      
      // WAIT BEFORE RETRY: Pause for calculated delay
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }

  // SAFETY FALLBACK: This should never be reached but ensures type safety
  return { 
    ok: false, 
    error: lastError instanceof Error ? lastError : new Error(String(lastError)), 
    attempts 
  };
}

export default retryWithBackoff;

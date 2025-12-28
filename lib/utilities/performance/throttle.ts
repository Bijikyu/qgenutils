/**
 * FUNCTION THROTTLING UTILITY
 * 
 * PURPOSE: Limits function execution frequency to a maximum of once per
 * specified delay period. Essential for optimizing performance in scenarios
 * with high-frequency events that don't need to execute on every trigger.
 * 
 * THROTTLING VS DEBOUNCING:
 * - Throttling: Executes at most once every N milliseconds (consistent rate)
 * - Debouncing: Executes only after N milliseconds of inactivity (final call)
 * - Throttling is better for continuous events (scrolling, resizing)
 * - Debouncing is better for input completion (search boxes, form validation)
 * 
 * USE CASES:
 * - Scroll event handlers for performance optimization
 * - Window resize handlers for responsive layouts
 * - Mouse move handlers for drag-and-drop operations
 * - API rate limiting to prevent server overload
 * - Game loop updates and animation frames
 * - Real-time data synchronization with frequency limits
 * 
 * IMPLEMENTATION STRATEGY:
 * - Leading edge execution: Function calls immediately if throttling period has passed
 * - Trailing edge execution: Function calls with most recent arguments after delay
 * - Context preservation: Maintains 'this' binding for object methods
 * - Argument preservation: Uses latest arguments for delayed execution
 * - Timer management: Proper cleanup to prevent memory leaks
 * 
 * PERFORMANCE BENEFITS:
 * - Reduces CPU usage for high-frequency events
 * - Prevents overwhelming external services with API calls
 * - Improves user experience by maintaining responsive interfaces
 * - Provides predictable execution rates for consistent behavior
 */

/**
 * Configuration options for throttling behavior.
 */
interface ThrottleOptions {
  /** Execute function on leading edge (immediate) or trailing edge (delayed) */
  leading?: boolean;
  /** Execute function on trailing edge (after delay) */
  trailing?: boolean;
}

/**
 * Type for the throttled function with management methods.
 */
type ThrottledFunction<T extends (...args: any[]) => any> = T & {
  /** Cancel pending execution */
  cancel: () => void;
  /** Check if function is currently throttled */
  isThrottled: () => boolean;
  /** Flush and execute pending call immediately */
  flush: () => void;
};

/**
 * Throttles function execution to at most once per delay period with edge options.
 * 
 * This function creates a throttled version of the provided function that ensures
 * it executes at most once within the specified delay period. It supports both
 * leading and trailing edge execution strategies for maximum flexibility.
 * 
 * @param fn - The function to throttle. Can be any function type.
 * @param delay - Minimum time in milliseconds between function executions.
 * @param options - Configuration options for throttling behavior
 * 
 * @returns ThrottledFunction<T> - Throttled version with management methods
 * 
 * @example
 * ```typescript
 * // Basic throttling for scroll events
 * const throttledScrollHandler = throttle((event: Event) => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScrollHandler);
 * 
 * // API rate limiting
 * const throttledApiCall = throttle(async (data: any) => {
 *   return await fetch('/api/update', {
 *     method: 'POST',
 *     body: JSON.stringify(data)
 *   });
 * }, 1000); // Maximum 1 call per second
 * 
 * // With leading edge execution (immediate first call)
 * const throttledResize = throttle(() => {
 *   updateLayout();
 * }, 250, { leading: true, trailing: true });
 * 
 * // Using throttled function management
 * throttledScrollHandler.cancel(); // Cancel pending execution
 * console.log(throttledScrollHandler.isThrottled()); // Check throttling status
 * throttledScrollHandler.flush(); // Execute pending call immediately
 * 
 * // Object method throttling with context preservation
 * const obj = {
 *   value: 0,
 *   increment: throttle(function(this: any, amount: number) {
 *     this.value += amount;
 *     console.log('Value:', this.value);
 *   }, 500)
 * };
 * 
 * obj.increment(5); // Context is preserved correctly
 * ```
 * 
 * @warning Be careful with trailing edge execution - may cause delayed updates
 * @note Timer cleanup prevents memory leaks in long-running applications
 * @see debounce for complementary rate limiting with different timing strategy
 */
const throttle = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number,
  options: ThrottleOptions = { leading: true, trailing: true }
): ThrottledFunction<T> => {
  // OPTIONS CONFIGURATION: Set default throttling behavior
  const { leading = true, trailing = true } = options;
  
  // STATE MANAGEMENT: Track timing and execution context
  let lastCall = 0;                    // Timestamp of last execution
  let timeoutId: NodeJS.Timeout | null = null;  // Pending execution timer
  let lastArgs: Parameters<T> | null = null;   // Most recent arguments
  let context: any = null;              // Function execution context
  let isPending = false;                // Track if execution is pending

  /**
   * Creates throttled function with edge execution strategies.
   */
  const throttledFn = (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    lastArgs = args;                    // Store latest arguments
    context = this;                     // Preserve execution context

    // LEADING EDGE EXECUTION: Execute immediately if throttling period has passed
    if (leading && now - lastCall >= delay) {
      lastCall = now;
      isPending = false;
      return fn.apply(context, args);
    }

    // TRAILING EDGE SETUP: Schedule execution if not already pending
    if (trailing && !isPending) {
      isPending = true;
      
      // CLEANUP: Cancel any existing pending execution
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // SCHEDULE DELAYED EXECUTION: Execute with remaining time
      const remainingTime = delay - (now - lastCall);
      timeoutId = setTimeout(() => {
        // Execute with most recent arguments and context
        lastCall = Date.now();
        isPending = false;
        timeoutId = null;
        
        if (lastArgs) {
          fn.apply(context, lastArgs);
        }
      }, Math.max(remainingTime, 0)); // Ensure non-negative delay
    }
  };

  /**
   * Cancels any pending function execution.
   */
  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isPending = false;
    lastArgs = null;
  };

  /**
   * Checks if function execution is currently pending.
   */
  const isThrottled = (): boolean => {
    return isPending;
  };

  /**
   * Executes pending function call immediately and clears throttling timer.
   */
  const flush = (): ReturnType<T> | undefined => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastCall = Date.now();
      isPending = false;
      
      const result = fn.apply(context, lastArgs);
      lastArgs = null;
      return result;
    }
    return undefined;
  };

  // ENHANCED FUNCTION: Attach management methods
  Object.assign(throttledFn, {
    cancel,
    isThrottled,
    flush
  });

  return throttledFn as ThrottledFunction<T>;
};

export default throttle;

/**
 * Throttle utility - lodash.throttle wrapper
 *
 * PURPOSE: Provides function throttling using lodash's well-tested
 * implementation. This eliminates redundant code while maintaining
 * the same API for existing consumers.
 *
 * Throttling limits the rate at which a function gets called, ensuring
 * it executes at most once per specified time interval. This is useful for:
 * - Scroll event handlers (smooth performance without lag)
 * - Mouse move events (track position without overwhelming system)
 * - API rate limiting (prevent excessive server requests)
 * - Resize event handlers (responsive UI updates)
 *
 * @param fn - Function to throttle (should be pure for best results)
 * @param delay - Delay in milliseconds between function executions
 * @param options - Configuration options for throttling behavior
 * @returns Throttled function with rate-limited execution
 */

import _ from 'lodash';

/**
 * Configuration options for throttled functions
 */
interface ThrottleOptions {
  leading?: boolean;      // Execute on leading edge of delay
  trailing?: boolean;     // Execute on trailing edge of delay
}

/**
 * Creates a throttled version of the provided function
 *
 * @param fn - Function to throttle
 * @param delay - Delay in milliseconds between executions
 * @param options - Optional configuration for throttling behavior
 * @returns Throttled function with rate-limited execution
 */
const throttle = (
  fn: (...args: any[]) => any,
  delay: number,
  options?: ThrottleOptions
): ((...args: any[]) => any) => {
  return _.throttle(fn, delay, options);
};

export default throttle;
export type { ThrottleOptions };

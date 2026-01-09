/**
 * Debounce utility - lodash.debounce wrapper
 *
 * PURPOSE: Provides function debouncing using lodash's well-tested
 * implementation. This eliminates redundant code while maintaining
 * the same API for existing consumers.
 *
 * Debouncing limits the rate at which a function gets called. This is
 * particularly useful for performance optimization in scenarios like:
 * - Search input handling (wait for user to stop typing)
 * - Window resize events (avoid excessive recalculations)
 * - API calls (prevent duplicate requests)
 * - Scroll event handlers (smooth performance)
 *
 * @param fn - Function to debounce (should be pure for best results)
 * @param delay - Delay in milliseconds before function executes
 * @param options - Configuration options for debouncing behavior
 * @returns Debounced function with delayed execution
 */

import _ from 'lodash';

/**
 * Configuration options for debounced functions
 */
interface DebounceOptions {
  leading?: boolean;      // Execute on leading edge of delay
  trailing?: boolean;     // Execute on trailing edge of delay
  maxWait?: number;      // Maximum time to wait before execution
}

/**
 * Creates a debounced version of the provided function
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Optional configuration for debouncing behavior
 * @returns Debounced function that delays execution
 */
const debounce = (
  fn: (...args: any[]) => any,
  delay: number,
  options?: DebounceOptions
): ((...args: any[]) => any) => {
  return _.debounce(fn, delay, options);
};

export default debounce;
export type { DebounceOptions };

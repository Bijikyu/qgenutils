/**
 * Debounce utility - lodash.debounce wrapper
 * 
 * PURPOSE: Provides function debouncing using lodash's well-tested
 * implementation. This eliminates redundant code while maintaining
 * the same API for existing consumers.
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Debounce options
 * @returns Debounced function
 */

import _ from 'lodash';

const debounce = (
  fn: (...args: any[]) => any,
  delay: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): ((...args: any[]) => any) => {
  return _.debounce(fn, delay, options);
};

export default debounce;
/**
 * Memoization utility - lodash.memoize wrapper
 * 
 * PURPOSE: Provides function memoization using lodash's well-tested
 * implementation. This eliminates redundant code while maintaining
 * the same API for existing consumers.
 * 
 * Memoization caches function results based on input arguments,
 * preventing expensive recomputation for identical inputs.
 * This is particularly useful for pure functions and expensive calculations.
 * 
 * @param fn - Function to memoize (should be pure for best results)
 * @param resolver - Optional function to generate cache keys from arguments
 * @returns Memoized function with cached results
 */

import _ from 'lodash';

/**
 * Creates a memoized version of the provided function
 * 
 * @param fn - Function to memoize
 * @param resolver - Optional function to resolve cache keys from arguments
 * @returns Memoized function that caches results
 */
const memoize = (
  fn: (...args: any[]) => any, 
  resolver?: (...args: any[]) => any
): ((...args: any[]) => any) => _.memoize(fn, resolver);

export default memoize;
/**
 * Memoization utility - lodash.memoize wrapper
 * 
 * PURPOSE: Provides function memoization using lodash's well-tested
 * implementation. This eliminates redundant code while maintaining
 * the same API for existing consumers.
 * 
 * @param fn - Function to memoize
 * @param resolver - Optional function to generate cache keys
 * @returns Memoized function
 */

import _ from'lodash';const memoize=(fn:(...args:any[])=>any,resolver?:(...args:any[])=>any):((...args:any[])=>any)=>_.memoize(fn,resolver);

export default memoize;
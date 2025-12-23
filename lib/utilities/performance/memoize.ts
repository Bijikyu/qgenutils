/**
 * Memoizes a function with optional LRU cache.
 *
 * PURPOSE: Caches expensive computation results to avoid
 * redundant work. LRU eviction prevents unbounded memory growth.
 *
 * @param {Function} fn - Function to memoize
 * @param {number} [maxSize] - Maximum cache entries (LRU eviction)
 * @returns {Function} Memoized function
 */
const memoize = (fn, maxSize: any): any => {
  const cache: any = new Map();
  
  return (...args: any): any => {
    const key: any = JSON.stringify(args);
    
if (cache.has(key)) {
      const value: any = cache.get(key);
      // Move to end (LRU behavior) by deleting and re-inserting
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    
    const result: any = fn.apply(this, args);
    
    if (maxSize && cache.size >= maxSize) {
      cache.delete(cache.keys().next().value);
    }
    
    cache.set(key, result);
    return result;
  };
};

export default memoize;

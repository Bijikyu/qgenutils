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
function memoize(fn, maxSize) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    
    const result = fn.apply(this, args);
    
    if (maxSize && cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  };
}

module.exports = memoize;

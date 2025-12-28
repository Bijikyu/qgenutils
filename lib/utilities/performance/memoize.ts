/**
 * MEMOIZATION UTILITY WITH LRU CACHE
 * 
 * PURPOSE: Provides function memoization with LRU (Least Recently Used) cache
 * to optimize performance by caching expensive computation results. This avoids
 * redundant work when the same inputs are used repeatedly.
 * 
 * MEMOIZATION BENEFITS:
 * - Eliminates redundant expensive calculations
 * - Improves response time for repeated operations
 * - Reduces CPU usage and computational overhead
 * - Maintains referential transparency for pure functions
 * - Provides measurable performance improvements
 * 
 * LRU CACHE STRATEGY:
 * - Least Recently Used eviction prevents unbounded memory growth
 * - Efficient O(1) cache operations using Map data structure
 * - Maintains most frequently used results in cache
 * - Configurable maximum cache size for memory control
 * - Automatic cleanup of old entries when capacity is reached
 * 
 * USE CASES:
 * - Mathematical computations and algorithms
 * - API response caching with identical parameters
 * - Complex data transformations and parsing
 * - Database query result caching
 * - Expensive validation or sanitization
 * - Recursive function optimization (Fibonacci, factorial)
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Cache hit provides O(1) lookup time
 * - Cache miss incurs function execution + O(1) storage
 * - JSON.stringify overhead for complex arguments
 * - Memory usage scales with cache size and result complexity
 * - LRU eviction ensures predictable memory footprint
 */

/**
 * Configuration options for memoization behavior.
 */
interface MemoizeOptions {
  /** Maximum number of cached entries (undefined for unlimited) */
  maxSize?: number;
  /** Custom key generator function (default: JSON.stringify) */
  keyGenerator?: (...args: any[]) => string;
  /** Cache statistics tracking */
  enableStats?: boolean;
}

/**
 * Cache statistics for monitoring memoization effectiveness.
 */
interface CacheStats {
  /** Total number of cache lookups */
  lookups: number;
  /** Number of times value was found in cache */
  hits: number;
  /** Number of times value was computed and cached */
  misses: number;
  /** Current number of entries in cache */
  size: number;
  /** Cache hit ratio (0-1) */
  hitRatio: number;
}

/**
 * Memoizes a function with optional LRU cache and performance tracking.
 * 
 * This function creates a memoized version of the provided function that caches
 * results based on input arguments. It uses LRU (Least Recently Used) eviction
 * strategy to manage memory usage while maintaining optimal performance.
 * 
 * @param fn - The function to memoize. Should be pure (same inputs = same outputs).
 * @param options - Configuration options for memoization behavior
 * 
 * @returns MemoizedFunction<T> - Memoized version of the input function with cache management
 * 
 * @example
 * ```typescript
 * // Basic memoization
 * const expensiveCalculation = memoize((n: number) => {
 *   console.log('Computing factorial...');
 *   return n <= 1 ? 1 : n * expensiveCalculation(n - 1);
 * });
 * 
 * console.log(expensiveCalculation(5)); // Computes and caches
 * console.log(expensiveCalculation(5)); // Returns cached result
 * console.log(expensiveCalculation(6)); // Computes new value
 * 
 * // With LRU cache size limit
 * const apiMemoizer = memoize(fetchUserData, { maxSize: 100 });
 * 
 * // Custom key generator for complex objects
 * const complexMemoizer = memoize(processData, {
 *   keyGenerator: (user, options) => `${user.id}-${JSON.stringify(options)}`
 * });
 * 
 * // With statistics tracking
 * const memoizedFunction = memoize(expensiveOperation, {
 *   maxSize: 50,
 *   enableStats: true
 * });
 * 
 * // After usage, check performance
 * const stats = memoizedFunction.getStats();
 * console.log(`Cache hit ratio: ${(stats.hitRatio * 100).toFixed(1)}%`);
 * 
 * // Clear cache manually if needed
 * memoizedFunction.clearCache();
 * ```
 * 
 * @warning Only memoize pure functions to avoid unexpected behavior
 * @note JSON.stringify is used as default key generator - may not work for circular references
 * @consider Use WeakMap for object-based keys if memory is a concern
 * @see LRU cache pattern for memory management strategy
 */
type MemoizedFunction<T extends (...args: any[]) => any> = T & {
  /** Clear all cached entries */
  clearCache: () => void;
  /** Get current cache statistics (if enabled) */
  getStats: () => CacheStats;
  /** Get current cache size */
  getCacheSize: () => number;
};

const memoize = <T extends (...args: any[]) => any>(
  fn: T, 
  options: MemoizeOptions = {}
): MemoizedFunction<T> => {
  // OPTIONS CONFIGURATION: Extract memoization settings
  const {
    maxSize,                           // Maximum cache entries
    keyGenerator = JSON.stringify,     // Default key generation
    enableStats = false                // Performance tracking
  } = options;

  // CACHE INITIALIZATION: Set up data structures
  const cache = new Map<string, ReturnType<T>>();  // Main cache storage
  
  // STATISTICS TRACKING: Initialize counters if enabled
  let stats: CacheStats | null = enableStats ? {
    lookups: 0,
    hits: 0,
    misses: 0,
    size: 0,
    hitRatio: 0
  } : null;

  /**
   * Creates the memoized function with cache management.
   */
  const memoizedFn = (...args: Parameters<T>): ReturnType<T> => {
    // STATISTICS UPDATE: Increment lookup counter
    if (stats) {
      stats.lookups++;
    }

    // KEY GENERATION: Create cache key from function arguments
    const key = keyGenerator(...args);
    
    // CACHE HIT: Return cached value if exists
    if (cache.has(key)) {
      const value = cache.get(key)!;
      
      // LRU UPDATE: Move to end (most recently used)
      cache.delete(key);
      cache.set(key, value);
      
      // STATISTICS UPDATE: Record cache hit
      if (stats) {
        stats.hits++;
        stats.hitRatio = stats.hits / stats.lookups;
      }
      
      return value;
    }
    
    // CACHE MISS: Compute and cache the result
    const result = fn.apply(this, args);
    
    // CACHE MANAGEMENT: Enforce size limits if configured
    if (maxSize && cache.size >= maxSize) {
      // LRU EVICTION: Remove oldest entry (first in Map)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    // CACHE STORAGE: Store new result
    cache.set(key, result);
    
    // STATISTICS UPDATE: Record cache miss
    if (stats) {
      stats.misses++;
      stats.size = cache.size;
      stats.hitRatio = stats.hits / stats.lookups;
    }
    
    return result;
  };

  /**
   * Clears all cached entries and resets statistics.
   */
  const clearCache = (): void => {
    cache.clear();
    if (stats) {
      stats.lookups = 0;
      stats.hits = 0;
      stats.misses = 0;
      stats.size = 0;
      stats.hitRatio = 0;
    }
  };

  /**
   * Returns current cache statistics.
   */
  const getStats = (): CacheStats => {
    if (!stats) {
      throw new Error('Statistics tracking not enabled. Set enableStats: true in options.');
    }
    
    // Ensure stats are current
    stats.size = cache.size;
    stats.hitRatio = stats.lookups > 0 ? stats.hits / stats.lookups : 0;
    
    return { ...stats };
  };

  /**
   * Returns current cache size.
   */
  const getCacheSize = (): number => {
    return cache.size;
  };

  // ENHANCED FUNCTION: Attach management methods to memoized function
  Object.assign(memoizedFn, {
    clearCache,
    getStats,
    getCacheSize
  });

  return memoizedFn as MemoizedFunction<T>;
};

export default memoize;

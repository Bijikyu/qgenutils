/**
 * SHARED COLLECTION UTILITIES
 * 
 * PURPOSE: Provides common array and object manipulation patterns.
 * This utility eliminates duplication of collection transformation logic.
 * 
 * DESIGN PRINCIPLES:
 * - Functional programming approach
 * - Immutable operations
 * - Type-safe implementations
 * - Performance optimized
 * - Chainable operations
 */

/**
 * Array manipulation utilities.
 */
export const ArrayUtils = {
  /**
   * Safely groups array items by a key function.
   */
  groupBy: <T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> => {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  },

  /**
   * Safely chunks array into smaller arrays.
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    if (size <= 0) throw new Error('Chunk size must be greater than 0');
    
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Removes duplicates based on a key function.
   */
  uniqueBy: <T>(array: T[], keyFn?: (item: T) => any): T[] => {
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn ? keyFn(item) : item;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  /**
   * Flattens nested arrays.
   */
  flatten: <T>(array: (T | T[])[]): T[] => {
    const result: T[] = [];
    array.forEach(item => {
      if (Array.isArray(item)) {
        result.push(...ArrayUtils.flatten(item));
      } else {
        result.push(item);
      }
    });
    return result;
  },

  /**
   * Partitions array into two groups based on predicate.
   */
  partition: <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
    const truthy: T[] = [];
    const falsy: T[] = [];
    
    array.forEach(item => {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    });
    
    return [truthy, falsy];
  },

  /**
   * Returns random sample from array.
   */
  sample: <T>(array: T[], count: number = 1): T[] => {
    if (count > array.length) throw new Error('Sample count cannot exceed array length');
    if (count <= 0) return [];
    
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /**
   * Checks if array is empty or null/undefined.
   */
  isEmpty: <T>(array: T[] | null | undefined): boolean => {
    return !array || array.length === 0;
  },

  /**
   * Safe array access with default.
   */
  safeGet: <T>(array: T[], index: number, defaultValue: T): T => {
    return index >= 0 && index < array.length ? array[index] : defaultValue;
  }
};

/**
 * Object manipulation utilities.
 */
export const ObjectUtils = {
  /**
   * Deep merges objects without mutation.
   */
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = ObjectUtils.deepMerge((result[key] || {}) as any, source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
    
    return result;
  },

  /**
   * Picks specified properties from object.
   */
  pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  /**
   * Omit specified properties from object.
   */
  omit: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  /**
   * Converts object to query string.
   */
  toQueryString: (obj: Record<string, any>): string => {
    const params = new URLSearchParams();
    
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });
    
    return params.toString();
  },

  /**
   * Checks if object is empty.
   */
  isEmpty: (obj: any): boolean => {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object' && obj !== null) return Object.keys(obj).length === 0;
    return false;
  },

  /**
   * Safe property access with default.
   */
  safeGet: <T>(obj: any, path: string, defaultValue: T): T => {
    const keys = path.split('.');
    let current: any = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current as T;
  },

  /**
   * Creates nested object from dot notation.
   */
  fromPath: <T extends Record<string, any>>(paths: T): Record<string, any> => {
    const result: Record<string, any> = {};
    
    Object.entries(paths).forEach(([path, value]) => {
      const keys = path.split('.');
      let current = result;
      
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          (current as any)[key] = value;
        } else {
          (current as any)[key] = (current as any)[key] || {};
          current = (current as any)[key];
        }
      });
    });
    
    return result;
  }
};

/**
 * Map-like utilities for custom collections.
 */
export const MapUtils = {
  /**
   * Creates a map from array using key function.
   */
  fromArray: <T, K>(array: T[], keyFn: (item: T) => K): Map<K, T> => {
    const map = new Map<K, T>();
    array.forEach(item => {
      const key = keyFn(item);
      map.set(key, item);
    });
    return map;
  },

  /**
   * Groups array items into map of arrays.
   */
  groupToArray: <T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> => {
    const map = new Map<K, T[]>();
    
    array.forEach(item => {
      const key = keyFn(item);
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    });
    
    return map;
  },

  /**
   * Converts map to object (for JSON serialization).
   */
  toObject: <K extends string | number, V>(map: Map<K, V>): Record<string, V> => {
    const obj: Record<string, V> = {};
    map.forEach((value, key) => {
      obj[String(key)] = value;
    });
    return obj;
  },

  /**
   * Merges multiple maps.
   */
  merge: <K, V>(...maps: Map<K, V>[]): Map<K, V> => {
    const result = new Map<K, V>();
    maps.forEach(map => {
      map.forEach((value, key) => {
        result.set(key, value);
      });
    });
    return result;
  }
};

/**
 * Set utilities with extended functionality.
 */
export const SetUtils = {
  /**
   * Creates set from array using key function.
   */
  fromArray: <T, K>(array: T[], keyFn?: (item: T) => K): Set<K | T> => {
    if (keyFn) {
      return new Set(array.map(keyFn)) as Set<K>;
    }
    return new Set(array) as Set<T>;
  },

  /**
   * Filters set by predicate.
   */
  filter: <T>(set: Set<T>, predicate: (item: T) => boolean): Set<T> => {
    const result = new Set<T>();
    set.forEach(item => {
      if (predicate(item)) {
        result.add(item);
      }
    });
    return result;
  },

  /**
   * Maps set values.
   */
  map: <T, U>(set: Set<T>, mapFn: (item: T) => U): Set<U> => {
    const result = new Set<U>();
    set.forEach(item => {
      result.add(mapFn(item));
    });
    return result;
  },

  /**
   * Checks if any item satisfies predicate.
   */
  some: <T>(set: Set<T>, predicate: (item: T) => boolean): boolean => {
    for (const item of set) {
      if (predicate(item)) return true;
    }
    return false;
  },

  /**
   * Checks if all items satisfy predicate.
   */
  every: <T>(set: Set<T>, predicate: (item: T) => boolean): boolean => {
    for (const item of set) {
      if (!predicate(item)) return false;
    }
    return true;
  }
};

/**
 * Performance-optimized collection utilities.
 */
export const PerformanceUtils = {
  /**
   * Efficient array sorting with custom comparator.
   */
  sortBy: <T>(array: T[], compareFn: (a: T, b: T) => number): T[] => {
    return [...array].sort(compareFn);
  },

  /**
   * Efficient binary search.
   */
  binarySearch: <T>(array: T[], target: T, compareFn: (a: T, b: T) => number): number => {
    let left = 0;
    let right = array.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = compareFn(array[mid], target);
      
      if (comparison === 0) return mid;
      if (comparison < 0) left = mid + 1;
      else right = mid - 1;
    }
    
    return -1;
  },

  /**
   * Memoized function for expensive operations.
   */
  memoize: <T extends (...args: any[]) => any>(fn: T, keyFn?: (...args: Parameters<T>) => string): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = fn(...args);
      cache.set(key, result);
      
      // Simple LRU cleanup for large caches
      if (cache.size > 1000) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      return result;
    }) as T;
  }
};

// Export all collection utilities
export const CollectionUtils = {
  Array: ArrayUtils,
  Object: ObjectUtils,
  Map: MapUtils,
  Set: SetUtils,
  Performance: PerformanceUtils
};

export default CollectionUtils;
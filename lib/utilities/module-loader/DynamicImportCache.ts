import loadAndFlattenModule from './loadAndFlattenModule.js';

interface CachedModule {
  module: any;
  loadTime: number;
  lastAccessed: number;
  prev?: string;
  next?: string;
}

interface DynamicImportCacheOptions {
  maxCacheSize?: number;
  cacheTimeoutMs?: number;
  cleanupIntervalMs?: number;
  flattenModules?: boolean;
}

/**
 * Dynamic Import Cache Manager
 * 
 * Caches and manages dynamic import() calls to avoid redundant module loading.
 * Provides LRU eviction, timeout-based expiry, hit/miss statistics, and lifecycle helpers.
 * 
 * Features:
 * - Pre-caching of commonly used modules at startup
 * - LRU eviction when cache is full
 * - Automatic timeout-based cleanup
 * - Hit/miss statistics tracking
 * - Database driver name normalization
 * - CJS/ESM interop via loadAndFlattenModule
 * 
 * @example
 * const cache = new DynamicImportCache({ maxCacheSize: 50, cacheTimeoutMs: 300000 });
 * await cache.preCacheModules();
 * const redis = await cache.getModule('redis');
 */
class DynamicImportCache {
  private cache = new Map<string, CachedModule>();
  private readonly maxCacheSize: number;
  private readonly cacheTimeoutMs: number;
  private readonly flattenModules: boolean;
  private cleanupInterval?: ReturnType<typeof setInterval>;
  private hitCount = 0;
  private missCount = 0;
  private preCachedModules: Record<string, any> = {};
  // LRU optimization
  private lruHead: string | null = null;
  private lruTail: string | null = null;

  constructor(options: DynamicImportCacheOptions = {}) {
    const {
      maxCacheSize = 100,
      cacheTimeoutMs = 5 * 60 * 1000,
      cleanupIntervalMs = 2 * 60 * 1000,
      flattenModules = true
    } = options;

    this.maxCacheSize = maxCacheSize;
    this.cacheTimeoutMs = cacheTimeoutMs;
    this.flattenModules = flattenModules;

    if (cleanupIntervalMs > 0) {
      this.startCleanup(cleanupIntervalMs);
    }
  }

  /**
   * Pre-cache commonly used modules at startup
   * Makes modules available faster for subsequent requests
   */
  async preCacheModules(moduleNames?: string[]): Promise<void> {
    const defaultModules = [
      'redis',
      'pg',
      'mysql2/promise',
      'mongodb',
      'net',
      'fs/promises',
      'child_process',
      'crypto',
      'zlib'
    ];

    const modulesToPreCache = moduleNames || defaultModules;

    const preCachePromises = modulesToPreCache.map(async (moduleName) => {
      try {
        const module = await this.getModule(moduleName);
        // Store in instance property instead of global state to prevent pollution
        const parts = moduleName.split('/');
        const shortName = parts.length > 0 ? parts[0] : moduleName;
        this.preCachedModules[shortName] = module;
        console.log(`[INFO] Pre-cached module: ${moduleName}`);
      } catch (error) {
        console.warn(`[WARN] Failed to pre-cache module ${moduleName}:`, (error as Error).message);
      }
    });

    await Promise.allSettled(preCachePromises);
  }

  /**
   * Get a module from cache or load it dynamically
   * Uses LRU eviction when cache is full
   * 
   * @param moduleName - Name of the module to load
   * @param options - Optional loading options
   * @returns Loaded module or null if unavailable
   */
  // Track module loading to prevent race conditions
  private moduleLoading = new Map<string, Promise<any>>();

  async getModule<T = any>(moduleName: string, options: { flatten?: boolean } = {}): Promise<T | null> {
    const cacheKey = moduleName;
    const now = Date.now();
    const shouldFlatten = options.flatten ?? this.flattenModules;

    // Check cache first to avoid unnecessary loading
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.loadTime) < this.cacheTimeoutMs) {
      cached.lastAccessed = now;
      this.hitCount++;
      // Move to head of LRU list (O(1) operation)
      this.moveToHead(cacheKey);
      return cached.module;
    }

    // Check if module is currently being loaded (race condition protection)
    if (this.moduleLoading.has(cacheKey)) {
      try {
        return await this.moduleLoading.get(cacheKey);
      } catch {
        // If loading failed, clean up and continue to retry
        this.moduleLoading.delete(cacheKey);
      }
    }

    this.missCount++;

    // Create loading promise atomically to prevent race conditions
    const loadingPromise = (async () => {
      let module: any;
      
      if (shouldFlatten) {
        module = await loadAndFlattenModule(moduleName);
      } else {
        const imported = await import(moduleName);
        module = imported?.default ?? imported;
      }

      if (module === null) {
        return null;
      }

      const cachedModule: CachedModule = {
        module,
        loadTime: now,
        lastAccessed: now
      };

      if (this.cache.size >= this.maxCacheSize) {
        this.evictOldestModule();
      }

      this.cache.set(cacheKey, cachedModule);
      // Add to head of LRU list
      this.addToHead(cacheKey);
      return module;
    })();

    // Store loading promise and handle cleanup
    // Check if someone else already set the promise (race condition)
    const existingPromise = this.moduleLoading.get(cacheKey);
    if (existingPromise && existingPromise !== loadingPromise) {
      // Another request started loading first, wait for theirs
      try {
        return await existingPromise;
      } catch {
        // If theirs failed, proceed with ours
      }
    }
    
    if (!existingPromise) {
      this.moduleLoading.set(cacheKey, loadingPromise);
    }
    
    try {
      const result = await loadingPromise;
      return result;
    } finally {
      // Only clean up if this is the promise we stored
      if (this.moduleLoading.get(cacheKey) === loadingPromise) {
        this.moduleLoading.delete(cacheKey);
      }
    }
  }

  /**
   * Get database-specific modules with driver name normalization
   * Maps common database type names to their npm package names
   * 
   * @param dbType - Database type (redis, postgresql, postgres, mysql, mongodb, generic)
   * @returns Loaded database module
   */
  async getDatabaseModule(dbType: string): Promise<any> {
    const moduleMap: Record<string, string> = {
      'redis': 'redis',
      'postgresql': 'pg',
      'postgres': 'pg',
      'mysql': 'mysql2/promise',
      'mongodb': 'mongodb',
      'sqlite': 'better-sqlite3',
      'generic': 'net'
    };

    const moduleName = moduleMap[dbType.toLowerCase()] || 'net';
    return await this.getModule(moduleName);
  }

  /**
   * Check if a module is currently cached and not expired
   */
  has(moduleName: string): boolean {
    const cached = this.cache.get(moduleName);
    if (!cached) return false;
    const now = Date.now();
    return (now - cached.loadTime) < this.cacheTimeoutMs;
  }

  /**
   * Invalidate a specific cached module
   */
  invalidate(moduleName: string): boolean {
    return this.cache.delete(moduleName);
  }

  private evictOldestModule(): void {
    // O(1) LRU eviction - remove from tail
    if (this.lruTail) {
      const tailKey = this.lruTail;
      const tailModule = this.cache.get(tailKey);
      
      if (tailModule) {
        // Update linked list
        if (tailModule.prev) {
          const prevModule = this.cache.get(tailModule.prev);
          if (prevModule) {
            prevModule.next = undefined;
          }
          this.lruTail = tailModule.prev;
        } else {
          // This was the only item
          this.lruHead = null;
          this.lruTail = null;
        }
        
        this.cache.delete(tailKey);
      }
    }
  }

  /**
   * Clean up expired entries from the cache
   */
  cleanup(): void {
    const now = Date.now();
    let current = this.lruHead;
    const expiredKeys: string[] = [];

    // O(n) traversal but only through linked list, not creating arrays
    while (current) {
      const cached = this.cache.get(current);
      if (cached && (now - cached.loadTime) > this.cacheTimeoutMs) {
        expiredKeys.push(current);
      }
      current = cached?.next || null;
    }

    // Remove expired entries and update linked list
    expiredKeys.forEach(key => {
      const cached = this.cache.get(key);
      if (cached) {
        // Update linked list pointers
        if (cached.prev) {
          const prevModule = this.cache.get(cached.prev);
          if (prevModule) {
            prevModule.next = cached.next;
          }
        } else {
          // This was the head
          this.lruHead = cached.next || null;
        }
        
        if (cached.next) {
          const nextModule = this.cache.get(cached.next);
          if (nextModule) {
            nextModule.prev = cached.prev;
          }
        } else {
          // This was the tail
          this.lruTail = cached.prev || null;
        }
        
        this.cache.delete(key);
      }
    });
  }

// LRU management methods
  private moveToHead(key: string): void {
    const cached = this.cache.get(key);
    if (!cached) return;

    // If already at head, no action needed
    if (this.lruHead === key) return;

    // Remove from current position
    if (cached.prev) {
      const prevModule = this.cache.get(cached.prev);
      if (prevModule) {
        prevModule.next = cached.next || undefined;
      }
    }

    if (cached.next) {
      const nextModule = this.cache.get(cached.next);
      if (nextModule) {
        nextModule.prev = cached.prev || undefined;
      }
    } else {
      // This was the tail
      this.lruTail = cached.prev || null;
    }

    // Add to head
    cached.prev = undefined;
    cached.next = this.lruHead || undefined;
    
    if (this.lruHead) {
      const headModule = this.cache.get(this.lruHead);
      if (headModule) {
        headModule.prev = key;
      }
    }
    
    this.lruHead = key;
    
    if (!this.lruTail) {
      this.lruTail = key;
    }


  }

  private addToHead(key: string): void {
    const cached = this.cache.get(key);
    if (!cached) return;

    cached.prev = undefined;
    cached.next = this.lruHead || undefined;
    
    if (this.lruHead) {
      const headModule = this.cache.get(this.lruHead);
      if (headModule) {
        headModule.prev = key;
      }
    }
    
    this.lruHead = key;
    
    if (!this.lruTail) {
      this.lruTail = key;
    }
  }

  private startCleanup(intervalMs: number): void {
    try {
      // Clear any existing interval to prevent memory leaks
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      
      this.cleanupInterval = setInterval(() => {
        try {
          this.cleanup();
        } catch (error) {
          console.error('Error during cache cleanup:', error instanceof Error ? error.message : String(error));
        }
      }, intervalMs);

      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    } catch (error) {
      console.error('Failed to start cleanup interval:', error instanceof Error ? error.message : String(error));
      // Fallback: disable cleanup if interval creation fails
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Get cache statistics
   * @returns Object containing size, maxSize, hitRate, hitCount, and missCount
   */
  getStats(): { 
    size: number; 
    maxSize: number; 
    hitRate: number; 
    hitCount: number; 
    missCount: number;
    cacheTimeoutMs: number;
  } {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: Math.round(hitRate * 100) / 100,
      hitCount: this.hitCount,
      missCount: this.missCount,
      cacheTimeoutMs: this.cacheTimeoutMs
    };
  }

  /**
   * Reset statistics counters
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Clear all cached modules
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Shutdown the cache and cleanup resources
   * Call this before application shutdown
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
  }

  /**
   * Get list of currently cached module names
   */
  getCachedModules(): string[] {
    return Array.from(this.cache.keys());
  }
}

const dynamicImportCache = new DynamicImportCache();

export const getDynamicModule = <T = any>(moduleName: string): Promise<T | null> =>
  dynamicImportCache.getModule<T>(moduleName);

export const getDatabaseModule = (dbType: string): Promise<any> =>
  dynamicImportCache.getDatabaseModule(dbType);

export const preCacheDynamicModules = (moduleNames?: string[]): Promise<void> =>
  dynamicImportCache.preCacheModules(moduleNames);

export const cleanupDynamicImportCache = (): void =>
  dynamicImportCache.cleanup();

export const clearDynamicImportCache = (): void =>
  dynamicImportCache.clear();

export const shutdownDynamicImportCache = (): void =>
  dynamicImportCache.shutdown();

export const getDynamicImportCacheStats = () =>
  dynamicImportCache.getStats();

export const hasCachedModule = (moduleName: string): boolean =>
  dynamicImportCache.has(moduleName);

export const invalidateCachedModule = (moduleName: string): boolean =>
  dynamicImportCache.invalidate(moduleName);

export { DynamicImportCache };
export default DynamicImportCache;

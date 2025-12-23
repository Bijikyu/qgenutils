import loadAndFlattenModule from './loadAndFlattenModule';

interface CachedModule {
  module: any;
  loadTime: number;
  lastAccessed: number;
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
        if (!(globalThis as any).cachedModules) {
          (globalThis as any).cachedModules = {};
        }
        const parts = moduleName.split('/');
        const shortName = parts.length > 0 ? parts[0] : moduleName;
        (globalThis as any).cachedModules[shortName] = module;
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
  async getModule<T = any>(moduleName: string, options: { flatten?: boolean } = {}): Promise<T | null> {
    const cacheKey = moduleName;
    const now = Date.now();
    const shouldFlatten = options.flatten ?? this.flattenModules;

    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.loadTime) < this.cacheTimeoutMs) {
      cached.lastAccessed = now;
      this.hitCount++;
      return cached.module;
    }

    this.missCount++;

    try {
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
      return module;
    } catch (error) {
      console.error(`[ERROR] Failed to load module ${moduleName}:`, error);
      return null;
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
    let oldestKey: string | null = null;
    let oldestAccessed = Date.now();

    const entries = Array.from(this.cache.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, cached] = entries[i];
      if (cached.lastAccessed < oldestAccessed) {
        oldestAccessed = cached.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries from the cache
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, cached] = entries[i];
      if ((now - cached.loadTime) > this.cacheTimeoutMs) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
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

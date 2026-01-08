const mod = require('./DynamicImportCache');
const DynamicImportCache = mod.DynamicImportCache || mod.default;
const {
  getDynamicModule,
  getDatabaseModule,
  clearDynamicImportCache,
  getDynamicImportCacheStats,
  hasCachedModule,
  invalidateCachedModule,
  shutdownDynamicImportCache
} = mod;

describe('DynamicImportCache', () => {
  let cache;

  beforeEach(() => {
    cache = new DynamicImportCache({
      maxCacheSize: 5,
      cacheTimeoutMs: 1000,
      cleanupIntervalMs: 0
    });
  });

  afterEach(() => {
    cache.shutdown();
  });

  describe('constructor', () => {
    it('should create cache with default options', () => {
      const defaultCache = new DynamicImportCache();
      const stats = defaultCache.getStats();
      expect(stats.maxSize).toBe(100);
      expect(stats.cacheTimeoutMs).toBe(5 * 60 * 1000);
      defaultCache.shutdown();
    });

    it('should create cache with custom options', () => {
      const stats = cache.getStats();
      expect(stats.maxSize).toBe(5);
      expect(stats.cacheTimeoutMs).toBe(1000);
    });
  });

  describe('getModule', () => {
    it('should load built-in modules', async () => {
      const fsModule = await cache.getModule('fs');
      expect(fsModule).not.toBeNull();
    });

    it('should cache loaded modules', async () => {
      await cache.getModule('path');
      await cache.getModule('path');
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
    });

    it('should return null for non-existent modules', async () => {
      const result = await cache.getModule('non-existent-module-xyz');
      expect(result).toBeNull();
    });

    it('should track hit/miss statistics', async () => {
      await cache.getModule('os');
      await cache.getModule('os');
      await cache.getModule('os');
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(2);
      expect(stats.missCount).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 0);
    });
  });

  describe('getDatabaseModule', () => {
    it('should fallback to net for unknown types', async () => {
      const result = await cache.getDatabaseModule('unknown-db');
      expect(result).not.toBeNull();
    });

    it('should handle generic type', async () => {
      const result = await cache.getDatabaseModule('generic');
      expect(result).not.toBeNull();
    });
  });

  describe('has', () => {
    it('should return false for uncached modules', () => {
      expect(cache.has('uncached-module')).toBe(false);
    });

    it('should return true for cached modules', async () => {
      await cache.getModule('url');
      expect(cache.has('url')).toBe(true);
    });
  });

  describe('invalidate', () => {
    it('should remove cached module', async () => {
      await cache.getModule('util');
      expect(cache.has('util')).toBe(true);
      const result = cache.invalidate('util');
      expect(result).toBe(true);
      expect(cache.has('util')).toBe(false);
    });

    it('should return false for non-cached modules', () => {
      expect(cache.invalidate('not-cached')).toBe(false);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest module when cache is full', async () => {
      await cache.getModule('fs');
      await cache.getModule('path');
      await cache.getModule('os');
      await cache.getModule('util');
      await cache.getModule('url');
      expect(cache.getStats().size).toBe(5);
      await cache.getModule('http');
      expect(cache.getStats().size).toBe(5);
      expect(cache.has('fs')).toBe(false);
      expect(cache.has('http')).toBe(true);
    });

    it('should update lastAccessed on cache hit', async () => {
      await cache.getModule('fs');
      await cache.getModule('path');
      await cache.getModule('os');
      await cache.getModule('util');
      await cache.getModule('url');
      await cache.getModule('fs');
      await cache.getModule('http');
      expect(cache.has('fs')).toBe(true);
      expect(cache.has('path')).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const shortCache = new DynamicImportCache({
        maxCacheSize: 10,
        cacheTimeoutMs: 50,
        cleanupIntervalMs: 0
      });
      await shortCache.getModule('fs');
      expect(shortCache.has('fs')).toBe(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      shortCache.cleanup();
      expect(shortCache.has('fs')).toBe(false);
      shortCache.shutdown();
    });
  });

  describe('clear', () => {
    it('should clear all cached modules', async () => {
      await cache.getModule('fs');
      await cache.getModule('path');
      cache.clear();
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hitCount).toBe(0);
      expect(stats.missCount).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      await cache.getModule('fs');
      await cache.getModule('fs');
      await cache.getModule('path');
      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(5);
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(2);
      expect(stats.hitRate).toBeCloseTo(33.33, 0);
      expect(stats.cacheTimeoutMs).toBe(1000);
    });

    it('should handle zero requests', () => {
      expect(cache.getStats().hitRate).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('should reset hit/miss counters without clearing cache', async () => {
      await cache.getModule('fs');
      await cache.getModule('fs');
      cache.resetStats();
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(0);
      expect(stats.missCount).toBe(0);
      expect(stats.size).toBe(1);
    });
  });

  describe('getCachedModules', () => {
    it('should return list of cached module names', async () => {
      await cache.getModule('fs');
      await cache.getModule('path');
      const modules = cache.getCachedModules();
      expect(modules).toContain('fs');
      expect(modules).toContain('path');
      expect(modules.length).toBe(2);
    });
  });

  describe('shutdown', () => {
    it('should clear cache and stop cleanup interval', () => {
      cache.shutdown();
      expect(cache.getStats().size).toBe(0);
    });
  });
});

describe('Convenience functions', () => {
  beforeEach(() => {
    clearDynamicImportCache();
  });

  afterEach(() => {
    shutdownDynamicImportCache();
  });

  it('getDynamicModule should load modules', async () => {
    const result = await getDynamicModule('fs');
    expect(result).not.toBeNull();
  });

  it('getDatabaseModule should load database modules', async () => {
    const result = await getDatabaseModule('generic');
    expect(result).not.toBeNull();
  });

  it('hasCachedModule should check cache status', async () => {
    await getDynamicModule('os');
    expect(hasCachedModule('os')).toBe(true);
    expect(hasCachedModule('not-loaded')).toBe(false);
  });

  it('invalidateCachedModule should remove from cache', async () => {
    await getDynamicModule('util');
    expect(hasCachedModule('util')).toBe(true);
    invalidateCachedModule('util');
    expect(hasCachedModule('util')).toBe(false);
  });

  it('getDynamicImportCacheStats should return statistics', async () => {
    await getDynamicModule('fs');
    const stats = getDynamicImportCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('hitRate');
    expect(stats).toHaveProperty('hitCount');
    expect(stats).toHaveProperty('missCount');
  });
});

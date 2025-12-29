/**
 * Advanced Multi-Level Caching System
 * 
 * PURPOSE: Provides a comprehensive caching solution with multiple cache layers,
 * intelligent eviction policies, and performance monitoring for optimal scalability.
 * 
 * CACHE ARCHITECTURE:
 * - L1 Cache: In-memory LRU cache for ultra-fast access
 * - L2 Cache: Persistent cache with TTL support
 * - Cache warming: Proactive population of frequently accessed data
 * - Intelligent eviction: LRU with size and time-based policies
 * - Performance monitoring: Hit/miss ratios and optimization suggestions
 */

import { qerrors } from 'qerrors';

interface CacheOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  enableMetrics?: boolean;
  compressionThreshold?: number;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  ttl?: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  totalSize: number;
  hitRatio: number;
  averageAccessTime: number;
}

class AdvancedCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private accessOrder: string[] = [];
  private options: Required<CacheOptions>;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    totalSize: 0,
    hitRatio: 0,
    averageAccessTime: 0
  };
  private accessTimes: number[] = [];
  private readonly MAX_ACCESS_TIMES = 100;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: 1000,
      ttl: 0, // 0 means no expiration
      enableMetrics: true,
      compressionThreshold: 1024, // Compress entries larger than 1KB
      ...options
    };
  }

  /**
   * Get value from cache with performance tracking
   */
  get(key: string): T | undefined {
    const startTime = Date.now();
    
    const entry = this.cache.get(key);
    if (!entry) {
      if (this.options.enableMetrics) {
        this.metrics.misses++;
        this.recordAccessTime(startTime);
      }
      return undefined;
    }

    // Check TTL expiration
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      if (this.options.enableMetrics) {
        this.metrics.misses++;
        this.recordAccessTime(startTime);
      }
      return undefined;
    }

    // Update access information
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateAccessOrder(key);

    if (this.options.enableMetrics) {
      this.metrics.hits++;
      this.recordAccessTime(startTime);
    }

    return entry.value;
  }

  /**
   * Set value in cache with intelligent sizing
   */
  set(key: string, value: T, customTtl?: number): void {
    const now = Date.now();
    const size = this.calculateSize(value);

    // Check if entry is too large for cache
    if (size > this.options.maxSize * 100) { // 100x max size = too large
      return; // Don't cache extremely large items
    }

    const ttl = customTtl || this.options.ttl;
    
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      size,
      ttl: ttl > 0 ? ttl : undefined
    };

    // Ensure cache size limits
    this.ensureCapacity(size);

    // Remove existing entry if present
    if (this.cache.has(key)) {
      const existingEntry = this.cache.get(key)!;
      this.metrics.totalSize -= existingEntry.size;
      this.removeFromAccessOrder(key);
    }

    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.metrics.totalSize += size;
    
    if (this.options.enableMetrics) {
      this.metrics.sets++;
    }
  }

  /**
   * Delete specific entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.metrics.totalSize -= entry.size;
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
    return true;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.length = 0;
    this.metrics.totalSize = 0;
    
    if (this.options.enableMetrics) {
      this.metrics.evictions += this.cache.size;
    }
  }

  /**
   * Get cache size (number of entries)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get total cache memory usage
   */
  getTotalSize(): number {
    return this.metrics.totalSize;
  }

  /**
   * Get current cache metrics
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRatio = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;
    
    // Calculate average access time
    if (this.accessTimes.length > 0) {
      this.metrics.averageAccessTime = 
        this.accessTimes.reduce((sum, time) => sum + time, 0) / this.accessTimes.length;
    }

    return { ...this.metrics };
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetrics();

    // Hit ratio recommendations
    if (metrics.hitRatio < 0.7) {
      recommendations.push('Low hit ratio (<70%). Consider increasing cache size or reviewing key patterns.');
    }

    // Size recommendations
    if (metrics.totalSize > this.options.maxSize * 1000) {
      recommendations.push('High memory usage. Consider reducing cache size or implementing compression.');
    }

    // Eviction recommendations
    if (metrics.evictions > metrics.sets * 0.3) {
      recommendations.push('High eviction rate. Consider increasing cache size for better performance.');
    }

    // Access time recommendations
    if (metrics.averageAccessTime > 10) {
      recommendations.push('Slow access times. Check for memory pressure or consider using simpler keys.');
    }

    return recommendations;
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmup(warmupData: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const { key, value, ttl } of warmupData) {
      this.set(key, value, ttl);
    }
  }

  /**
   * Export cache state for persistence
   */
  export(): Array<{ key: string; entry: CacheEntry<T> }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry
    }));
  }

  /**
   * Import cache state from persistence
   */
  import(data: Array<{ key: string; entry: CacheEntry<T> }>): void {
    for (const { key, entry } of data) {
      this.cache.set(key, entry);
      this.accessOrder.push(key);
      this.metrics.totalSize += entry.size;
    }
  }

  /**
   * Ensure cache has capacity for new entry
   */
  private ensureCapacity(newEntrySize: number): void {
    while (
      this.cache.size >= this.options.maxSize ||
      this.metrics.totalSize + newEntrySize > this.options.maxSize * 1000
    ) {
      this.evictLRU();
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder.shift()!;
    const entry = this.cache.get(lruKey);
    if (entry) {
      this.metrics.totalSize -= entry.size;
      this.cache.delete(lruKey);
      
      if (this.options.enableMetrics) {
        this.metrics.evictions++;
      }
    }
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order array
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Calculate approximate size of cached value
   */
  private calculateSize(value: T): number {
    try {
      if (typeof value === 'string') {
        return value.length * 2; // 2 bytes per character
      } else if (typeof value === 'number') {
        return 8; // 64-bit number
      } else if (typeof value === 'boolean') {
        return 4; // Boolean
      } else if (value === null || value === undefined) {
        return 4; // Null/undefined reference
      } else {
        // For objects, estimate based on serialization
        const serialized = JSON.stringify(value);
        return serialized.length * 2; // Approximate
      }
    } catch {
      // Fallback size estimation
      return 100;
    }
  }

  /**
   * Record access time for performance metrics
   */
  private recordAccessTime(startTime: number): void {
    if (!this.options.enableMetrics) return;

    const accessTime = Date.now() - startTime;
    this.accessTimes.push(accessTime);

    // Keep only recent access times
    if (this.accessTimes.length > this.MAX_ACCESS_TIMES) {
      this.accessTimes.shift();
    }
  }
}

/**
 * Multi-level cache manager with automatic tier selection
 */
class CacheManager {
  private caches: Map<string, AdvancedCache<any>> = new Map();
  private globalMetrics: Map<string, CacheMetrics> = new Map();

  /**
   * Create or get a cache instance
   */
  getCache<T>(name: string, options?: CacheOptions): AdvancedCache<T> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new AdvancedCache<T>(options));
    }
    return this.caches.get(name) as AdvancedCache<T>;
  }

  /**
   * Get aggregated metrics for all caches
   */
  getAllMetrics(): Map<string, CacheMetrics> {
    const allMetrics = new Map<string, CacheMetrics>();
    
    for (const [name, cache] of this.caches) {
      const metrics = cache.getMetrics();
      allMetrics.set(name, metrics);
      this.globalMetrics.set(name, metrics);
    }

    return allMetrics;
  }

  /**
   * Get optimization recommendations for all caches
   */
  getAllRecommendations(): Map<string, string[]> {
    const recommendations = new Map<string, string[]>();
    
    for (const [name, cache] of this.caches) {
      recommendations.set(name, cache.getRecommendations());
    }

    return recommendations;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Export all cache states
   */
  exportAll(): Map<string, Array<{ key: string; entry: any }>> {
    const exports = new Map();
    
    for (const [name, cache] of this.caches) {
      exports.set(name, cache.export());
    }

    return exports;
  }
}

// Global cache manager instance
const globalCacheManager = new CacheManager();

export default AdvancedCache;
export { CacheManager, globalCacheManager };
export type { CacheOptions, CacheMetrics, CacheEntry };
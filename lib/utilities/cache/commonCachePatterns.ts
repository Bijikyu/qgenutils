/**
 * Common Caching Utilities
 * 
 * Centralized caching utilities to eliminate code duplication across
 * codebase. These utilities handle common caching patterns including
 * LRU cache, TTL cache, and distributed caching.
 */

import { handleError } from '../error/commonErrorHandling.js';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  accessCount?: number;
  lastAccess?: number;
}

/**
 * Cache statistics
 */
interface CacheStats {
  size: number;
  maxSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  memoryUsage?: number;
}

/**
 * LRU Cache implementation
 */
export class LRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Set<string>();
  private maxSize: number;
  private defaultTtl?: number;
  private stats = { hits: 0, misses: 0 };
  
  constructor(maxSize: number, defaultTtl?: number) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }
  
  /**
   * Gets value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access info
    entry.accessCount = (entry.accessCount || 0) + 1;
    entry.lastAccess = Date.now();
    
    // Move to end of access order
    this.accessOrder.delete(key);
    this.accessOrder.add(key);
    
    this.stats.hits++;
    return entry.value;
  }
  
  /**
   * Sets value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    
    // Remove oldest if at max capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.values().next().value;
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }
    
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl: ttl || this.defaultTtl,
      accessCount: 1,
      lastAccess: now
    };
    
    this.cache.set(key, entry);
    
    // Update access order
    this.accessOrder.delete(key);
    this.accessOrder.add(key);
  }
  
  /**
   * Deletes value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessOrder.delete(key);
    return deleted;
  }
  
  /**
   * Checks if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Clears cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats = { hits: 0, misses: 0 };
  }
  
  /**
   * Gets cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.stats.hits,
      missCount: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }
  
  /**
   * Cleans up expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl && now - entry.timestamp > entry.ttl) {
        this.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

/**
 * TTL Cache implementation
 */
export class TTLCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private cleanupInterval: NodeJS.Timeout;
  private defaultTtl: number;
  private stats = { hits: 0, misses: 0 };
  
  constructor(defaultTtl: number = 300000, cleanupIntervalMs: number = 60000) {
    this.defaultTtl = defaultTtl;
    
    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }
  
  /**
   * Gets value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Check if expired
    if (age > (entry.ttl || this.defaultTtl)) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    entry.accessCount = (entry.accessCount || 0) + 1;
    this.stats.hits++;
    return entry.value;
  }
  
  /**
   * Sets value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
      accessCount: 1
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * Deletes value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Checks if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    return age <= (entry.ttl || this.defaultTtl);
  }
  
  /**
   * Clears cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }
  
  /**
   * Gets cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    
    return {
      size: this.cache.size,
      maxSize: Infinity, // TTL cache doesn't have max size
      hitCount: this.stats.hits,
      missCount: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }
  
  /**
   * Cleans up expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > (entry.ttl || this.defaultTtl)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Destroys cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

/**
 * Multi-layer cache with hierarchy
 */
export class LayeredCache<T = any> {
  private layers: Array<{ cache: LRUCache<T> | TTLCache<T>; priority: number }>;
  
  constructor(layers: Array<{ cache: LRUCache<T> | TTLCache<T>; priority: number }>) {
    this.layers = layers.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Gets value from cache layers
   */
  get(key: string): T | null {
    for (const layer of this.layers) {
      const value = layer.cache.get(key);
      if (value !== null) {
        // Promote to higher priority caches
        for (let i = this.layers.indexOf(layer) - 1; i >= 0; i--) {
          this.layers[i].cache.set(key, value);
        }
        return value;
      }
    }
    return null;
  }
  
  /**
   * Sets value in all cache layers
   */
  set(key: string, value: T, ttl?: number): void {
    for (const layer of this.layers) {
      layer.cache.set(key, value, ttl);
    }
  }
  
  /**
   * Deletes value from all cache layers
   */
  delete(key: string): boolean {
    let deleted = false;
    for (const layer of this.layers) {
      if (layer.cache.delete(key)) {
        deleted = true;
      }
    }
    return deleted;
  }
  
  /**
   * Clears all cache layers
   */
  clear(): void {
    for (const layer of this.layers) {
      layer.cache.clear();
    }
  }
  
  /**
   * Gets combined statistics
   */
  getStats(): CacheStats[] {
    return this.layers.map(layer => layer.cache.getStats());
  }
}

/**
 * Cache factory for common configurations
 */
export const CacheFactory = {
  /**
   * Creates LRU cache
   */
  lru: <T = any>(maxSize: number, defaultTtl?: number) => 
    new LRUCache<T>(maxSize, defaultTtl),
  
  /**
   * Creates TTL cache
   */
  ttl: <T = any>(defaultTtl?: number, cleanupInterval?: number) => 
    new TTLCache<T>(defaultTtl, cleanupInterval),
  
  /**
   * Creates layered cache
   */
  layered: <T = any>(layers: Array<{ cache: LRUCache<T> | TTLCache<T>; priority: number }>) =>
    new LayeredCache<T>(layers),
  
  /**
   * Creates memory-based distributed cache
   */
  distributed: <T = any>(options: {
    maxSize?: number;
    defaultTtl?: number;
    cleanupInterval?: number;
  } = {}) => {
    const { maxSize = 1000, defaultTtl, cleanupInterval } = options;
    
    const lru = new LRUCache<T>(maxSize, defaultTtl);
    const ttl = new TTLCache<T>(defaultTtl, cleanupInterval);
    
    return new LayeredCache<T>([
      { cache: lru, priority: 2 },
      { cache: ttl, priority: 1 }
    ]);
  }
};

/**
 * Cache utilities for common operations
 */
export const CacheUtils = {
  /**
   * Creates a cache key from multiple parts
   */
  createKey: (...parts: Array<string | number | boolean>): string => 
    parts.join(':'),
  
  /**
   * Validates cache key
   */
  validateKey: (key: string): boolean => 
    typeof key === 'string' && key.length > 0 && key.length < 250,
  
  /**
   * Estimates memory usage of cache
   */
  estimateMemoryUsage: (cache: LRUCache<any> | TTLCache<any>): number => {
    const stats = cache.getStats();
    const avgEntrySize = 100; // Rough estimate
    return stats.size * avgEntrySize;
  },
  
  /**
   * Creates a cache with warming
   */
  createWithWarming: <T = any>(
    cacheFactory: () => LRUCache<T> | TTLCache<T>,
    initialData: Array<{ key: string; value: T; ttl?: number }>,
    warmupConcurrency: number = 10
  ) => {
    const cache = cacheFactory();
    
    // Warm up cache in parallel
    const chunks = [];
    for (let i = 0; i < initialData.length; i += warmupConcurrency) {
      chunks.push(initialData.slice(i, i + warmupConcurrency));
    }
    
    chunks.forEach(chunk => {
      chunk.forEach(({ key, value, ttl }) => {
        cache.set(key, value, ttl);
      });
    });
    
    return cache;
  }
};
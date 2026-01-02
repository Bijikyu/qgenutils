/**
 * Bounded LRU Cache Implementation
 * 
 * PURPOSE: Replace unbounded Maps with size-limited, TTL-based caching
 * to prevent memory leaks and unbounded growth.
 * 
 * FEATURES:
 * - LRU eviction when size limit reached
 * - TTL-based item expiration
 * - Memory pressure monitoring
 * - Automatic cleanup of expired items
 */

export interface CacheItem<V> {
  value: V;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class BoundedLRUCache<K, V> {
  private cache = new Map<string, CacheItem<V>>();
  private maxSize: number;
  private defaultTtl: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    expirations: 0
  };

  constructor(maxSize: number, defaultTtl: number = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.startCleanupInterval();
  }

  /**
   * Set an item in cache
   */
  set(key: K, value: V, ttl?: number): void {
    const now = Date.now();
    const cacheKey = this.serializeKey(key);
    const item: CacheItem<V> = {
      value,
      timestamp: now,
      ttl: ttl || this.defaultTtl,
      accessCount: 1,
      lastAccessed: now
    };

    // Evict items if over size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      this.evictLRU();
    }

    this.cache.set(cacheKey, item);
  }

  /**
   * Get an item from cache
   */
  get(key: K): V | undefined {
    const cacheKey = this.serializeKey(key);
    const item = this.cache.get(cacheKey);
    const now = Date.now();

    if (!item) {
      this.stats.misses++;
      return undefined;
    }

    // Check if expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(cacheKey);
      this.stats.expirations++;
      this.stats.misses++;
      return undefined;
    }

    // Update access tracking
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;

    return item.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: K): boolean {
    const cacheKey = this.serializeKey(key);
    const item = this.cache.get(cacheKey);
    const now = Date.now();

    if (!item) return false;
    
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(cacheKey);
      this.stats.expirations++;
      return false;
    }

    return true;
  }

  /**
   * Delete an item from cache
   */
  delete(key: K): boolean {
    const cacheKey = this.serializeKey(key);
    return this.cache.delete(cacheKey);
  }

  /**
   * Clear all items from cache
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): typeof this.stats & {
    hitRate: number;
    currentSize: number;
    maxSize: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      currentSize: this.cache.size,
      maxSize: this.maxSize
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0
    };
  }

  /**
   * Serialize key to string
   */
  private serializeKey(key: K): string {
    if (typeof key === 'string') return key;
    if (typeof key === 'number') return key.toString();
    if (key === null || key === undefined) return 'null';
    try {
      return JSON.stringify(key);
    } catch {
      return String(key);
    }
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    // Use direct Map iteration instead of Array.from() for better performance
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Start cleanup interval for expired items
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Cleanup every minute
  }

  /**
   * Remove all expired items
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let deletedCount = 0;

    // Single-pass deletion for better performance
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.stats.expirations++;
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`Cache cleanup: removed ${deletedCount} expired items`);
    }
  }

/**
    * Get all values (for compatibility with Map interface)
    */
  values(): V[] {
    const result: V[] = [];
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp <= item.ttl) {
        result.push(item.value);
      }
    }
    
    return result;
  }

  /**
    * Get all entries (for compatibility with Map interface)
    */
  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    const now = Date.now();
    
    for (const [cacheKey, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp <= item.ttl) {
        const key = this.deserializeKey(cacheKey);
        result.push([key, item.value]);
      }
    }
    
    return result;
  }

  /**
    * Get all keys (for compatibility with Map interface)
    */
  keys(): K[] {
    const result: K[] = [];
    const now = Date.now();
    
    for (const [cacheKey, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp <= item.ttl) {
        const key = this.deserializeKey(cacheKey);
        result.push(key);
      }
    }
    
    return result;
  }

  /**
    * Deserialize key from string
    */
  private deserializeKey(cacheKey: string): K {
    try {
      return JSON.parse(cacheKey) as K;
    } catch {
      return cacheKey as unknown as K;
    }
  }

  /**
    * Destroy cache and cleanup resources
    */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    this.resetStats();
  }
}

/**
 * Circular Buffer Implementation for unbounded arrays
 */
export class CircularBuffer<T> {
  private buffer: T[];
  private head = 0;
  private tail = 0;
  private size = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Add item to buffer (overwrites oldest if full)
   */
  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  /**
   * Get oldest item from buffer
   */
  shift(): T | undefined {
    if (this.size === 0) return undefined;

    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined as any;
    this.head = (this.head + 1) % this.capacity;
    this.size--;

    return item;
  }

  /**
   * Get all items in order (oldest to newest)
   */
  getAll(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index]);
    }
    return result;
  }

  /**
   * Get current size
   */
  getLength(): number {
    return this.size;
  }

  /**
   * Check if buffer is full
   */
  isFull(): boolean {
    return this.size === this.capacity;
  }

  /**
   * Clear buffer
   */
  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.buffer.fill(undefined as any);
  }
}
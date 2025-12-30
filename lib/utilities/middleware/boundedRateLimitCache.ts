/**
 * Bounded LRU Cache implementation for rate limiting data
 */
class BoundedRateLimitCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (LRU behavior)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (LRU eviction)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  // Efficient cleanup with batched operations
  cleanup(predicate: (key: K, value: V) => boolean): number {
    const toDelete: K[] = [];
    
    for (const [key, value] of this.cache) {
      if (predicate(key, value)) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
    return toDelete.length;
  }
}

export default BoundedRateLimitCache;
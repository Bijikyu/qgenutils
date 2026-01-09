/**
 * In-Memory Rate Limit Store
 *
 * Creates a simple in-memory store for tracking rate limit usage.
 * Supports automatic cleanup of expired entries to prevent memory leaks.
 *
 * @param {object} [options] - Store options
 * @param {number} [options.cleanupInterval=60000] - Interval for cleanup in ms (0 to disable)
 * @returns {object} Rate limit store with consume, get, reset, and destroy methods
 */
function createRateLimitStore(options: any = {}) {
  const { cleanupInterval = 60000 } = options;

  const store = new Map(); // key -> { points, resetTime }
  let cleanupTimer: any = null;

  function cleanup() { // remove expired entries
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetTime) {
        store.delete(key);
      }
    }
  }

  function destroy() {
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
    store.clear();
  }

  if (cleanupInterval > 0) { // start periodic cleanup
    cleanupTimer = setInterval(cleanup, cleanupInterval);
    if (cleanupTimer.unref) {
      cleanupTimer.unref();
    } // don't block process exit
  }

  // Add automatic cleanup when store is garbage collected (if supported)
  if (typeof FinalizationRegistry !== 'undefined') {
    const registry = new FinalizationRegistry(() => {
      if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    });
    registry.register(store, destroy);
  }

  return {
    /**
     * Consume a point for the given key
     * @param {string} key - Rate limit key
     * @param {number} points - Max points allowed
     * @param {number} durationMs - Window duration in ms
     * @returns {{ consumed: number, remaining: number, resetTime: number, exceeded: boolean }}
     */
    consume(key: string, points: number, durationMs: number) {
      const now = Date.now();
      let entry = store.get(key);

      if (!entry || now >= entry.resetTime) { // create new window if expired
        entry = { consumed: 0, resetTime: now + durationMs };
        store.set(key, entry);
      }

      entry.consumed += 1;
      const exceeded: any = entry.consumed > points;
      const remaining: any = Math.max(0, points - entry.consumed);

      return {
        consumed: entry.consumed,
        remaining,
        resetTime: entry.resetTime,
        exceeded
      };
    },

    /**
     * Get current usage for a key without consuming
     * @param {string} key - Rate limit key
     * @returns {{ consumed: number, resetTime: number } | null}
     */
    get(key: string) {
      const entry = store.get(key);
      if (!entry) {
        return null;
      }
      const now = Date.now();
      if (now >= entry.resetTime) { // expired
        store.delete(key);
        return null;
      }
      return { consumed: entry.consumed, resetTime: entry.resetTime };
    },

    /**
     * Reset usage for a key
     * @param {string} key - Rate limit key
     */
    reset(key: string) {
      store.delete(key);
    },

    /**
     * Get store size
     * @returns {number}
     */
    size() {
      return store.size;
    },

    /**
     * Destroy store and stop cleanup timer
     */
    destroy
  };
}

export default createRateLimitStore;

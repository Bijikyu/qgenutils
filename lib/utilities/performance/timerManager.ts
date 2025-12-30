/**
 * Centralized Timer Management Utility
 * 
 * PURPOSE: Prevent timer leaks and provide resource management
 * for all setInterval/setTimeout operations across the application.
 * 
 * FEATURES:
 * - Automatic timer tracking and cleanup
 * - Memory leak prevention
 * - Resource monitoring and alerts
 * - Graceful shutdown handling
 */

export class TimerManager {
  private timers = new Set<NodeJS.Timeout>();
  private intervals = new Set<NodeJS.Timeout>();
  private isDestroyed = false;
  private maxTimers = 1000; // Prevent timer explosion
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup to prevent timer accumulation
    this.startCleanupInterval();
  }

  /**
   * Create a tracked timeout
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    if (this.isDestroyed) {
      throw new Error('TimerManager has been destroyed');
    }

    if (this.timers.size >= this.maxTimers) {
      console.warn(`Timer limit reached (${this.maxTimers}), forcing cleanup`);
      this.forceCleanup();
    }

    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);

    this.timers.add(timer);
    return timer;
  }

  /**
   * Create a tracked interval
   */
  setInterval(callback: () => void, interval: number): NodeJS.Timeout {
    if (this.isDestroyed) {
      throw new Error('TimerManager has been destroyed');
    }

    if (this.intervals.size >= this.maxTimers) {
      console.warn(`Interval limit reached (${this.maxTimers}), forcing cleanup`);
      this.forceCleanup();
    }

    const timer = setInterval(callback, interval);
    this.intervals.add(timer);
    return timer;
  }

  /**
   * Clear a specific timeout
   */
  clearTimeout(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  /**
   * Clear a specific interval
   */
  clearInterval(timer: NodeJS.Timeout): void {
    clearInterval(timer);
    this.intervals.delete(timer);
  }

  /**
   * Get current timer counts
   */
  getStats(): { timeouts: number; intervals: number; total: number } {
    return {
      timeouts: this.timers.size,
      intervals: this.intervals.size,
      total: this.timers.size + this.intervals.size
    };
  }

  /**
   * Force cleanup of dead timers
   */
  private forceCleanup(): void {
    const beforeCount = this.timers.size + this.intervals.size;
    
    // Clear timers that have likely completed (simple heuristic)
    for (const timer of this.timers) {
      if ((timer as any)._onTimeout) {
        // Timer has callback, assume it's still valid
        continue;
      }
      this.timers.delete(timer);
    }

    const afterCount = this.timers.size + this.intervals.size;
    if (beforeCount > afterCount) {
      console.log(`Cleaned up ${beforeCount - afterCount} dead timers`);
    }
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = this.setInterval(() => {
      this.checkResourceUsage();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check resource usage and log warnings
   */
  private checkResourceUsage(): void {
    const stats = this.getStats();
    
    if (stats.total > this.maxTimers * 0.8) {
      console.warn(`High timer usage detected: ${stats.total} active timers`);
    }

    if (stats.total > this.maxTimers) {
      console.error(`Timer limit exceeded: ${stats.total} > ${this.maxTimers}`);
      this.forceCleanup();
    }
  }

  /**
   * Destroy all timers and cleanup
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clear all timeouts
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();

    // Clear all intervals
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.log('TimerManager: All timers cleaned up');
  }
}

// Global singleton instance
export const timerManager = new TimerManager();

// Process cleanup hook
process.on('exit', () => {
  timerManager.destroy();
});

process.on('SIGINT', () => {
  timerManager.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  timerManager.destroy();
  process.exit(0);
});
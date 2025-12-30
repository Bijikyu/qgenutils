import SECURITY_CONFIG from './securityConfig.js';
import { BoundedLRUCache } from '../performance/boundedCache.js';

interface IpTrackerConfig {
  maxTrackedIps?: number;
  cleanupIntervalMs?: number;
  blockDurationMs?: number;
  maxFailedAttempts?: number;
  windowMs?: number;
}

interface IpData {
  requestCount: number;
  suspiciousPatterns: string[];
  lastSeen: number;
  blockCount: number;
  windowStart: number;
  lastRequest: number;
  failedAttempts: number;
}

interface IpTracker {
  track(ip: string, suspiciousPatterns?: string[]): { shouldBlock: boolean };
  isBlocked(ip: string): boolean;
  block(ip: string, durationMs?: number): number;
  getBlockExpiry(ip: string): number;
  startPeriodicCleanup(): void;
  stopPeriodicCleanup(): void;
  cleanup(): void;
  getStats(): { totalTracked: number; blockedCount: number };
}

/**
 * Creates an IP tracking system with memory management
 * Tracks request counts, suspicious patterns, and blocks per IP
 * @param {Object} [config] - Configuration options
 * @param {number} [config.maxTrackedIps] - Max IPs to track
 * @param {number} [config.cleanupIntervalMs] - Cleanup interval
 * @param {number} [config.blockDurationMs] - Block duration
 * @returns {Object} IP tracker with track, isBlocked, block, cleanup methods
 * @example
 * const tracker: any = createIpTracker();
 * tracker.track('192.168.1.1', ['potential_xss']);
 * if (tracker.isBlocked('192.168.1.1')) res.status(403).send('Blocked');
 */
function createIpTracker(config: IpTrackerConfig = {}): IpTracker { // factory for IP tracking system
  const maxTrackedIps: number = config.maxTrackedIps || SECURITY_CONFIG.MAX_TRACKED_IPS;
  const cleanupIntervalMs: number = config.cleanupIntervalMs || SECURITY_CONFIG.CLEANUP_INTERVAL_MS;
  const blockDurationMs: number = config.blockDurationMs || SECURITY_CONFIG.BLOCK_DURATION_MS;
  const maxFailedAttempts: number = config.maxFailedAttempts || SECURITY_CONFIG.MAX_FAILED_ATTEMPTS;
  const windowMs: number = config.windowMs || SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS;

  const ipData = new BoundedLRUCache<string, IpData>(
    maxTrackedIps, // Use config limit
    windowMs * 2  // TTL is 2x window time
  );
  const blockedIps = new BoundedLRUCache<string, number>(
    10000,  // Max 10K blocked IPs
    blockDurationMs * 2  // TTL is 2x block duration
  );
  let cleanupTimer: ReturnType<typeof setInterval> | null = null;
  const maxCacheSize: number = 50000; // Prevent memory leaks

  function getIpData(ip: string): IpData { // get or create IP tracking data
    let data = ipData.get(ip);
    if (!data) {
      data = {
        requestCount: 0,
        windowStart: Date.now(),
        lastRequest: Date.now(),
        failedAttempts: 0,
        suspiciousPatterns: [],
        lastSeen: Date.now(),
        blockCount: 0
      };
      ipData.set(ip, data, windowMs * 2);
    }
    return data;
  }

  function track(ip: string, suspiciousPatterns: string[] = []): { shouldBlock: boolean } { // track request from IP
    const now: any = Date.now();
    const data: any = getIpData(ip);

    data.requestCount++;
    data.lastRequest = now;

    if (now - data.windowStart > windowMs) { // reset window if expired
      data.windowStart = now;
      data.requestCount = 1;
    }

    if (suspiciousPatterns.length > 0) { // record suspicious patterns
      data.suspiciousPatterns.push(...suspiciousPatterns);
      data.failedAttempts++;

      if (data.suspiciousPatterns.length > 50) { // truncate to prevent memory growth
        data.suspiciousPatterns = data.suspiciousPatterns.slice(-25);
      }
    }

    return {
      shouldBlock: data.failedAttempts >= maxFailedAttempts
    };
  }

  function block(ip: string, durationMs: number = blockDurationMs): number { // block an IP
    const blockUntil: number = Date.now() + durationMs;
    blockedIps.set(ip, blockUntil, durationMs);
    return blockUntil;
  }

  function isBlocked(ip: string): boolean { // check if IP is blocked
    const blockUntil: any = blockedIps.get(ip);
    if (!blockUntil) return false;

    if (Date.now() >= blockUntil) { // block expired
      blockedIps.delete(ip);
      return false;
    }

    return true;
  }

  function getBlockExpiry(ip: string): number { // get block expiry time
    return blockedIps.get(ip) || 0;
  }

  function cleanup(): void { // cleanup expired entries
    // BoundedLRUCache handles automatic cleanup via TTL and size limits
    // No manual cleanup needed
  }

  function startPeriodicCleanup() { // start automatic cleanup
    if (cleanupTimer) return;
    cleanupTimer = setInterval(cleanup, cleanupIntervalMs);
    if (cleanupTimer.unref) cleanupTimer.unref(); // don't prevent process exit
  }

  function stopPeriodicCleanup() { // stop automatic cleanup
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }

  function getStats(): { totalTracked: number; blockedCount: number } { // get tracking statistics
    return {
      totalTracked: ipData.size,
      blockedCount: blockedIps.size
    };
  }

  function reset() { // clear all tracking data
    ipData.clear();
    blockedIps.clear();
  }

  return { // return tracker interface
    track,
    block,
    isBlocked,
    getBlockExpiry,
    cleanup,
    startPeriodicCleanup,
    stopPeriodicCleanup,
    getStats
  };
}

export default createIpTracker;

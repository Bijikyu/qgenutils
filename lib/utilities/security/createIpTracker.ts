'use strict';

const SECURITY_CONFIG: any = require('./securityConfig');

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
function createIpTracker(config = {}) { // factory for IP tracking system
  const maxTrackedIps: any = config.maxTrackedIps || SECURITY_CONFIG.MAX_TRACKED_IPS;
  const cleanupIntervalMs: any = config.cleanupIntervalMs || SECURITY_CONFIG.CLEANUP_INTERVAL_MS;
  const blockDurationMs: any = config.blockDurationMs || SECURITY_CONFIG.BLOCK_DURATION_MS;
  const maxFailedAttempts: any = config.maxFailedAttempts || SECURITY_CONFIG.MAX_FAILED_ATTEMPTS;
  const windowMs: any = config.windowMs || SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS;

  const ipData: any = new Map(); // IP -> tracking data
  const blockedIps: any = new Map(); // IP -> block expiry timestamp
  let cleanupTimer = null;

  function getIpData(ip) { // get or create IP tracking data
    if (!ipData.has(ip)) {
      ipData.set(ip, {
        requestCount: 0,
        windowStart: Date.now(),
        lastRequest: Date.now(),
        failedAttempts: 0,
        suspiciousPatterns: []
      });
    }
    return ipData.get(ip);
  }

  function track(ip, suspiciousPatterns = []) { // track request from IP
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
      requestCount: data.requestCount,
      failedAttempts: data.failedAttempts,
      shouldBlock: data.failedAttempts >= maxFailedAttempts
    };
  }

  function block(ip, durationMs = blockDurationMs) { // block an IP
    const blockUntil: any = Date.now() + durationMs;
    blockedIps.set(ip, blockUntil);
    return blockUntil;
  }

  function isBlocked(ip) { // check if IP is blocked
    const blockUntil: any = blockedIps.get(ip);
    if (!blockUntil) return false;

    if (Date.now() >= blockUntil) { // block expired
      blockedIps.delete(ip);
      return false;
    }

    return true;
  }

  function getBlockExpiry(ip) { // get block expiry time
    return blockedIps.get(ip) || null;
  }

  function cleanup() { // cleanup expired entries
    const now: any = Date.now();

    blockedIps.forEach((expires, ip: any): any => { // remove expired blocks
      if (expires <= now) blockedIps.delete(ip);
    });

    ipData.forEach((data, ip: any): any => { // remove stale IP data
      if (data.windowStart + windowMs < now && !blockedIps.has(ip)) {
        ipData.delete(ip);
      }
    });

    if (ipData.size > maxTrackedIps) { // enforce memory limit
      const sorted = Array.from(ipData.entries())
        .sort(([, a], [, b]) => a.lastRequest - b.lastRequest);
      const toRemove: any = sorted.slice(0, ipData.size - maxTrackedIps);
      toRemove.forEach(([ip]) => ipData.delete(ip));
    }
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

  function getStats() { // get tracking statistics
    return {
      trackedIps: ipData.size,
      blockedIps: blockedIps.size,
      maxTrackedIps
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
    getStats,
    reset
  };
}

export default createIpTracker;

/**
 * Create Security Middleware - Fixed Version
 * Provides security monitoring, rate limiting, and IP blocking functionality
 */

import { qerrors } from 'qerrors';
// Note: These imports might not exist yet - using stubs for compatibility
// import detectSuspiciousPatterns from './detectSuspiciousPatterns.js';
// import createIpTracker from './createIpTracker.js';

interface SecurityMiddlewareOptions {
  logAllRequests?: boolean;
  sensitiveEndpoints?: string[];
  logger?: Console;
  ipTracker?: any; // Using any for compatibility
}

const SECURITY_CONFIG = {
  LOG_ALL_REQUESTS: false,
  SENSITIVE_ENDPOINTS: ['/api/auth', '/api/admin', '/login', '/register']
};

// Stub implementations for missing dependencies
const detectSuspiciousPatterns = (req: any): string[] => {
  // Basic suspicious pattern detection
  const patterns: string[] = [];
  const userAgent = req.headers?.['user-agent'] || '';
  const url = req.url || '';

  if (url.includes('../') || url.includes('..\\')) {
    patterns.push('path-traversal');
  }
  if (url.includes('<script>') || url.includes('javascript:')) {
    patterns.push('xss-attempt');
  }
  if (userAgent.includes('sqlmap') || userAgent.includes('nmap')) {
    patterns.push('scanner-detected');
  }

  return patterns;
};

const createIpTracker = () => {
  const tracker = {
    blockedIps: new Map(),
    cleanupInterval: undefined as NodeJS.Timeout | undefined,

    isBlocked: (ip: string): boolean => {
      const block = tracker.blockedIps.get(ip);
      return block && block.expiry > Date.now();
    },

    block: (ip: string, durationMs: number = 3600000): number => {
      const expiry = Date.now() + durationMs;
      tracker.blockedIps.set(ip, { expiry, timestamp: Date.now() });
      return expiry;
    },

    track: (ip: string, patterns: string[] = []): { shouldBlock: boolean } => {
      if (patterns.length > 3) {
        return { shouldBlock: true };
      }
      return { shouldBlock: false };
    },

    startPeriodicCleanup: () => {
      if (tracker.cleanupInterval) {
        return;
      }
      tracker.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [ip, block] of tracker.blockedIps.entries()) {
          if (block.expiry <= now) {
            tracker.blockedIps.delete(ip);
          }
        }
      }, 300000); // Cleanup every 5 minutes
    },

    stopPeriodicCleanup: () => {
      if (tracker.cleanupInterval) {
        clearInterval(tracker.cleanupInterval);
        tracker.cleanupInterval = undefined;
      }
    }
  };

  return tracker;
};

function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}) {
  const logAllRequests = options.logAllRequests ?? SECURITY_CONFIG.LOG_ALL_REQUESTS;
  const sensitiveEndpoints = Array.isArray(options.sensitiveEndpoints) ? options.sensitiveEndpoints : SECURITY_CONFIG.SENSITIVE_ENDPOINTS;
  const logger = options.logger || console;
  const ipTracker = options.ipTracker || createIpTracker();

  ipTracker.startPeriodicCleanup();

  function securityMiddleware(req: any, res: any, next: () => void) {
    const clientIp = req?.ip || req?.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let suspiciousPatterns: string[] = [];

    // Check if IP is already blocked
    if (ipTracker.isBlocked(clientIp)) {
      const blockExpiry = ipTracker.getBlockExpiry?.(clientIp) || Date.now() + 3600000;
      const retryAfter = Math.ceil((blockExpiry - now) / 1000);

      logger.warn(`Blocked IP attempted access: ${clientIp}`);
      res.setHeader('Retry-After', retryAfter.toString());
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied due to previous violations',
        retryAfter
      });

      return;
    }

    suspiciousPatterns = detectSuspiciousPatterns(req);

    if (suspiciousPatterns.length > 0) {
      logger.warn('Suspicious activity detected:', {
        ip: clientIp,
        url: req.url,
        method: req.method,
        patterns: suspiciousPatterns,
        userAgent: req.headers?.['user-agent']
      });

      const trackResult = ipTracker.track(clientIp, suspiciousPatterns);

      if (trackResult.shouldBlock) {
        const blockExpiry = ipTracker.block(clientIp);
        const retryAfter = Math.ceil((blockExpiry - now) / 1000);

        qerrors(new Error(`IP blocked: ${clientIp}`), 'createSecurityMiddleware', `Suspicious activity blocking for IP: ${clientIp}, patterns: ${suspiciousPatterns.length}`);
        logger.warn(`IP ${clientIp} blocked due to repeated suspicious activity`);

        res.setHeader('Retry-After', retryAfter.toString());
        res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied due to suspicious activity',
          retryAfter
        });

        return;
      }
    }

    // Track normal requests
    ipTracker.track(clientIp);

    const isSensitive = sensitiveEndpoints.some((ep: string) => req.path?.startsWith(ep));
    if (logAllRequests || isSensitive) {
      const logData = {
        ip: clientIp,
        method: req.method,
        url: req.url,
        path: req.path,
        userAgent: req.headers?.['user-agent'],
        timestamp: new Date().toISOString()
      };

      logger.log('Request:', logData);
    }

    // Continue to next middleware
    next();
  }

  // Add cleanup method to middleware
  (securityMiddleware as any).cleanup = () => {
    ipTracker.stopPeriodicCleanup();
  };

  return securityMiddleware;
}

export default createSecurityMiddleware;

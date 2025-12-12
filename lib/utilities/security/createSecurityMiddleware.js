'use strict';

const SECURITY_CONFIG = require('./securityConfig');
const detectSuspiciousPatterns = require('./detectSuspiciousPatterns');
const createIpTracker = require('./createIpTracker');

/**
 * Creates security monitoring middleware for Express
 * Logs requests, detects suspicious patterns, and blocks malicious IPs
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.logAllRequests] - Log all requests
 * @param {string[]} [options.sensitiveEndpoints] - Endpoints to always log
 * @param {Function} [options.logger] - Custom logger function
 * @param {Object} [options.ipTracker] - Custom IP tracker instance
 * @returns {Function} Express middleware function
 * @example
 * app.use(createSecurityMiddleware({ logAllRequests: true }));
 */
function createSecurityMiddleware(options = {}) { // factory for security middleware
  const logAllRequests = options.logAllRequests ?? SECURITY_CONFIG.LOG_ALL_REQUESTS;
  const sensitiveEndpoints = options.sensitiveEndpoints || SECURITY_CONFIG.SENSITIVE_ENDPOINTS;
  const logger = options.logger || console;
  const ipTracker = options.ipTracker || createIpTracker();

  ipTracker.startPeriodicCleanup(); // start automatic cleanup

  return async function securityMiddleware(req, res, next) { // security monitoring middleware
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    if (ipTracker.isBlocked(clientIp)) { // check if IP is blocked
      const blockExpiry = ipTracker.getBlockExpiry(clientIp);
      const retryAfter = Math.ceil((blockExpiry - now) / 1000);

      res.setHeader('Retry-After', retryAfter.toString());
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied due to suspicious activity',
        retryAfter
      });
      return;
    }

    const suspiciousPatterns = detectSuspiciousPatterns(req); // detect suspicious patterns

    if (suspiciousPatterns.length > 0) { // log and track suspicious activity
      logger.warn('Suspicious activity detected:', {
        ip: clientIp,
        url: req.url,
        method: req.method,
        patterns: suspiciousPatterns,
        userAgent: req.headers['user-agent']
      });

      const trackResult = ipTracker.track(clientIp, suspiciousPatterns);

      if (trackResult.shouldBlock) { // block IP if threshold exceeded
        const blockExpiry = ipTracker.block(clientIp);
        const retryAfter = Math.ceil((blockExpiry - now) / 1000);

        logger.warn(`IP ${clientIp} blocked due to repeated suspicious activity`);

        res.setHeader('Retry-After', retryAfter.toString());
        res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied due to suspicious activity',
          retryAfter
        });
        return;
      }
    } else {
      ipTracker.track(clientIp); // track normal request
    }

    const isSensitive = sensitiveEndpoints.some(ep => req.path.startsWith(ep)); // check sensitive endpoint
    if (logAllRequests || isSensitive) { // log request
      const logData = {
        ip: clientIp,
        method: req.method,
        url: req.url,
        path: req.path,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };

      if (suspiciousPatterns.length > 0) {
        logData.suspiciousPatterns = suspiciousPatterns;
      }

      logger.log('Security Request:', JSON.stringify(logData));
    }

    next(); // continue to next middleware
  };
}

module.exports = createSecurityMiddleware;

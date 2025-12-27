import SECURITY_CONFIG from './securityConfig.js';
import { qerrors } from 'qerrors';
import detectSuspiciousPatterns from './detectSuspiciousPatterns.js';
import createIpTracker from './createIpTracker.js';

interface SecurityMiddlewareOptions {
  logAllRequests?: boolean;
  sensitiveEndpoints?: string[];
  logger?: Console;
  ipTracker?: {
    startPeriodicCleanup: () => void;
    stopPeriodicCleanup?: () => void;
    isBlocked: (ip: string) => boolean;
    block: (ip: string, durationMs?: number) => number;
    getBlockExpiry: (ip: string) => number;
    track: (ip: string, patterns?: string[]) => { shouldBlock: boolean };
    cleanup?: () => void;
  };
}

interface Request {
  ip?: string;
  socket?: { remoteAddress?: string };
  url?: string;
  method?: string;
  path?: string;
  headers?: { 'user-agent'?: string };
}

interface Response {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => Response;
  json: (data: object) => void;
}

interface SecurityMiddleware {
  (req: Request, res: Response, next: () => void): void;
  cleanup: () => void;
}

/**
 * Creates security monitoring middleware for Express
 * Logs requests, detects suspicious patterns, and blocks malicious IPs
 * @param options - Configuration options
 * @param options.logAllRequests - Log all requests
 * @param options.sensitiveEndpoints - Endpoints to always log
 * @param options.logger - Custom logger function
 * @param options.ipTracker - Custom IP tracker instance
 * @returns Express middleware function
 * @example
 * app.use(createSecurityMiddleware({ logAllRequests: true }));
 */
function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}): any {
  const logAllRequests = options.logAllRequests ?? SECURITY_CONFIG.LOG_ALL_REQUESTS;
  const sensitiveEndpoints = Array.isArray(options.sensitiveEndpoints) ? options.sensitiveEndpoints : SECURITY_CONFIG.SENSITIVE_ENDPOINTS;
  const logger = options.logger || console;
  const ipTracker = options.ipTracker || createIpTracker();

  ipTracker.startPeriodicCleanup(); // start automatic cleanup

  function securityMiddleware(req: Request, res: Response, next: () => void): void {
    const clientIp = req?.ip || req?.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let suspiciousPatterns: string[] = [];

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

    try {
      suspiciousPatterns = detectSuspiciousPatterns(req); // detect suspicious patterns

      if (suspiciousPatterns.length > 0) { // log and track suspicious activity
        logger.warn('Suspicious activity detected:', {
          ip: clientIp,
          url: req.url,
          method: req.method,
          patterns: suspiciousPatterns,
          userAgent: req.headers?.['user-agent']
        });

      const trackResult = ipTracker.track(clientIp, suspiciousPatterns);

      if (trackResult.shouldBlock) { // block IP if threshold exceeded
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
    } catch (error) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'createSecurityMiddleware', `Security pattern detection failed for IP: ${clientIp}`);
      // Continue to next middleware even if security check fails
    }

    // Track normal requests  
    ipTracker.track(clientIp);

    const isSensitive = sensitiveEndpoints.some((ep: string) => req.path?.startsWith(ep)); // check sensitive endpoint
    if (logAllRequests || isSensitive) { // log request
      const logData: any = {
        ip: clientIp,
        method: req.method,
        url: req.url,
        path: req.path,
        userAgent: req.headers?.['user-agent'],
        timestamp: new Date().toISOString()
      };

      // Log request after try-catch block
      if (suspiciousPatterns && suspiciousPatterns.length > 0) {
        logData.suspiciousPatterns = suspiciousPatterns;
      }

      logger.log('Security Request:', JSON.stringify(logData));
    }

    next(); // continue to next middleware
  }

  // Add cleanup method to middleware
  (securityMiddleware as any).cleanup = () => {
    if (ipTracker.stopPeriodicCleanup) {
      ipTracker.stopPeriodicCleanup();
    }
  };

  return securityMiddleware;
}

export default createSecurityMiddleware;
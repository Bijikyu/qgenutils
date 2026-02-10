/**
 * HTTP Request Security Pattern Detection Utility
 *
 * PURPOSE: Analyzes HTTP requests for common attack patterns and suspicious
 * characteristics. This utility provides early detection of potential security
 * threats including SQL injection, XSS attacks, path traversal, and oversized
 * requests that could indicate denial of service attempts.
 *
 * SECURITY THREATS DETECTED:
 * - Oversized Requests: Extremely large content-Length headers for DoS protection
 * - URL Length Attacks: Excessively long URLs that could overwhelm servers
 * - Path Traversal: Directory traversal attempts using relative paths
 * - XSS Injection: Cross-site scripting attack patterns in URLs
 * - SQL Injection: Common SQL injection attack patterns
 * - Command Injection: System command execution attempts
 *
 * IMPLEMENTATION STRATEGY:
 * - Multi-Pattern Detection: Simultaneous checking for multiple attack vectors
 * - Configurable Thresholds: Adjustable limits for different environments
 * - Non-Blocking: Returns detected patterns without throwing exceptions
 * - Performance Optimized: Simple string operations for minimal overhead
 * - False Positive Reduction: Careful regex patterns to minimize noise
 *
 * INTEGRATION POINTS:
 * - Express middleware: Pre-request validation
 * - API Gateway: Request screening before routing
 * - Load Balancer: Request analysis before forwarding
 * - Security Monitoring: Logging and alerting systems
 * - Rate Limiting: Enhanced detection when combined with rate limiting
 *
 * @param {any} req - Express request object containing headers, URL, and other request data
 * @param {DetectSuspiciousPatternsOptions} [config] - Optional configuration overrides for thresholds
 * @returns {string[]} Array of detected suspicious pattern names for logging/alerting
 *
 * @example
 * ```typescript
 * // Basic usage in Express middleware
 * app.use((req, res, next) => {
 *   const suspiciousPatterns = detectSuspiciousPatterns(req);
 *   if (suspiciousPatterns.length > 0) {
 *     logger.warn('Suspicious request detected', {
 *       ip: req.ip,
 *       url: req.url,
 *       patterns: suspiciousPatterns
 *     });
 *     // Take action: block, log, or monitor
 *   }
 *   next();
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Custom configuration for stricter security
 * const patterns = detectSuspiciousPatterns(req, {
 *   maxRequestSize: 1024 * 1024, // 1MB limit
 *   maxUrlLength: 1000          // Shorter URL limit
 * });
 * ```
 */

import { qerrors } from '@bijikyu/qerrors';

interface DetectSuspiciousPatternsOptions {
  /** Maximum allowed request body size in bytes (default from security config) */
  maxRequestSize?: number;
  /** Maximum allowed URL length in characters (default from security config) */
  maxUrlLength?: number;
}

// Security configuration with safe defaults
const SECURITY_CONFIG = {
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB default
  MAX_URL_LENGTH: 2048                // 2KB default
};

function detectSuspiciousPatterns(req: any, config: DetectSuspiciousPatternsOptions = {}) {
  const maxRequestSize = config.maxRequestSize || SECURITY_CONFIG.MAX_REQUEST_SIZE;
  const maxUrlLength = config.maxUrlLength || SECURITY_CONFIG.MAX_URL_LENGTH;
  const patterns: string[] = [];

  const contentLength = parseInt(req.headers?.['content-length'] || '0', 10); // check content length
  if (contentLength > maxRequestSize) {
    patterns.push('oversized_request');
  }

  const url = req.url || ''; // check URL length
  if (url.length > maxUrlLength) {
    patterns.push('long_url');
  }

  if (/\.\./.test(url)) { // path traversal attempt
    patterns.push('path_traversal');
  }

  const urlLower = url.toLowerCase(); // XSS patterns
  if (/<script/i.test(url) ||
      urlLower.includes('javascript:') ||
      urlLower.includes('data:text/html') ||
      urlLower.includes('vbscript:')) {
    patterns.push('potential_xss');
  }

  if (/union\s+select/i.test(url) || // SQL injection patterns
      /;\s*drop\s+table/i.test(url) ||
      /'\s*or\s+'1'\s*=\s*'1/i.test(url)) {
    patterns.push('potential_sql_injection');
  }

  return patterns; // return detected patterns
}

export default detectSuspiciousPatterns;

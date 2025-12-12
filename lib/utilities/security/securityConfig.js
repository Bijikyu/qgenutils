'use strict';

/**
 * Security configuration constants
 * Centralized security settings for rate limiting, pattern detection, and monitoring
 * @module securityConfig
 */
const SECURITY_CONFIG = {
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes rate limit window
  RATE_LIMIT_MAX_REQUESTS: 100, // max requests per window per IP
  MAX_REQUEST_SIZE: 50 * 1024 * 1024, // 50MB max request size
  MAX_URL_LENGTH: 2048, // max URL length before flagging
  LOG_ALL_REQUESTS: false, // log all requests for monitoring
  SENSITIVE_ENDPOINTS: ['/api/admin', '/api/auth'], // endpoints to always log
  MAX_FAILED_ATTEMPTS: 10, // max suspicious attempts before blocking
  BLOCK_DURATION_MS: 30 * 60 * 1000, // 30 minute block duration
  MAX_TRACKED_IPS: 10000, // max IPs to track in memory
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000 // cleanup interval
};

module.exports = SECURITY_CONFIG;

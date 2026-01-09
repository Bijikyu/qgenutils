/**
 * Security Utilities Module Export
 *
 * PURPOSE: Provides centralized access to all security-focused utilities
 * for authentication, input sanitization, rate limiting, and threat detection.
 * This barrel export makes it easier to import multiple security
 * utilities while maintaining tree-shaking support.
 *
 * SECURITY CATEGORIES:
 * - Authentication: API key validation and timing-safe comparisons
 * - Sanitization: XSS-safe string and object sanitization
 * - Rate Limiting: IP tracking and rate limit store implementations
 * - Threat Detection: Suspicious pattern detection and analysis
 * - Data Protection: Sensitive data masking and secure logging
 * - Path Security: File and bucket name validation
 * - Middleware: Express security middleware factory functions
 */

// Authentication and comparison utilities
import timingSafeCompare from './timingSafeCompare.js';
import maskApiKey from './maskApiKey.js';
import extractApiKey from './extractApiKey.js';
import type { ExtractApiKeyOptions, Request } from './extractApiKey.js';
import maskString from './maskString.js';
import maskUnified from './maskUnified.js';

// Rate limiting and tracking
import createIpTracker from './createIpTracker.js';
import createRateLimitStore from './createRateLimitStore.js';
import buildRateLimitKey from './buildRateLimitKey.js';
import createSecurityRateLimiter from './createSecurityRateLimiter.js';

// Input sanitization and data protection
import sanitizeLogValue from './sanitizeLogValue.js';
import sanitizeObject from './sanitizeObject.js';
import sanitizeUrl from './sanitizeUrl.js';
import createSafeLoggingContext from './createSafeLoggingContext.js';
import createSafeObjectPath from './createSafeObjectPath.js';

// Threat detection and analysis
import detectSuspiciousPatterns from './detectSuspiciousPatterns.js';
import isSensitiveField from './isSensitiveField.js';

// Path and resource validation
import validateAndNormalizePath from './validateAndNormalizePath.js';
import validateBucketName from './validateBucketName.js';
import validateObjectName from './validateObjectName.js';

// Middleware factory functions
import setSecurityHeaders from './setSecurityHeaders.js';
import createSecurityMiddleware from './createSecurityMiddleware.js';

// Named exports for better tree-shaking support
export {
  // Authentication utilities
  timingSafeCompare,
  maskApiKey,
  extractApiKey,
  maskString,
  maskUnified,

  // Rate limiting
  createIpTracker,
  createRateLimitStore,
  buildRateLimitKey,
  createSecurityRateLimiter,

  // Sanitization
  sanitizeLogValue,
  sanitizeObject,
  sanitizeUrl,
  createSafeLoggingContext,
  createSafeObjectPath,

  // Threat detection
  detectSuspiciousPatterns,
  isSensitiveField,

  // Validation
  validateAndNormalizePath,
  validateBucketName,
  validateObjectName,

  // Middleware
  setSecurityHeaders,
  createSecurityMiddleware
};

// Default export for convenience (backward compatibility)
export default {
  timingSafeCompare,
  maskApiKey,
  extractApiKey,
  maskString,
  maskUnified,
  createIpTracker,
  createRateLimitStore,
  buildRateLimitKey,
  createSecurityRateLimiter,
  sanitizeLogValue,
  sanitizeObject,
  sanitizeUrl,
  createSafeLoggingContext,
  createSafeObjectPath,
  detectSuspiciousPatterns,
  isSensitiveField,
  validateAndNormalizePath,
  validateBucketName,
  validateObjectName,
  setSecurityHeaders,
  createSecurityMiddleware
};

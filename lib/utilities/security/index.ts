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
import timingSafeCompare from './timingSafeCompare';
import maskApiKey from './maskApiKey';
import extractApiKey from './extractApiKey';import type{ExtractApiKeyOptions,Request}from'./extractApiKey';
import maskString from './maskString';
import maskUnified from './maskUnified';

// Rate limiting and tracking
import createIpTracker from './createIpTracker';
import createRateLimitStore from './createRateLimitStore';
import buildRateLimitKey from './buildRateLimitKey';
import createSecurityRateLimiter from './createSecurityRateLimiter';

// Input sanitization and data protection
import sanitizeLogValue from './sanitizeLogValue';
import sanitizeObject from './sanitizeObject';
import sanitizeUrl from './sanitizeUrl';
import createSafeLoggingContext from './createSafeLoggingContext';
import createSafeObjectPath from './createSafeObjectPath';

// Threat detection and analysis
import detectSuspiciousPatterns from './detectSuspiciousPatterns';
import isSensitiveField from './isSensitiveField';

// Path and resource validation
import validateAndNormalizePath from './validateAndNormalizePath';
import validateBucketName from './validateBucketName';
import validateObjectName from './validateObjectName';

// Middleware factory functions
import setSecurityHeaders from './setSecurityHeaders';
import createSecurityMiddleware from './createSecurityMiddleware';

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
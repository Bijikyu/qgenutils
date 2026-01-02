/**
 * QUTILS - Comprehensive Utility Library
 * 
 * PURPOSE: This is the main entry point for a comprehensive utility library that provides
 * battle-tested, production-ready functions for common development tasks. The library is
 * organized into logical categories to make imports clear and maintainable.
 * 
 * ARCHITECTURE: The module structure follows a clear separation of concerns:
 * - Core utilities (logger, data structures)
 * - Security-focused utilities (passwords, validation, sanitization)
 * - Configuration and module management
 * - Performance and scheduling utilities
 * - Legacy compatibility layer
 * 
 * EXPORT STRATEGY: Each utility is exported both as a named export and as part of the
 * default export object to provide maximum flexibility for different import styles.
 * This dual export approach supports both ES6 named imports and CommonJS default imports.
 * 
 * SECURITY CONSIDERATIONS: All utilities that handle user input or sensitive data
 * include comprehensive validation, sanitization, and error handling to prevent
 * security vulnerabilities and ensure predictable behavior.
 */

// Core logging utility - provides structured logging with multiple levels
import logger from './lib/logger.js';

// Data structures - efficient algorithms and data structures for performance-critical operations
import createMinHeap from './lib/utilities/data-structures/MinHeap.js';

// Password utilities - secure password hashing, verification, and generation following OWASP guidelines
import hashPassword from './lib/utilities/password/hashPassword.js';
import verifyPassword from './lib/utilities/password/verifyPassword.js';
import generateSecurePassword from './lib/utilities/password/generateSecurePassword.js';

// Secure configuration utilities - handle sensitive configuration values safely
import maskSensitiveValue from './lib/utilities/secure-config/maskSensitiveValue.js';
import validateConfigValue from './lib/utilities/secure-config/validateConfigValue.js';
import buildSecureConfig from './lib/utilities/secure-config/buildSecureConfig.js';

// Module loader utilities - dynamic module loading with caching and performance optimization
import loadAndFlattenModule from './lib/utilities/module-loader/loadAndFlattenModule.js';
import createCachedLoader from './lib/utilities/module-loader/createCachedLoader.js';
import createSimpleLoader from './lib/utilities/module-loader/createSimpleLoader.js';
import createDirectLoader from './lib/utilities/module-loader/createDirectLoader.js';

// Performance monitoring utilities - temporarily disabled due to import issues
// These utilities provide comprehensive performance tracking and health monitoring
// TODO: Resolve import dependencies and re-enable performance monitoring
// import collectPerformanceMetrics from './lib/utilities/performance-monitor/collectPerformanceMetrics.js';
// import measureEventLoopLag from './lib/utilities/performance-monitor/measureEventLoopLag.js';
// import analyzePerformanceMetrics from './lib/utilities/performance-monitor/analyzePerformanceMetrics.js';
// import getPerformanceHealthStatus from './lib/utilities/performance-monitor/getPerformanceHealthStatus.js';
// import createPerformanceMonitor from './lib/utilities/performance-monitor/createPerformanceMonitor.js';

// Validation utilities - comprehensive input validation with security-first approach
// Each validator includes proper error handling, type checking, and security considerations
import validateEmailSimple from './lib/utilities/validation/validateEmailSimple.js';
import validatePassword from './lib/utilities/validation/validatePassword.js';
import validateAmount from './lib/utilities/validation/validateAmount.js';
import validateApiKey from './lib/utilities/validation/validateApiKey.js';
import validateCurrency from './lib/utilities/validation/validateCurrency.js';
import validatePaymentMethodNonce from './lib/utilities/validation/validatePaymentMethodNonce.js';
import validateDateRange from './lib/utilities/validation/validateDateRange.js';
import validateSubscriptionPlan from './lib/utilities/validation/validateSubscriptionPlan.js';
import sanitizeInput from './lib/utilities/validation/sanitizeInput.js';
import extractValidationErrors from './lib/utilities/validation/extractValidationErrors.js';
import validateEnum from './lib/utilities/validation/validateEnum.js';
import validateNumberRange from './lib/utilities/validation/validateNumberRange.js';
import validateStringLength from './lib/utilities/validation/validateStringLength.js';
import validateArray from './lib/utilities/validation/validateArray.js';
import validatePattern from './lib/utilities/validation/validatePattern.js';
import validateBoolean from './lib/utilities/validation/validateBoolean.js';
import validateDate from './lib/utilities/validation/validateDate.js';
import validateObjectId from './lib/utilities/validation/validateObjectId.js';
import validatePagination from './lib/utilities/validation/validatePagination.js';
import createValidator from './lib/utilities/validation/createValidator.js';
import createResourceValidator from './lib/utilities/validation/createResourceValidator.js';
import createValidationErrorHandler from './lib/utilities/validation/createValidationErrorHandler.js';
import validateRequiredString from './lib/utilities/validation/validateRequiredString.js';
import validateNumberInRange from './lib/utilities/validation/validateNumberInRange.js';

// Zod validation utilities - schema-based validation with type safety and comprehensive error handling
// These utilities leverage Zod for runtime type checking and validation with TypeScript integration
import zodStringValidators from './lib/utilities/validation/zodStringValidators.js';
import zodNumberValidators from './lib/utilities/validation/zodNumberValidators.js';
import zodValidationUtils from './lib/utilities/validation/zodValidationUtils.js';
import zodSchemaBuilders from './lib/utilities/validation/zodSchemaBuilders.js';
import createApiKeyAuth from './lib/utilities/validation/createApiKeyAuth.js';
import createCredentialSchema from './lib/utilities/validation/createCredentialSchema.js';
import createServiceMeta from './lib/utilities/validation/createServiceMeta.js';

// Configuration utilities - build and manage application configurations with validation
// These utilities provide structured configuration building with type safety and defaults
import buildFeatureConfig from './lib/utilities/config/buildFeatureConfig.js';
import buildSecurityConfig from './lib/utilities/config/buildSecurityConfig.js';
import buildValidationConfig from './lib/utilities/config/buildValidationConfig.js';
import buildTestRunnerConfig from './lib/utilities/config/buildTestRunnerConfig.js';
import createPerformanceMetrics from './lib/utilities/config/createPerformanceMetrics.js';
import createProcessingCapabilities from './lib/utilities/config/createProcessingCapabilities.js';

// Scheduling utilities - time-based job scheduling and cron expression management
// These utilities provide reliable scheduling with proper cleanup and error handling
import msToCron from './lib/utilities/scheduling/msToCron.js';
import scheduleInterval from './lib/utilities/scheduling/scheduleInterval.js';
import scheduleOnce from './lib/utilities/scheduling/scheduleOnce.js';
import cleanupJobs from './lib/utilities/scheduling/cleanupJobs.js';

// Middleware utilities - Express.js middleware for security and rate limiting
// These utilities provide production-ready middleware with proper error handling
import createApiKeyValidator from './lib/utilities/middleware/createApiKeyValidator.js';
import createRateLimiter from './lib/utilities/middleware/createRateLimiter.js';

// Legacy backward compatibility imports - DateTime utilities
// These imports maintain compatibility with existing code that uses the old API
// TODO: Consider deprecating these in favor of more modern alternatives
import formatDateTime from './lib/utilities/datetime/formatDateTime.js';
import formatDuration from './lib/utilities/datetime/formatDuration.js';
import addDays from './lib/utilities/datetime/addDays.js';

// Legacy backward compatibility imports - URL utilities  
// These utilities provide URL manipulation and validation for legacy compatibility
// They maintain the existing API while newer alternatives may be available
import ensureProtocol from './lib/utilities/url/ensureProtocol.js';
import normalizeUrlOrigin from './lib/utilities/url/normalizeUrlOrigin.js';
import stripProtocol from './lib/utilities/url/stripProtocol.js';
import parseUrlParts from './lib/utilities/url/parseUrlParts.js';

// Legacy backward compatibility imports - Missing legacy functions
// These functions provide compatibility for code that depends on older utility patterns
// They bridge the gap between legacy code patterns and modern implementations
import {
  requireFields,
  checkPassportAuth,
  hasGithubStrategy,
  calculateContentLength,
  getRequiredHeader,
  sendJsonResponse,
  buildCleanHeaders,
  renderView,
  registerViewRoute
} from './lib/utilities/legacy/missingLegacyFunctions.js';

// Legacy backward compatibility alias
// This alias ensures that existing code using validateEmail continues to work
// while the newer validateEmailSimple provides improved functionality
const validateEmail = validateEmailSimple;

/**
 * EXPORT SECTION - Named Exports
 * 
 * PURPOSE: Export all utilities as named exports to support ES6 import syntax
 * This allows consumers to import only the utilities they need, reducing bundle size
 * and improving tree-shaking capabilities.
 * 
 * ORGANIZATION: Exports are grouped by category with comments to maintain clarity
 * and make it easy to find specific utilities. The grouping matches the import
 * organization above for consistency.
 * 
 * COMPATIBILITY: Both named exports and default export are provided to support
 * different import styles and module systems.
 */
export {
  logger,
  // Data structures - efficient algorithms and data structures
  createMinHeap,
  // Password utilities - secure password handling and generation
  hashPassword,
  verifyPassword,
  generateSecurePassword,
  // Secure configuration utilities - safe configuration management
  maskSensitiveValue,
  validateConfigValue,
  buildSecureConfig,
  // Module loader utilities - dynamic module loading with caching
  loadAndFlattenModule,
  createCachedLoader,
  createSimpleLoader,
  createDirectLoader,
  // Performance monitoring utilities - temporarily disabled due to import issues
  // TODO: Resolve import dependencies and re-enable these exports
  // collectPerformanceMetrics,
  // measureEventLoopLag,
  // analyzePerformanceMetrics,
  // getPerformanceHealthStatus,
  // createPerformanceMonitor,
  // Validation utilities - comprehensive input validation
  validateEmailSimple,
  validatePassword,
  validateAmount,
  validateApiKey,
  validateCurrency,
  validatePaymentMethodNonce,
  validateDateRange,
  validateSubscriptionPlan,
  sanitizeInput,
  extractValidationErrors,
  validateEnum,
  validateNumberRange,
  validateStringLength,
  validateArray,
  validatePattern,
  validateBoolean,
  validateDate,
  validateObjectId,
  validatePagination,
  createValidator,
  createResourceValidator,
  createValidationErrorHandler,
  validateRequiredString,
  validateNumberInRange,
  // Zod validation utilities - schema-based validation with type safety
  zodStringValidators,
  zodNumberValidators,
  zodValidationUtils,
  zodSchemaBuilders,
  createApiKeyAuth,
  createCredentialSchema,
  createServiceMeta,
  // Configuration utilities - application configuration building
  buildFeatureConfig,
  buildSecurityConfig,
  buildValidationConfig,
  buildTestRunnerConfig,
  createPerformanceMetrics,
  createProcessingCapabilities,
  // Scheduling utilities - time-based job scheduling
  msToCron,
  scheduleInterval,
  scheduleOnce,
  cleanupJobs,
  // Middleware utilities - Express.js middleware for security
  createApiKeyValidator,
  createRateLimiter,
  // Legacy backward compatibility exports - DateTime utilities
  // These exports maintain compatibility with existing code
  formatDateTime,
  formatDuration,
  addDays,
  // Legacy backward compatibility exports - URL utilities
  ensureProtocol,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts,
  // Legacy backward compatibility exports - Validation aliases
  validateEmail
};

/**
 * DEFAULT EXPORT - Complete Utility Bundle
 * 
 * PURPOSE: Export all utilities as a single default object to support CommonJS
 * and legacy import patterns. This provides maximum compatibility with different
 * module systems and existing codebases.
 * 
 * USAGE: Consumers can import the entire bundle with `import qutils from 'qutils'`
 * or `const qutils = require('qutils')` and access utilities as properties.
 * 
 * STRUCTURE: The default export contains all utilities organized in a flat
 * structure for easy access. Each utility is available as a direct property
 * of the exported object.
 * 
 * MAINTENANCE: When adding new utilities, ensure they are included in both
 * the named exports above and this default export to maintain consistency.
 */
export default {
  // Core utilities
  logger,
  // Data structures
  createMinHeap,
  // Password utilities
  hashPassword,
  verifyPassword,
  generateSecurePassword,
  // Secure configuration utilities
  maskSensitiveValue,
  validateConfigValue,
  buildSecureConfig,
  // Module loader utilities
  loadAndFlattenModule,
  createCachedLoader,
  createSimpleLoader,
  createDirectLoader,
  // Performance monitoring utilities - temporarily disabled
  // TODO: Re-enable when import issues are resolved
  // collectPerformanceMetrics,
  // measureEventLoopLag,
  // analyzePerformanceMetrics,
  // getPerformanceHealthStatus,
  // createPerformanceMonitor,
  // Validation utilities
  validateEmailSimple,
  validatePassword,
  validateAmount,
  validateApiKey,
  validateCurrency,
  validatePaymentMethodNonce,
  validateDateRange,
  validateSubscriptionPlan,
  sanitizeInput,
  extractValidationErrors,
  validateEnum,
  validateNumberRange,
  validateStringLength,
  validateArray,
  validatePattern,
  validateBoolean,
  validateDate,
  validateObjectId,
  validatePagination,
  createValidator,
  createResourceValidator,
  createValidationErrorHandler,
  validateRequiredString,
  validateNumberInRange,
  // Zod validation utilities
  zodStringValidators,
  zodNumberValidators,
  zodValidationUtils,
  zodSchemaBuilders,
  createApiKeyAuth,
  createCredentialSchema,
  createServiceMeta,
  // Configuration utilities
  buildFeatureConfig,
  buildSecurityConfig,
  buildValidationConfig,
  buildTestRunnerConfig,
  createPerformanceMetrics,
  createProcessingCapabilities,
  // Scheduling utilities
  msToCron,
  scheduleInterval,
  scheduleOnce,
  cleanupJobs,
  // Middleware utilities
  createApiKeyValidator,
  createRateLimiter,
  // Legacy backward compatibility exports - DateTime utilities
  formatDateTime,
  formatDuration,
  addDays,
  // Legacy backward compatibility exports - URL utilities
  ensureProtocol,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts,
  // Legacy backward compatibility exports - Validation aliases
  validateEmail
};
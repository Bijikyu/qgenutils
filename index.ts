import logger from './lib/logger.js';

// Data structures
import createMinHeap from './lib/utilities/data-structures/MinHeap';

// Password utilities
import hashPassword from './lib/utilities/password/hashPassword';
import verifyPassword from './lib/utilities/password/verifyPassword';
import generateSecurePassword from './lib/utilities/password/generateSecurePassword';

// Secure configuration utilities
import maskSensitiveValue from './lib/utilities/secure-config/maskSensitiveValue';
import validateConfigValue from './lib/utilities/secure-config/validateConfigValue';
import buildSecureConfig from './lib/utilities/secure-config/buildSecureConfig';

// Module loader utilities
import loadAndFlattenModule from './lib/utilities/module-loader/loadAndFlattenModule';
import createCachedLoader from './lib/utilities/module-loader/createCachedLoader';
import createSimpleLoader from './lib/utilities/module-loader/createSimpleLoader';
import createDirectLoader from './lib/utilities/module-loader/createDirectLoader';

// Performance monitoring utilities
import collectPerformanceMetrics from './lib/utilities/performance-monitor/collectPerformanceMetrics';
import measureEventLoopLag from './lib/utilities/performance-monitor/measureEventLoopLag';
import analyzePerformanceMetrics from './lib/utilities/performance-monitor/analyzePerformanceMetrics';
import getPerformanceHealthStatus from './lib/utilities/performance-monitor/getPerformanceHealthStatus';
import createPerformanceMonitor from './lib/utilities/performance-monitor/createPerformanceMonitor';

// Validation utilities
import validateEmailFormat from './lib/utilities/validation/validateEmail';
import validatePasswordStrength from './lib/utilities/validation/validatePassword';
import validateMonetaryAmount from './lib/utilities/validation/validateAmount';
import validateApiKeyFormat from './lib/utilities/validation/validateApiKey';
import validateCurrencyCode from './lib/utilities/validation/validateCurrency';
import validatePaymentMethodNonce from './lib/utilities/validation/validatePaymentMethodNonce';
import validateDateRange from './lib/utilities/validation/validateDateRange';
import validateSubscriptionPlan from './lib/utilities/validation/validateSubscriptionPlan';
import sanitizeInput from './lib/utilities/validation/sanitizeInput';
import extractValidationErrors from './lib/utilities/validation/extractValidationErrors';
import validateEnum from './lib/utilities/validation/validateEnum';
import validateNumberRange from './lib/utilities/validation/validateNumberRange';
import validateStringLength from './lib/utilities/validation/validateStringLength';
import validateArray from './lib/utilities/validation/validateArray';
import validatePattern from './lib/utilities/validation/validatePattern';
import validateBoolean from './lib/utilities/validation/validateBoolean';
import validateDate from './lib/utilities/validation/validateDate';
import validateObjectId from './lib/utilities/validation/validateObjectId';
import validatePagination from './lib/utilities/validation/validatePagination';
import createValidator from './lib/utilities/validation/createValidator';
import createResourceValidator from './lib/utilities/validation/createResourceValidator';
import createValidationErrorHandler from './lib/utilities/validation/createValidationErrorHandler';
import validateRequiredString from './lib/utilities/validation/validateRequiredString';
import validateNumberInRange from './lib/utilities/validation/validateNumberInRange';

// Zod validation utilities
import zodStringValidators from './lib/utilities/validation/zodStringValidators';
import zodNumberValidators from './lib/utilities/validation/zodNumberValidators';
import zodValidationUtils from './lib/utilities/validation/zodValidationUtils';
import zodSchemaBuilders from './lib/utilities/validation/zodSchemaBuilders';
import createApiKeyAuth from './lib/utilities/validation/createApiKeyAuth';
import createCredentialSchema from './lib/utilities/validation/createCredentialSchema';
import createServiceMeta from './lib/utilities/validation/createServiceMeta';

// Configuration utilities
import buildFeatureConfig from './lib/utilities/config/buildFeatureConfig';
import buildSecurityConfig from './lib/utilities/config/buildSecurityConfig';
import buildValidationConfig from './lib/utilities/config/buildValidationConfig';
import buildTestRunnerConfig from './lib/utilities/config/buildTestRunnerConfig';
import createPerformanceMetrics from './lib/utilities/config/createPerformanceMetrics';
import createProcessingCapabilities from './lib/utilities/config/createProcessingCapabilities';

// Scheduling utilities
import msToCron from './lib/utilities/scheduling/msToCron';
import scheduleInterval from './lib/utilities/scheduling/scheduleInterval';
import scheduleOnce from './lib/utilities/scheduling/scheduleOnce';
import cleanupJobs from './lib/utilities/scheduling/cleanupJobs';

// Middleware utilities
import createApiKeyValidator from './lib/utilities/middleware/createApiKeyValidator';
import createRateLimiter from './lib/utilities/middleware/createRateLimiter';

// Export everything
export {
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
  // Performance monitoring utilities
  collectPerformanceMetrics,
  measureEventLoopLag,
  analyzePerformanceMetrics,
  getPerformanceHealthStatus,
  createPerformanceMonitor,
  // Validation utilities
  validateEmailFormat,
  validatePasswordStrength,
  validateMonetaryAmount,
  validateApiKeyFormat,
  validateCurrencyCode,
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
  createRateLimiter
};

export default {
  logger,
  createMinHeap,
  hashPassword,
  verifyPassword,
  generateSecurePassword,
  maskSensitiveValue,
  validateConfigValue,
  buildSecureConfig,
  loadAndFlattenModule,
  createCachedLoader,
  createSimpleLoader,
  createDirectLoader,
  collectPerformanceMetrics,
  measureEventLoopLag,
  analyzePerformanceMetrics,
  getPerformanceHealthStatus,
  createPerformanceMonitor,
  validateEmailFormat,
  validatePasswordStrength,
  validateMonetaryAmount,
  validateApiKeyFormat,
  validateCurrencyCode,
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
  zodStringValidators,
  zodNumberValidators,
  zodValidationUtils,
  zodSchemaBuilders,
  createApiKeyAuth,
  createCredentialSchema,
  createServiceMeta,
  buildFeatureConfig,
  buildSecurityConfig,
  buildValidationConfig,
  buildTestRunnerConfig,
  createPerformanceMetrics,
  createProcessingCapabilities,
  msToCron,
  scheduleInterval,
  scheduleOnce,
  cleanupJobs,
  createApiKeyValidator,
  createRateLimiter
};
import logger from './lib/logger.js';

// Data structures
import createMinHeap from './lib/utilities/data-structures/MinHeap.js';

// Password utilities
import hashPassword from './lib/utilities/password/hashPassword.js';
import verifyPassword from './lib/utilities/password/verifyPassword.js';
import generateSecurePassword from './lib/utilities/password/generateSecurePassword.js';

// Secure configuration utilities
import maskSensitiveValue from './lib/utilities/secure-config/maskSensitiveValue.js';
import validateConfigValue from './lib/utilities/secure-config/validateConfigValue.js';
import buildSecureConfig from './lib/utilities/secure-config/buildSecureConfig.js';

// Module loader utilities
import loadAndFlattenModule from './lib/utilities/module-loader/loadAndFlattenModule.js';
import createCachedLoader from './lib/utilities/module-loader/createCachedLoader.js';
import createSimpleLoader from './lib/utilities/module-loader/createSimpleLoader.js';
import createDirectLoader from './lib/utilities/module-loader/createDirectLoader.js';

// Performance monitoring utilities - temporarily disabled due to import issues
// import collectPerformanceMetrics from './lib/utilities/performance-monitor/collectPerformanceMetrics.js';
// import measureEventLoopLag from './lib/utilities/performance-monitor/measureEventLoopLag.js';
// import analyzePerformanceMetrics from './lib/utilities/performance-monitor/analyzePerformanceMetrics.js';
// import getPerformanceHealthStatus from './lib/utilities/performance-monitor/getPerformanceHealthStatus.js';
// import createPerformanceMonitor from './lib/utilities/performance-monitor/createPerformanceMonitor.js';

// Validation utilities
import validateEmailFormat from './lib/utilities/validation/validateEmailSimple.js';
import validatePasswordStrength from './lib/utilities/validation/validatePassword.js';
import validateMonetaryAmount from './lib/utilities/validation/validateAmount.js';
import validateApiKeyFormat from './lib/utilities/validation/validateApiKey.js';
import validateCurrencyCode from './lib/utilities/validation/validateCurrency.js';
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

// Zod validation utilities
import zodStringValidators from './lib/utilities/validation/zodStringValidators.js';
import zodNumberValidators from './lib/utilities/validation/zodNumberValidators.js';
import zodValidationUtils from './lib/utilities/validation/zodValidationUtils.js';
import zodSchemaBuilders from './lib/utilities/validation/zodSchemaBuilders.js';
import createApiKeyAuth from './lib/utilities/validation/createApiKeyAuth.js';
import createCredentialSchema from './lib/utilities/validation/createCredentialSchema.js';
import createServiceMeta from './lib/utilities/validation/createServiceMeta.js';

// Configuration utilities
import buildFeatureConfig from './lib/utilities/config/buildFeatureConfig.js';
import buildSecurityConfig from './lib/utilities/config/buildSecurityConfig.js';
import buildValidationConfig from './lib/utilities/config/buildValidationConfig.js';
import buildTestRunnerConfig from './lib/utilities/config/buildTestRunnerConfig.js';
import createPerformanceMetrics from './lib/utilities/config/createPerformanceMetrics.js';
import createProcessingCapabilities from './lib/utilities/config/createProcessingCapabilities.js';

// Scheduling utilities
import msToCron from './lib/utilities/scheduling/msToCron.js';
import scheduleInterval from './lib/utilities/scheduling/scheduleInterval.js';
import scheduleOnce from './lib/utilities/scheduling/scheduleOnce.js';
import cleanupJobs from './lib/utilities/scheduling/cleanupJobs.js';

// Middleware utilities
import createApiKeyValidator from './lib/utilities/middleware/createApiKeyValidator.js';
import createRateLimiter from './lib/utilities/middleware/createRateLimiter.js';

// Legacy backward compatibility imports - DateTime utilities
import formatDateTime from './lib/utilities/datetime/formatDateTime.js';
import formatDuration from './lib/utilities/datetime/formatDuration.js';
import addDays from './lib/utilities/datetime/addDays.js';

// Legacy backward compatibility imports - URL utilities  
import ensureProtocol from './lib/utilities/url/ensureProtocol.js';
import normalizeUrlOrigin from './lib/utilities/url/normalizeUrlOrigin.js';
import stripProtocol from './lib/utilities/url/stripProtocol.js';
import parseUrlParts from './lib/utilities/url/parseUrlParts.js';

// Legacy backward compatibility imports - Missing legacy functions
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
const validateEmail = validateEmailFormat;

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
  // Performance monitoring utilities - temporarily disabled due to import issues
  // collectPerformanceMetrics,
  // measureEventLoopLag,
  // analyzePerformanceMetrics,
  // getPerformanceHealthStatus,
  // createPerformanceMonitor,
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
  // collectPerformanceMetrics,
  // measureEventLoopLag,
  // analyzePerformanceMetrics,
  // getPerformanceHealthStatus,
  // createPerformanceMonitor,
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
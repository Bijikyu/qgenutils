import logger from './lib/logger.js';

// Datetime utilities
import formatDateTime from './lib/utilities/datetime/formatDateTime.js';
import formatDuration from './lib/utilities/datetime/formatDuration.js';
import addDays from './lib/utilities/datetime/addDays.js';
import formatDate from './lib/utilities/datetime/formatDate.js';
import formatDateWithPrefix from './lib/utilities/datetime/formatDateWithPrefix.js';
import createTimeProvider from './lib/utilities/datetime/createTimeProvider.js';
import formatDateTimeWithProvider from './lib/utilities/datetime/formatDateTimeWithProvider.js';
import formatDurationWithProvider from './lib/utilities/datetime/formatDurationWithProvider.js';
import formatRelativeTime from './lib/utilities/datetime/formatRelativeTime.js';

// URL utilities
import ensureProtocol from './lib/utilities/url/ensureProtocol.js';
import ensureProtocolUrl from './lib/utilities/url/ensureProtocolUrl.js';
import normalizeUrlOrigin from './lib/utilities/url/normalizeUrlOrigin.js';
import stripProtocol from './lib/utilities/url/stripProtocol.js';
import parseUrlParts from './lib/utilities/url/parseUrlParts.js';

// ID generation utilities
import generateExecutionId from './lib/utilities/id-generation/generateExecutionId.js';
import makeIdempotencyKey from './lib/utilities/id-generation/makeIdempotencyKey.js';
import makeIdempotencyKeyObj from './lib/utilities/id-generation/makeIdempotencyKeyObj.js';

// String utilities
import sanitizeString from './lib/utilities/string/sanitizeString.js';

// Array utilities
import dedupeByLowercaseFirst from './lib/utilities/array/dedupeByLowercaseFirst.js';

// File utilities
import formatFileSize from './lib/utilities/file/formatFileSize.js';

// Performance utilities
import safeDurationFromTimer from './lib/utilities/performance/safeDurationFromTimer.js';
import createSafeDurationExtractor from './lib/utilities/performance/createSafeDurationExtractor.js';

// Function utilities
import createDualVersionFunction from './lib/utilities/function/createDualVersionFunction.js';

// Logger utilities
import getAppLogger from './lib/utilities/logger/getAppLogger.js';
import createRunId from './lib/utilities/logger/createRunId.js';
import getAppLoggerCore from './lib/utilities/logger/getAppLoggerCore.js';
import createRunIdCore from './lib/utilities/logger/createRunIdCore.js';

// API utilities
import buildEndpointMeta from './lib/utilities/api/buildEndpointMeta.js';
import attachEndpointMeta from './lib/utilities/api/attachEndpointMeta.js';

// HTTP utilities
import createJsonHeaders from './lib/utilities/http/createJsonHeaders.js';
import createBasicAuth from './lib/utilities/http/createBasicAuth.js';
import contextualTimeouts from './lib/utilities/http/contextualTimeouts.js';
import getContextualTimeout from './lib/utilities/http/getContextualTimeout.js';
import createTimeoutConfig from './lib/utilities/http/createTimeoutConfig.js';
import createDynamicTimeout from './lib/utilities/http/createDynamicTimeout.js';
import createHttpConfig from './lib/utilities/http/createHttpConfig.js';

// Batch processing utilities
import createSemaphore from './lib/utilities/batch/createSemaphore.js';
import retryWithBackoff from './lib/utilities/batch/retryWithBackoff.js';
import processBatch from './lib/utilities/batch/processBatch.js';

// Array collections utilities
import groupBy from './lib/utilities/collections/array/groupBy.js';
import partition from './lib/utilities/collections/array/partition.js';
import unique from './lib/utilities/collections/array/unique.js';
import chunk from './lib/utilities/collections/array/chunk.js';
import flatten from './lib/utilities/collections/array/flatten.js';
import intersection from './lib/utilities/collections/array/intersection.js';
import difference from './lib/utilities/collections/array/difference.js';
import sortBy from './lib/utilities/collections/array/sortBy.js';
import shuffle from './lib/utilities/collections/array/shuffle.js';
import take from './lib/utilities/collections/array/take.js';
import takeWhile from './lib/utilities/collections/array/takeWhile.js';
import skip from './lib/utilities/collections/array/skip.js';
import skipWhile from './lib/utilities/collections/array/skipWhile.js';

// Object collections utilities
import isPlainObject from './lib/utilities/collections/object/isPlainObject.js';
import pick from './lib/utilities/collections/object/pick.js';
import omit from './lib/utilities/collections/object/omit.js';
import deepMerge from './lib/utilities/collections/object/deepMerge.js';
import deepClone from './lib/utilities/collections/object/deepClone.js';
import getNestedValue from './lib/utilities/collections/object/getNestedValue.js';
import setNestedValue from './lib/utilities/collections/object/setNestedValue.js';
import isEqual from './lib/utilities/collections/object/isEqual.js';
import mapKeys from './lib/utilities/collections/object/mapKeys.js';
import mapValues from './lib/utilities/collections/object/mapValues.js';
import filterKeys from './lib/utilities/collections/object/filterKeys.js';
import isEmpty from './lib/utilities/collections/object/isEmpty.js';
import toQueryString from './lib/utilities/collections/object/toQueryString.js';
import fromQueryString from './lib/utilities/collections/object/fromQueryString.js';

// Performance optimization utilities
import memoize from './lib/utilities/performance/memoize.js';
import throttle from './lib/utilities/performance/throttle.js';
import debounce from './lib/utilities/performance/debounce.js';

// Security utilities
import timingSafeCompare from './lib/utilities/security/timingSafeCompare.js';
import maskApiKey from './lib/utilities/security/maskApiKey.js';
import extractApiKey from './lib/utilities/security/extractApiKey.js';
import createRateLimitStore from './lib/utilities/security/createRateLimitStore.js';
import buildRateLimitKey from './lib/utilities/security/buildRateLimitKey.js';

// Middleware utilities
import createApiKeyValidator from './lib/utilities/middleware/createApiKeyValidator.js';
import createRateLimiter from './lib/utilities/middleware/createRateLimiter.js';

// Scheduling utilities
import msToCron from './lib/utilities/scheduling/msToCron.js';
import scheduleInterval from './lib/utilities/scheduling/scheduleInterval.js';
import scheduleOnce from './lib/utilities/scheduling/scheduleOnce.js';
import cleanupJobs from './lib/utilities/scheduling/cleanupJobs.js';

// Configuration utilities
import buildFeatureConfig from './lib/utilities/config/buildFeatureConfig.js';
import buildSecurityConfig from './lib/utilities/config/buildSecurityConfig.js';
import buildValidationConfig from './lib/utilities/config/buildValidationConfig.js';
import buildTestRunnerConfig from './lib/utilities/config/buildTestRunnerConfig.js';
import createPerformanceMetrics from './lib/utilities/config/createPerformanceMetrics.js';
import createProcessingCapabilities from './lib/utilities/config/createProcessingCapabilities.js';

// Execution utilities
import execHelperWrapper from './lib/utilities/function/execHelperWrapper.js';
import createExecHelper from './lib/utilities/function/createExecHelper.js';

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

// Performance monitoring utilities
import collectPerformanceMetrics from './lib/utilities/performance-monitor/collectPerformanceMetrics.js';
import measureEventLoopLag from './lib/utilities/performance-monitor/measureEventLoopLag.js';
import analyzePerformanceMetrics from './lib/utilities/performance-monitor/analyzePerformanceMetrics.js';
import getPerformanceHealthStatus from './lib/utilities/performance-monitor/getPerformanceHealthStatus.js';
import createPerformanceMonitor from './lib/utilities/performance-monitor/createPerformanceMonitor.js';

// Validation utilities
import validateEmailFormat from './lib/utilities/validation/validateEmail.js';
import validatePasswordStrength from './lib/utilities/validation/validatePassword.js';
import validateMonetaryAmount from './lib/utilities/validation/validateAmount.js';
import validateApiKeyFormat from './lib/utilities/validation/validateApiKey.js';
import validateCurrencyCode from './lib/utilities/validation/validateCurrency.js';
import validatePaymentMethodNonce from './lib/utilities/validation/validatePaymentMethodNonce.js';
import validateDateRange from './lib/utilities/validation/validateDateRange.js';
import validateSubscriptionPlan from './lib/utilities/validation/validateSubscriptionPlan.js';
import sanitizeInput from './lib/utilities/validation/sanitizeInput.js';
import createValidationMiddleware from './lib/utilities/validation/createValidationMiddleware.js';
const {
  createPaymentValidation,
  createUserValidation,
  createSubscriptionValidation,
  handleValidationErrors
} = createValidationMiddleware;
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

// Extended security utilities
import SECURITY_CONFIG from './lib/utilities/security/securityConfig.js';
import detectSuspiciousPatterns from './lib/utilities/security/detectSuspiciousPatterns.js';
import createIpTracker from './lib/utilities/security/createIpTracker.js';
import createSecurityMiddleware from './lib/utilities/security/createSecurityMiddleware.js';
import createSecurityRateLimiter from './lib/utilities/security/createSecurityRateLimiter.js';
import setSecurityHeaders from './lib/utilities/security/setSecurityHeaders.js';
import validateAndNormalizePath from './lib/utilities/security/validateAndNormalizePath.js';
import validateBucketName from './lib/utilities/security/validateBucketName.js';
import validateObjectName from './lib/utilities/security/validateObjectName.js';
import createSafeObjectPath from './lib/utilities/security/createSafeObjectPath.js';
import sanitizeLogValue from './lib/utilities/security/sanitizeLogValue.js';
import sanitizeObject from './lib/utilities/security/sanitizeObject.js';
import sanitizeUrl from './lib/utilities/security/sanitizeUrl.js';
import createSafeLoggingContext from './lib/utilities/security/createSafeLoggingContext.js';
import isSensitiveField from './lib/utilities/security/isSensitiveField.js';
import maskString from './lib/utilities/security/maskString.js';

// Export everything
export {
  logger,
  // Datetime utilities
  formatDateTime,
  formatDuration,
  addDays,
  formatDate,
  formatDateWithPrefix,
  createTimeProvider,
  formatDateTimeWithProvider,
  formatDurationWithProvider,
  formatRelativeTime,
  // URL utilities
  ensureProtocol,
  ensureProtocolUrl,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts,
  // ID generation utilities
  generateExecutionId,
  makeIdempotencyKey,
  makeIdempotencyKeyObj,
  // String utilities
  sanitizeString,
  // Array utilities
  dedupeByLowercaseFirst,
  // File utilities
  formatFileSize,
  // Performance utilities
  safeDurationFromTimer,
  createSafeDurationExtractor,
  // Function utilities
  createDualVersionFunction,
  // Logger utilities
  getAppLogger,
  createRunId,
  getAppLoggerCore,
  createRunIdCore,
  // API utilities
  buildEndpointMeta,
  attachEndpointMeta,
  // HTTP utilities
  createJsonHeaders,
  createBasicAuth,
  contextualTimeouts,
  getContextualTimeout,
  createTimeoutConfig,
  createDynamicTimeout,
  createHttpConfig,
  // Batch processing utilities
  createSemaphore,
  retryWithBackoff,
  processBatch,
  // Array collections utilities
  groupBy,
  partition,
  unique,
  chunk,
  flatten,
  intersection,
  difference,
  sortBy,
  shuffle,
  take,
  takeWhile,
  skip,
  skipWhile,
  // Object collections utilities
  isPlainObject,
  pick,
  omit,
  deepMerge,
  deepClone,
  getNestedValue,
  setNestedValue,
  isEqual,
  mapKeys,
  mapValues,
  filterKeys,
  isEmpty,
  toQueryString,
  fromQueryString,
  // Performance optimization utilities
  memoize,
  throttle,
  debounce,
  // Security utilities
  timingSafeCompare,
  maskApiKey,
  extractApiKey,
  createRateLimitStore,
  buildRateLimitKey,
  // Middleware utilities
  createApiKeyValidator,
  createRateLimiter,
  // Scheduling utilities
  msToCron,
  scheduleInterval,
  scheduleOnce,
  cleanupJobs,
  // Configuration utilities
  buildFeatureConfig,
  buildSecurityConfig,
  buildValidationConfig,
  buildTestRunnerConfig,
  createPerformanceMetrics,
  createProcessingCapabilities,
  // Execution utilities
  execHelperWrapper,
  createExecHelper,
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
  createPaymentValidation,
  createUserValidation,
  createSubscriptionValidation,
  handleValidationErrors,
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
  // Extended security utilities
  SECURITY_CONFIG,
  detectSuspiciousPatterns,
  createIpTracker,
  createSecurityMiddleware,
  createSecurityRateLimiter,
  setSecurityHeaders,
  validateAndNormalizePath,
  validateBucketName,
  validateObjectName,
  createSafeObjectPath,
  sanitizeLogValue,
  sanitizeObject,
  sanitizeUrl,
  createSafeLoggingContext,
  isSensitiveField,
  maskString
};

export default {
  logger,
  formatDateTime,
  formatDuration,
  addDays,
  formatDate,
  formatDateWithPrefix,
  createTimeProvider,
  formatDateTimeWithProvider,
  formatDurationWithProvider,
  formatRelativeTime,
  ensureProtocol,
  ensureProtocolUrl,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts,
  generateExecutionId,
  makeIdempotencyKey,
  makeIdempotencyKeyObj,
  sanitizeString,
  dedupeByLowercaseFirst,
  formatFileSize,
  safeDurationFromTimer,
  createSafeDurationExtractor,
  createDualVersionFunction,
  getAppLogger,
  createRunId,
  getAppLoggerCore,
  createRunIdCore,
  buildEndpointMeta,
  attachEndpointMeta,
  createJsonHeaders,
  createBasicAuth,
  contextualTimeouts,
  getContextualTimeout,
  createTimeoutConfig,
  createDynamicTimeout,
  createHttpConfig,
  createSemaphore,
  retryWithBackoff,
  processBatch,
  groupBy,
  partition,
  unique,
  chunk,
  flatten,
  intersection,
  difference,
  sortBy,
  shuffle,
  take,
  takeWhile,
  skip,
  skipWhile,
  isPlainObject,
  pick,
  omit,
  deepMerge,
  deepClone,
  getNestedValue,
  setNestedValue,
  isEqual,
  mapKeys,
  mapValues,
  filterKeys,
  isEmpty,
  toQueryString,
  fromQueryString,
  memoize,
  throttle,
  debounce,
  timingSafeCompare,
  maskApiKey,
  extractApiKey,
  createRateLimitStore,
  buildRateLimitKey,
  createApiKeyValidator,
  createRateLimiter,
  msToCron,
  scheduleInterval,
  scheduleOnce,
  cleanupJobs,
  buildFeatureConfig,
  buildSecurityConfig,
  buildValidationConfig,
  buildTestRunnerConfig,
  createPerformanceMetrics,
  createProcessingCapabilities,
  execHelperWrapper,
  createExecHelper,
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
  createPaymentValidation,
  createUserValidation,
  createSubscriptionValidation,
  handleValidationErrors,
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
  SECURITY_CONFIG,
  detectSuspiciousPatterns,
  createIpTracker,
  createSecurityMiddleware,
  createSecurityRateLimiter,
  setSecurityHeaders,
  validateAndNormalizePath,
  validateBucketName,
  validateObjectName,
  createSafeObjectPath,
  sanitizeLogValue,
  sanitizeObject,
  sanitizeUrl,
  createSafeLoggingContext,
  isSensitiveField,
  maskString
};

/*
 * Main Module Entry Point - SRP Architecture
 * 
 * This file serves as the central export hub for all utility functions following
 * Single Responsibility Principle (SRP) where each function has its own file.
 * 
 * RATIONALE FOR SRP APPROACH:
 * 1. Single Responsibility: Each file contains exactly one function
 * 2. Maintainability: Changes to one function don't affect others
 * 3. Testability: Individual functions can be tested in complete isolation
 * 4. Code Organization: Clear function-to-file mapping improves navigation
 * 5. Tree Shaking: Bundlers can optimize imports at the function level
 * 
 * Architecture follows "one function per file" principle as specified in
 * AGENTS.md and .roo/rules/architecture.md for maximum modularity.
 */

// Import all utility functions from SRP-compliant individual function files
// Each require() statement imports a single function following Single Responsibility Principle
const logger = require('./lib/logger'); // winston logger

// DateTime utilities - individual functions
const formatDateTime = require('./lib/utilities/datetime/formatDateTime');
const formatDuration = require('./lib/utilities/datetime/formatDuration');
const addDays = require('./lib/utilities/datetime/addDays');
const formatDate = require('./lib/utilities/datetime/formatDate');
const formatDateWithPrefix = require('./lib/utilities/datetime/formatDateWithPrefix');
const createTimeProvider = require('./lib/utilities/datetime/createTimeProvider');
const formatDateTimeWithProvider = require('./lib/utilities/datetime/formatDateTimeWithProvider');
const formatDurationWithProvider = require('./lib/utilities/datetime/formatDurationWithProvider');
const formatRelativeTime = require('./lib/utilities/datetime/formatRelativeTime');

// URL utilities - individual functions
const ensureProtocol = require('./lib/utilities/url/ensureProtocol');
const ensureProtocolUrl = require('./lib/utilities/url/ensureProtocolUrl');
const normalizeUrlOrigin = require('./lib/utilities/url/normalizeUrlOrigin');
const stripProtocol = require('./lib/utilities/url/stripProtocol');
const parseUrlParts = require('./lib/utilities/url/parseUrlParts');

// ID generation utilities - individual functions
const generateExecutionId = require('./lib/utilities/id-generation/generateExecutionId');
const makeIdempotencyKey = require('./lib/utilities/id-generation/makeIdempotencyKey');
const makeIdempotencyKeyObj = require('./lib/utilities/id-generation/makeIdempotencyKeyObj');

// String sanitization utilities - individual functions
const sanitizeString = require('./lib/utilities/string/sanitizeString');

// Array utilities - individual functions
const dedupeByLowercaseFirst = require('./lib/utilities/array/dedupeByLowercaseFirst');

// File utilities - individual functions
const formatFileSize = require('./lib/utilities/file/formatFileSize');

// Performance monitoring utilities - safe timer handling
const safeDurationFromTimer = require('./lib/utilities/performance/safeDurationFromTimer');
const createSafeDurationExtractor = require('./lib/utilities/performance/createSafeDurationExtractor');

// Function utilities - ergonomic function wrapping
const createDualVersionFunction = require('./lib/utilities/function/createDualVersionFunction');

// Logger bridge utilities - unified logging with fallback
const getAppLogger = require('./lib/utilities/logger/getAppLogger');
const createRunId = require('./lib/utilities/logger/createRunId');
const getAppLoggerCore = require('./lib/utilities/logger/getAppLoggerCore');
const createRunIdCore = require('./lib/utilities/logger/createRunIdCore');

// API endpoint metadata utilities - documentation and introspection
const buildEndpointMeta = require('./lib/utilities/api/buildEndpointMeta');
const attachEndpointMeta = require('./lib/utilities/api/attachEndpointMeta');

// HTTP configuration utilities - headers, auth, contextual timeouts
const createJsonHeaders = require('./lib/utilities/http/createJsonHeaders');
const createBasicAuth = require('./lib/utilities/http/createBasicAuth');
const contextualTimeouts = require('./lib/utilities/http/contextualTimeouts');
const getContextualTimeout = require('./lib/utilities/http/getContextualTimeout');
const createTimeoutConfig = require('./lib/utilities/http/createTimeoutConfig');
const createDynamicTimeout = require('./lib/utilities/http/createDynamicTimeout');
const createHttpConfig = require('./lib/utilities/http/createHttpConfig');

// Batch processing utilities - high-performance data processing
const createSemaphore = require('./lib/utilities/batch/createSemaphore');
const retryWithBackoff = require('./lib/utilities/batch/retryWithBackoff');
const processBatch = require('./lib/utilities/batch/processBatch');

// Array collection utilities - functional array manipulation
const groupBy = require('./lib/utilities/collections/array/groupBy');
const partition = require('./lib/utilities/collections/array/partition');
const unique = require('./lib/utilities/collections/array/unique');
const chunk = require('./lib/utilities/collections/array/chunk');
const flatten = require('./lib/utilities/collections/array/flatten');
const intersection = require('./lib/utilities/collections/array/intersection');
const difference = require('./lib/utilities/collections/array/difference');
const sortBy = require('./lib/utilities/collections/array/sortBy');
const shuffle = require('./lib/utilities/collections/array/shuffle');
const take = require('./lib/utilities/collections/array/take');
const takeWhile = require('./lib/utilities/collections/array/takeWhile');
const skip = require('./lib/utilities/collections/array/skip');
const skipWhile = require('./lib/utilities/collections/array/skipWhile');

// Object collection utilities - functional object manipulation
const isPlainObject = require('./lib/utilities/collections/object/isPlainObject');
const pick = require('./lib/utilities/collections/object/pick');
const omit = require('./lib/utilities/collections/object/omit');
const deepMerge = require('./lib/utilities/collections/object/deepMerge');
const deepClone = require('./lib/utilities/collections/object/deepClone');
const getNestedValue = require('./lib/utilities/collections/object/getNestedValue');
const setNestedValue = require('./lib/utilities/collections/object/setNestedValue');
const isEqual = require('./lib/utilities/collections/object/isEqual');
const mapKeys = require('./lib/utilities/collections/object/mapKeys');
const mapValues = require('./lib/utilities/collections/object/mapValues');
const filterKeys = require('./lib/utilities/collections/object/filterKeys');
const isEmpty = require('./lib/utilities/collections/object/isEmpty');
const toQueryString = require('./lib/utilities/collections/object/toQueryString');
const fromQueryString = require('./lib/utilities/collections/object/fromQueryString');

// Performance utilities - function optimization
const memoize = require('./lib/utilities/performance/memoize');
const throttle = require('./lib/utilities/performance/throttle');
const debounce = require('./lib/utilities/performance/debounce');

// Security utilities - API key handling and rate limiting primitives
const timingSafeCompare = require('./lib/utilities/security/timingSafeCompare');
const maskApiKey = require('./lib/utilities/security/maskApiKey');
const extractApiKey = require('./lib/utilities/security/extractApiKey');
const createRateLimitStore = require('./lib/utilities/security/createRateLimitStore');
const buildRateLimitKey = require('./lib/utilities/security/buildRateLimitKey');

// Middleware factories - Express-compatible middleware
const createApiKeyValidator = require('./lib/utilities/middleware/createApiKeyValidator');
const createRateLimiter = require('./lib/utilities/middleware/createRateLimiter');

// Scheduling utilities - interval and job management
const msToCron = require('./lib/utilities/scheduling/msToCron');
const scheduleInterval = require('./lib/utilities/scheduling/scheduleInterval');
const scheduleOnce = require('./lib/utilities/scheduling/scheduleOnce');
const cleanupJobs = require('./lib/utilities/scheduling/cleanupJobs');

// Config builder utilities - standardized configuration objects
const buildFeatureConfig = require('./lib/utilities/config/buildFeatureConfig');
const buildSecurityConfig = require('./lib/utilities/config/buildSecurityConfig');
const buildValidationConfig = require('./lib/utilities/config/buildValidationConfig');
const buildTestRunnerConfig = require('./lib/utilities/config/buildTestRunnerConfig');
const createPerformanceMetrics = require('./lib/utilities/config/createPerformanceMetrics');
const createProcessingCapabilities = require('./lib/utilities/config/createProcessingCapabilities');

// Exec helper utilities - function wrapping with error handling
const execHelperWrapper = require('./lib/utilities/function/execHelperWrapper');
const createExecHelper = require('./lib/utilities/function/createExecHelper');

// Data structure utilities
const createMinHeap = require('./lib/utilities/data-structures/MinHeap');

// Password utilities - secure hashing and generation
const hashPassword = require('./lib/utilities/password/hashPassword');
const verifyPassword = require('./lib/utilities/password/verifyPassword');
const generateSecurePassword = require('./lib/utilities/password/generateSecurePassword');

// Secure config utilities - validation and credential protection
const maskSensitiveValue = require('./lib/utilities/secure-config/maskSensitiveValue');
const validateConfigValue = require('./lib/utilities/secure-config/validateConfigValue');
const buildSecureConfig = require('./lib/utilities/secure-config/buildSecureConfig');

// Module loader utilities - dynamic loading with CJS/ESM interop
const loadAndFlattenModule = require('./lib/utilities/module-loader/loadAndFlattenModule');
const createCachedLoader = require('./lib/utilities/module-loader/createCachedLoader');
const createSimpleLoader = require('./lib/utilities/module-loader/createSimpleLoader');
const createDirectLoader = require('./lib/utilities/module-loader/createDirectLoader');

// Performance monitoring utilities - real-time metrics and alerting
const collectPerformanceMetrics = require('./lib/utilities/performance-monitor/collectPerformanceMetrics');
const measureEventLoopLag = require('./lib/utilities/performance-monitor/measureEventLoopLag');
const analyzePerformanceMetrics = require('./lib/utilities/performance-monitor/analyzePerformanceMetrics');
const getPerformanceHealthStatus = require('./lib/utilities/performance-monitor/getPerformanceHealthStatus');
const createPerformanceMonitor = require('./lib/utilities/performance-monitor/createPerformanceMonitor');

// Input validation utilities - comprehensive validation and sanitization
const validateEmailFormat = require('./lib/utilities/validation/validateEmail');
const validatePasswordStrength = require('./lib/utilities/validation/validatePassword');
const validateMonetaryAmount = require('./lib/utilities/validation/validateAmount');
const validateApiKeyFormat = require('./lib/utilities/validation/validateApiKey');
const validateCurrencyCode = require('./lib/utilities/validation/validateCurrency');
const validatePaymentMethodNonce = require('./lib/utilities/validation/validatePaymentMethodNonce');
const validateDateRange = require('./lib/utilities/validation/validateDateRange');
const validateSubscriptionPlan = require('./lib/utilities/validation/validateSubscriptionPlan');
const sanitizeInput = require('./lib/utilities/validation/sanitizeInput');
const { createPaymentValidation, createUserValidation, createSubscriptionValidation, handleValidationErrors } = require('./lib/utilities/validation/createValidationMiddleware');
const extractValidationErrors = require('./lib/utilities/validation/extractValidationErrors');
const validateEnum = require('./lib/utilities/validation/validateEnum');
const validateNumberRange = require('./lib/utilities/validation/validateNumberRange');
const validateStringLength = require('./lib/utilities/validation/validateStringLength');
const validateArray = require('./lib/utilities/validation/validateArray');
const validatePattern = require('./lib/utilities/validation/validatePattern');
const validateBoolean = require('./lib/utilities/validation/validateBoolean');
const validateDate = require('./lib/utilities/validation/validateDate');
const validateObjectId = require('./lib/utilities/validation/validateObjectId');
const validatePagination = require('./lib/utilities/validation/validatePagination');
const createValidator = require('./lib/utilities/validation/createValidator');
const createResourceValidator = require('./lib/utilities/validation/createResourceValidator');
const createValidationErrorHandler = require('./lib/utilities/validation/createValidationErrorHandler');
const validateRequiredString = require('./lib/utilities/validation/validateRequiredString');
const validateNumberInRange = require('./lib/utilities/validation/validateNumberInRange');
const validateBooleanField = require('./lib/utilities/validation/validateBooleanField');
const handleValidationFailure = require('./lib/utilities/validation/handleValidationFailure');

// Zod validation framework utilities
const zodStringValidators = require('./lib/utilities/validation/zodStringValidators');
const zodNumberValidators = require('./lib/utilities/validation/zodNumberValidators');
const zodValidationUtils = require('./lib/utilities/validation/zodValidationUtils');
const zodSchemaBuilders = require('./lib/utilities/validation/zodSchemaBuilders');
const createApiKeyAuth = require('./lib/utilities/validation/createApiKeyAuth');
const createCredentialSchema = require('./lib/utilities/validation/createCredentialSchema');
const createServiceMeta = require('./lib/utilities/validation/createServiceMeta');

// Security middleware utilities - rate limiting, monitoring, and protection
const SECURITY_CONFIG = require('./lib/utilities/security/securityConfig');
const detectSuspiciousPatterns = require('./lib/utilities/security/detectSuspiciousPatterns');
const createIpTracker = require('./lib/utilities/security/createIpTracker');
const createSecurityMiddleware = require('./lib/utilities/security/createSecurityMiddleware');
const createSecurityRateLimiter = require('./lib/utilities/security/createSecurityRateLimiter');
const setSecurityHeaders = require('./lib/utilities/security/setSecurityHeaders');
const validateAndNormalizePath = require('./lib/utilities/security/validateAndNormalizePath');
const validateBucketName = require('./lib/utilities/security/validateBucketName');
const validateObjectName = require('./lib/utilities/security/validateObjectName');
const createSafeObjectPath = require('./lib/utilities/security/createSafeObjectPath');
const sanitizeLogValue = require('./lib/utilities/security/sanitizeLogValue');
const sanitizeObject = require('./lib/utilities/security/sanitizeObject');
const sanitizeUrl = require('./lib/utilities/security/sanitizeUrl');
const createSafeLoggingContext = require('./lib/utilities/security/createSafeLoggingContext');
const isSensitiveField = require('./lib/utilities/security/isSensitiveField');
const maskString = require('./lib/utilities/security/maskString');

/*
 * Export Strategy Explanation:
 *
 * All utilities are re-exported from this file to provide a single entry point
 * for the SRP-structured functions. Each function is imported from its individual
 * file and exported here for convenient access.
 *
 * This approach allows bundlers to tree shake unused functions at the individual
 * function level while maintaining a clean API surface. The SRP structure makes
 * it easy for developers to understand exactly what each function does.
 *
 * ES module compatibility is maintained through the default export strategy.
 */

// Export all functions from SRP structure
// Each function is imported from its individual file following SRP principles
module.exports = {
  // DateTime utilities - handle date formatting, duration calculations, and date arithmetic
  formatDateTime,
  formatDuration,
  addDays,
  formatDate,
  formatDateWithPrefix,
  createTimeProvider,
  formatDateTimeWithProvider,
  formatDurationWithProvider,
  formatRelativeTime,

  // URL utilities - handle protocol normalization and URL parsing
  ensureProtocol,
  ensureProtocolUrl,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts,

  // ID generation utilities - secure identifier creation for tracking and data integrity
  generateExecutionId,
  makeIdempotencyKey,
  makeIdempotencyKeyObj,

  // String sanitization utilities - security-focused content filtering
  sanitizeString,

  // Array utilities - collection manipulation and deduplication
  dedupeByLowercaseFirst,

  // File utilities - file system helper functions
  formatFileSize,

  // Performance monitoring utilities - safe timer handling
  safeDurationFromTimer,
  createSafeDurationExtractor,

  // Function utilities - ergonomic function wrapping
  createDualVersionFunction,

  // Logger bridge utilities - unified logging with fallback
  getAppLogger,
  createRunId,
  getAppLoggerCore,
  createRunIdCore,

  // API endpoint metadata utilities - documentation and introspection
  buildEndpointMeta,
  attachEndpointMeta,

  // HTTP configuration utilities - headers, auth, contextual timeouts
  createJsonHeaders,
  createBasicAuth,
  contextualTimeouts,
  getContextualTimeout,
  createTimeoutConfig,
  createDynamicTimeout,
  createHttpConfig,

  // Batch processing utilities - high-performance data processing
  createSemaphore,
  retryWithBackoff,
  processBatch,

  // Array collection utilities - functional array manipulation
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

  // Object collection utilities - functional object manipulation
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

  // Performance utilities - function optimization
  memoize,
  throttle,
  debounce,

  // Security utilities - API key handling and rate limiting primitives
  timingSafeCompare,
  maskApiKey,
  extractApiKey,
  createRateLimitStore,
  buildRateLimitKey,

  // Middleware factories - Express-compatible middleware
  createApiKeyValidator,
  createRateLimiter,

  // Scheduling utilities - interval and job management
  msToCron,
  scheduleInterval,
  scheduleOnce,
  cleanupJobs,

  // Config builder utilities - standardized configuration objects
  buildFeatureConfig,
  buildSecurityConfig,
  buildValidationConfig,
  buildTestRunnerConfig,
  createPerformanceMetrics,
  createProcessingCapabilities,

  // Exec helper utilities - function wrapping with error handling
  execHelperWrapper,
  createExecHelper,

  // Data structure utilities
  createMinHeap,

  // Password utilities - secure hashing and generation
  hashPassword,
  verifyPassword,
  generateSecurePassword,

  // Secure config utilities - validation and credential protection
  maskSensitiveValue,
  validateConfigValue,
  buildSecureConfig,

  // Module loader utilities - dynamic loading with CJS/ESM interop
  loadAndFlattenModule,
  createCachedLoader,
  createSimpleLoader,
  createDirectLoader,

  // Performance monitoring utilities - real-time metrics and alerting
  collectPerformanceMetrics,
  measureEventLoopLag,
  analyzePerformanceMetrics,
  getPerformanceHealthStatus,
  createPerformanceMonitor,

  // Input validation utilities - comprehensive validation and sanitization
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
  validateBooleanField,
  handleValidationFailure,

  // Zod validation framework utilities
  zodStringValidators,
  zodNumberValidators,
  zodValidationUtils,
  zodSchemaBuilders,
  createApiKeyAuth,
  createCredentialSchema,
  createServiceMeta,

  // Security middleware utilities - rate limiting and monitoring
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
  maskString,

  // Logger - centralized logging infrastructure
  logger
};

/*
 * ES Module Compatibility:
 * 
 * Some bundlers and newer Node.js versions expect a 'default' export property
 * for ES module interoperability. Setting module.exports.default = module.exports
 * allows this module to work with both:
 * - const utils = require('./index.js') (CommonJS)
 * - import utils from './index.js' (ES modules)
 * 
 * This ensures maximum compatibility across different JavaScript environments.
 */

// Mirror exports under 'default' to support import statements
module.exports.default = module.exports;

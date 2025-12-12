
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





// Validation utilities - individual functions
const requireFields = require('./lib/validation/requireFields');

// Authentication utilities - individual functions
const checkPassportAuth = require('./lib/security/auth/checkPassportAuth');
const hasGithubStrategy = require('./lib/security/auth/hasGithubStrategy');

// URL utilities - individual functions
const ensureProtocol = require('./lib/utilities/url/ensureProtocol');
const ensureProtocolUrl = require('./lib/utilities/url/ensureProtocolUrl');
const normalizeUrlOrigin = require('./lib/utilities/url/normalizeUrlOrigin');
const stripProtocol = require('./lib/utilities/url/stripProtocol');
const parseUrlParts = require('./lib/utilities/url/parseUrlParts');



// Environment utilities - individual functions
const requireEnvVars = require('./lib/system/env/requireEnvVars');
const hasEnvVar = require('./lib/system/env/hasEnvVar');
const getEnvVar = require('./lib/system/env/getEnvVar');



// Real-time communication utilities - individual functions
const createBroadcastRegistry = require('./lib/system/realtime/createBroadcastRegistry');

// ID generation utilities - individual functions
const generateExecutionId = require('./lib/utilities/id-generation/generateExecutionId');
const makeIdempotencyKey = require('./lib/utilities/id-generation/makeIdempotencyKey');
const makeIdempotencyKeyObj = require('./lib/utilities/id-generation/makeIdempotencyKeyObj');

// String sanitization utilities - individual functions
const sanitizeString = require('./lib/utilities/string/sanitizeString');

// Array utilities - individual functions
const dedupeByLowercaseFirst = require('./lib/utilities/array/dedupeByLowercaseFirst');

// Advanced security utilities - individual functions following SRP
const sanitizeHtml = require('./lib/security/sanitizeHtml');
const escapeHtml = require('./lib/security/escapeHtml');
const sanitizeSqlInput = require('./lib/security/sanitizeSqlInput'); 
const validateInputRate = require('./lib/security/validateInputRate');
const sanitizeObjectRecursively = require('./lib/security/sanitizeObjectRecursively');
const validateUserInput = require('./lib/security/validateUserInput');

// GitHub validation utilities - individual functions
const validateGitHubUrl = require('./lib/validation/validateGitHubUrl');

// Advanced validation utilities - individual functions
const validateEmail = require('./lib/validation/validateEmail');
const validateRequired = require('./lib/validation/validateRequired');

// File utilities - individual functions
const formatFileSize = require('./lib/utilities/file/formatFileSize');

// Performance monitoring utilities - safe timer handling
const safeDurationFromTimer = require('./lib/utilities/performance/safeDurationFromTimer');
const createSafeDurationExtractor = require('./lib/utilities/performance/createSafeDurationExtractor');

// Function utilities - ergonomic function wrapping
const createDualVersionFunction = require('./lib/utilities/function/createDualVersionFunction');

// Worker pool utilities - individual functions
const createWorkerPool = require('./lib/system/worker-pool/createWorkerPool');

// Shutdown utilities - individual functions
const createShutdownManager = require('./lib/system/shutdown/createShutdownManager');
const gracefulShutdown = require('./lib/system/shutdown/gracefulShutdown');

// Retry policy utilities - resilient operation handling
const defaultChargeRetryPlan = require('./lib/system/retry/defaultChargeRetryPlan');
const defaultChargeRetryPlanObj = require('./lib/system/retry/defaultChargeRetryPlanObj');

// Logger bridge utilities - unified logging with fallback
const getAppLogger = require('./lib/utilities/logger/getAppLogger');
const createRunId = require('./lib/utilities/logger/createRunId');
const getAppLoggerCore = require('./lib/utilities/logger/getAppLoggerCore');
const createRunIdCore = require('./lib/utilities/logger/createRunIdCore');

// Qerrors integration utilities - error handling with fallback
const qerrorsCommon = require('./lib/system/qerrors/qerrorsCommon');
const executeWithQerrorsCore = require('./lib/system/qerrors/executeWithQerrorsCore');

// Task scheduler utilities - centralized timer management
const TaskScheduler = require('./lib/system/scheduler/TaskScheduler');
const getScheduler = require('./lib/system/scheduler/getScheduler');

// API endpoint metadata utilities - documentation and introspection
const buildEndpointMeta = require('./lib/utilities/api/buildEndpointMeta');
const attachEndpointMeta = require('./lib/utilities/api/attachEndpointMeta');

// Audit logging utilities - compliance and security monitoring
const auditLogger = require('./lib/system/audit/auditLogger');

// Input validation utilities - individual functions
const isValidObject = require('./lib/validation/isValidObject');
const isValidString = require('./lib/validation/isValidString');
const isValidDate = require('./lib/validation/isValidDate');
const hasMethod = require('./lib/validation/hasMethod');

// Throwing validation utilities - fail-fast validation with custom error messages
const validateInputObject = require('./lib/validation/validateInputObject');
const validateInputString = require('./lib/validation/validateInputString');
const validateRequiredFields = require('./lib/validation/validateRequiredFields');
const validateApiKey = require('./lib/validation/validateApiKey');

// Non-throwing validation utilities - structured result objects for API responses
const validateInputObjectObj = require('./lib/validation/validateInputObjectObj');
const validateInputStringObj = require('./lib/validation/validateInputStringObj');
const validateRequiredFieldsObj = require('./lib/validation/validateRequiredFieldsObj');
const validateAndTrimString = require('./lib/validation/validateAndTrimString');

// Number validation utilities - type-safe parsing and amount validation
const parsePositiveNumber = require('./lib/validation/parsePositiveNumber');
const validatePositiveAmount = require('./lib/validation/validatePositiveAmount');

// URL security utilities - SSRF prevention with domain allowlisting
const isAllowedExternalUrl = require('./lib/security/url/isAllowedExternalUrl');
const validateExternalUrl = require('./lib/security/url/validateExternalUrl');
const buildSafeExternalUrl = require('./lib/security/url/buildSafeExternalUrl');

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
  formatDateTime, // convert a Date to a locale string for UIs
  formatDuration, // return human readable elapsed time
  addDays, // calculate future dates for business logic and expiration handling
  formatDate, // format date with locale support and fallback handling
  formatDateWithPrefix, // format date with contextual prefix (e.g., "Added 12/25/2023")
  createTimeProvider, // injectable time provider for deterministic testing
  formatDateTimeWithProvider, // locale formatting with custom options
  formatDurationWithProvider, // duration with injectable time provider
  formatRelativeTime, // user-friendly relative time (e.g., "5 minutes ago")
  


  // URL utilities - handle protocol normalization and URL parsing
  ensureProtocol, // prefix http/https when missing
  ensureProtocolUrl, // object-based version with allowEmpty option
  normalizeUrlOrigin, // normalize origin for comparisons
  stripProtocol, // remove http/https scheme from URL
  parseUrlParts, // split URL into host and path
  
  // Validation utilities - field presence and format checking
  requireFields, // confirm required request fields exist
  
  // Authentication utilities - Passport.js integration helpers
  checkPassportAuth, // verify request authenticated via Passport
  hasGithubStrategy, // detect configured GitHub strategy
  

  
  // Environment utilities - configuration validation and access
  requireEnvVars, // validate presence of required environment variables
  hasEnvVar, // check if single environment variable exists
  getEnvVar, // get environment variable value with optional default
  

  
  // Real-time communication utilities - socket.io broadcast registries and validation
  createBroadcastRegistry, // factory to create custom broadcast function registries
  
  // ID generation utilities - secure identifier creation for tracking and data integrity
  generateExecutionId, // create unique identifiers for request tracking and logging
  makeIdempotencyKey, // create deterministic keys from parts for deduplication
  makeIdempotencyKeyObj, // object-based version returning {key: string}
  
  // String sanitization utilities - security-focused content filtering
  sanitizeString, // remove dangerous characters from user input
  
  // Array utilities - collection manipulation and deduplication
  dedupeByLowercaseFirst, // deduplicate array by lowercase key preserving first occurrence
  
  // Advanced security utilities - comprehensive input protection
  sanitizeHtml, // strip XSS vulnerabilities from HTML content
  escapeHtml, // encode dangerous chars to HTML entities (preserves content)
  sanitizeSqlInput, // prevent SQL injection in database queries
  validateInputRate, // rate limiting for DoS prevention
  sanitizeObjectRecursively, // recursively sanitize nested objects and arrays
  validateUserInput, // advanced input validation with size constraints
  
  // GitHub validation utilities - repository URL format checking
  validateGitHubUrl, // validate GitHub repository URLs
  
  // Advanced validation utilities - comprehensive field validation
  validateEmail, // check email format with security considerations
  validateRequired, // ensure required fields are present and valid
  
  // File utilities - file system helper functions
  formatFileSize, // convert bytes to human-readable format
  
  // Performance monitoring utilities - safe timer handling
  safeDurationFromTimer, // safely extract duration from timer objects
  createSafeDurationExtractor, // factory for bound duration extraction functions
  
  // Function utilities - ergonomic function wrapping
  createDualVersionFunction, // wrap functions to accept both spread args and object input
  
  // Worker pool utilities - CPU-intensive task management
  createWorkerPool, // manage worker threads for parallel processing
  
  // Shutdown utilities - graceful application termination
  createShutdownManager, // coordinate clean shutdown processes
  gracefulShutdown, // handle process termination signals
  
  // Retry policy utilities - resilient operation handling
  defaultChargeRetryPlan, // create progressive retry plan for charge operations
  defaultChargeRetryPlanObj, // object-based version returning {plan: RetryPlan[]}
  
  // Logger bridge utilities - unified logging with fallback
  getAppLogger, // get logger with fallback to console methods
  createRunId, // generate structured execution identifier for log correlation
  getAppLoggerCore, // core logger resolver with bound console fallback
  createRunIdCore, // core run ID with secure random fallback
  
  // Qerrors integration utilities - error handling with fallback
  qerrorsCommon, // shared qerrors helpers (loadQerrors, formatErrorMessage, logErrorMaybe)
  executeWithQerrorsCore, // wrap async operations with qerrors supervision
  
  // Task scheduler utilities - centralized timer management
  TaskScheduler, // singleton class for consolidated task scheduling
  getScheduler, // get shared scheduler instance
  
  // API endpoint metadata utilities - documentation and introspection
  buildEndpointMeta, // construct endpoint metadata object
  attachEndpointMeta, // attach metadata to handler functions
  
  // Audit logging utilities - compliance and security monitoring
  auditLogger, // structured audit logging with sensitive data sanitization
  
  // Input validation utilities - type and format checking
  isValidObject, // verify object structure and properties
  isValidString, // check string validity with security considerations
  isValidDate, // validate Date object integrity
  hasMethod, // check if object has specific method
  
  // Throwing validation utilities - fail-fast validation with custom error messages
  validateInputObject, // throw if not a valid plain object
  validateInputString, // throw if not a valid non-empty string
  validateRequiredFields, // throw if required fields are missing (framework-agnostic)
  validateApiKey, // throw if API key is missing or empty (service-specific)
  
  // Non-throwing validation utilities - structured result objects for batch/API processing
  validateInputObjectObj, // returns {isValid: boolean}
  validateInputStringObj, // returns {isValid: boolean}
  validateRequiredFieldsObj, // returns {isValid: boolean, missingFields: string[]}
  validateAndTrimString, // silent trim returning empty string for invalid input
  
  // Number validation utilities - type-safe parsing and amount validation
  parsePositiveNumber, // parse unknown input to positive number with result object
  validatePositiveAmount, // payment amount validation with Express 400 response
  
  // URL security utilities - SSRF prevention with domain allowlisting
  isAllowedExternalUrl, // check if URL domain is in allowlist
  validateExternalUrl, // throw if URL domain not allowed
  buildSafeExternalUrl, // build URL with validation and path normalization
  
  // HTTP configuration utilities - headers, auth, contextual timeouts
  createJsonHeaders, // create JSON Content-Type headers with optional extras
  createBasicAuth, // create basic auth object for HTTP clients
  contextualTimeouts, // operation-aware timeout configurations
  getContextualTimeout, // get timeout for operation type
  createTimeoutConfig, // build timeout config with multiplier support
  createDynamicTimeout, // scale timeout based on payload size
  createHttpConfig, // complete axios-compatible HTTP configuration
  
  // Batch processing utilities - high-performance data processing
  createSemaphore, // concurrency control with permit-based limiting
  retryWithBackoff, // retry async operations with exponential backoff
  processBatch, // process arrays with concurrency, retries, progress tracking
  
  // Array collection utilities - functional array manipulation
  groupBy, // group array elements by key function
  partition, // split array into passing/failing groups
  unique, // deduplicate with optional key function
  chunk, // split array into fixed-size chunks
  flatten, // flatten nested arrays recursively
  intersection, // find common elements across arrays
  difference, // find elements in first array not in others
  sortBy, // multi-criteria sorting
  shuffle, // Fisher-Yates random shuffle
  take, // take first n elements
  takeWhile, // take while predicate true
  skip, // skip first n elements
  skipWhile, // skip while predicate true
  
  // Object collection utilities - functional object manipulation
  isPlainObject, // check if value is plain object (not array/Date/etc)
  pick, // extract specified keys from object
  omit, // exclude specified keys from object
  deepMerge, // recursively merge objects
  deepClone, // create independent copy of nested structure
  getNestedValue, // safely access nested property with default
  setNestedValue, // set nested property creating intermediates
  isEqual, // deep equality comparison
  mapKeys, // transform object keys
  mapValues, // transform object values
  filterKeys, // filter object by key/value predicate
  isEmpty, // check if null/empty array/empty object
  toQueryString, // convert object to URL query string
  fromQueryString, // parse query string to object
  
  // Performance utilities - function optimization
  memoize, // cache function results with optional LRU
  throttle, // limit function calls to once per interval
  debounce, // delay execution until activity stops
  
  // Security utilities - API key handling and rate limiting primitives
  timingSafeCompare, // constant-time string comparison for timing attack prevention
  maskApiKey, // mask API key for safe logging
  extractApiKey, // extract API key from request headers/query/body
  createRateLimitStore, // in-memory rate limit store with cleanup
  buildRateLimitKey, // generate rate limit keys from request (IP/user/apiKey)
  
  // Middleware factories - Express-compatible middleware
  createApiKeyValidator, // API key validation middleware with timing attack prevention
  createRateLimiter, // rate limiting middleware with configurable strategies
  
  // Scheduling utilities - interval and job management
  msToCron, // convert milliseconds to cron expression
  scheduleInterval, // schedule recurring jobs with tracking
  scheduleOnce, // schedule one-time jobs
  cleanupJobs, // bulk cleanup of scheduled jobs
  
  // Config builder utilities - standardized configuration objects
  buildFeatureConfig, // build feature flag configuration
  buildSecurityConfig, // build comprehensive security configuration
  buildValidationConfig, // build validation configuration
  buildTestRunnerConfig, // build test runner configuration
  createPerformanceMetrics, // create performance metrics configuration
  createProcessingCapabilities, // create processing capabilities configuration
  
  // Exec helper utilities - function wrapping with error handling
  execHelperWrapper, // wrap functions with error handling and logging
  createExecHelper, // factory for exec helper instances
  
  // Data structure utilities
  createMinHeap, // O(log n) min-heap for priority queues
  
  // Password utilities - secure hashing and generation
  hashPassword, // bcrypt hashing with 12 salt rounds
  verifyPassword, // constant-time password comparison
  generateSecurePassword, // cryptographically secure password generation
  
  // Secure config utilities - validation and credential protection
  maskSensitiveValue, // mask credentials for safe logging
  validateConfigValue, // validate config values against schema
  buildSecureConfig, // build validated config using convict
  
  // Module loader utilities - dynamic loading with CJS/ESM interop
  loadAndFlattenModule, // dynamic import with CJS/ESM normalization
  createCachedLoader, // factory for cached async module loaders
  createSimpleLoader, // factory for non-cached loaders
  createDirectLoader, // factory for direct loaders without flattening
  
  // Performance monitoring utilities - real-time metrics and alerting
  collectPerformanceMetrics, // collect CPU, memory, heap metrics from process
  measureEventLoopLag, // async measurement of event loop blocking
  analyzePerformanceMetrics, // analyze metrics against thresholds
  getPerformanceHealthStatus, // compute overall health status with recommendations
  createPerformanceMonitor, // factory for complete monitoring system
  
  // Input validation utilities - comprehensive validation and sanitization
  validateEmailFormat, // RFC 5322 email validation (from @scrooge)
  validatePasswordStrength, // password strength validation with complexity requirements
  validateMonetaryAmount, // monetary amount validation with business rules
  validateApiKeyFormat, // API key format validation
  validateCurrencyCode, // ISO 4217 currency code validation
  validatePaymentMethodNonce, // Braintree payment nonce validation
  validateDateRange, // date range validation using date-fns
  validateSubscriptionPlan, // subscription plan validation
  sanitizeInput, // XSS prevention with sanitize-html
  createPaymentValidation, // Express middleware for payment validation
  createUserValidation, // Express middleware for user validation
  createSubscriptionValidation, // Express middleware for subscription validation
  handleValidationErrors, // Express middleware error handler
  extractValidationErrors, // extract errors from express-validator result
  validateEnum, // check value is in allowed list
  validateNumberRange, // check number is within bounds
  validateStringLength, // check string length bounds
  validateArray, // check array length bounds
  validatePattern, // check value matches regex pattern
  validateBoolean, // check value is boolean
  validateDate, // check value is valid date
  validateObjectId, // check MongoDB ObjectId format
  validatePagination, // validate page/limit params
  createValidator, // compose multiple validators
  createResourceValidator, // CRUD validators factory
  createValidationErrorHandler, // factory for controller validation handlers
  validateRequiredString, // validate required string field in req.body
  validateNumberInRange, // validate number with min/max in req.body
  validateBooleanField, // validate boolean field in req.body
  handleValidationFailure, // send standardized validation error response
  
  // Zod validation framework utilities
  zodStringValidators, // Zod string validators (nonEmpty, email, apiKey, url)
  zodNumberValidators, // Zod number validators (positiveInt, range, temperature)
  zodValidationUtils, // validation utilities (validateString, validateEmail, etc)
  zodSchemaBuilders, // schema builders (dataWithStrings, credentials, pagination)
  createApiKeyAuth, // create HTTP basic auth from API key
  createCredentialSchema, // create Zod credential schema for services
  createServiceMeta, // create service meta object for API docs
  
  // Security middleware utilities - rate limiting and monitoring
  SECURITY_CONFIG, // security configuration constants
  detectSuspiciousPatterns, // detect XSS, SQL injection, path traversal
  createIpTracker, // IP tracking with memory management
  createSecurityMiddleware, // security monitoring middleware factory
  createSecurityRateLimiter, // security rate limiter with blocking
  setSecurityHeaders, // security headers middleware factory
  
  // Logger - centralized logging infrastructure
  logger // winston-based logging with rotation and levels
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

// Mirror exports under 'default' to support import statements  // clarify ESM usage
module.exports.default = module.exports; // provide default export for import syntax

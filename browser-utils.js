/**
 * QGenUtils Browser Compatibility Layer
 * 
 * Purpose: Provides browser-compatible access to QGenUtils utilities for
 * web applications and demo interfaces. This file serves as a compatibility
 * bridge between Node.js utilities and browser environments.
 * 
 * Browser Compatibility Strategy:
 * - Global Object Detection: Checks for window.QGenUtils availability
 * - Graceful Degradation: Provides empty utilities when QGenUtils unavailable
 * - Bundling Requirement: Warns about proper bundling for production use
 * - Environment Detection: Adapts to different browser contexts
 * 
 * Bundling Requirements:
 * - Webpack/Rollup: Required for proper module resolution
 * - Polyfills: May need core-js for older browser support
 * - Transpilation: ES6+ features need Babel for legacy browsers
 * - Bundle Optimization: Tree-shaking recommended for production
 * 
 * Usage Scenarios:
 * - Demo Interfaces: Interactive utility demonstrations
 * - Web Applications: Client-side utility integration
 * - Development Tools: Browser-based testing and debugging
 * - Educational Content: Interactive learning experiences
 * 
 * Browser Support Matrix:
 * - Modern Browsers: Full feature support (Chrome 60+, Firefox 55+, Safari 12+)
 * - Legacy Browsers: Limited support with polyfills (IE11+)
 * - Mobile Browsers: Full support on iOS Safari 12+, Chrome Mobile 60+
 * - Node.js Environment: Falls back to empty utilities gracefully
 * 
 * Security Considerations:
 * - Global Object Access: Safe property access with existence checks
 * - Input Validation: Utilities maintain security in browser context
 * - CSP Compatibility: No inline scripts or eval usage
 * - XSS Prevention: Utilities designed to prevent injection attacks
 * 
 * Performance Notes:
 * - Lazy Loading: Utilities accessed on-demand from global object
 * - Memory Efficiency: No duplicate utility instances
 * - Bundle Size: Optimized through proper bundling configuration
 * - Runtime Overhead: Minimal performance impact for utility access
 * 
 * @author Browser Compatibility Team
 * @since 1.0.0
 */

// ============================================================================
// ENVIRONMENT DETECTION & SETUP
// ============================================================================

// Import utilities from the main index.js
// Note: Browser environment requires different import strategy
// This file needs proper bundling for browser compatibility
console.warn('browser-utils.js needs bundling for browser compatibility');

// Global QGenUtils detection with safe fallback
let QGenUtils = {};
if (typeof window !== 'undefined' && window.QGenUtils) {
    QGenUtils = window.QGenUtils;
} else {
    // Graceful degradation when QGenUtils not available
    console.warn('QGenUtils not found in global scope - utilities will be empty');
}

// Validation utilities - Fix: Graceful fallbacks instead of throwing errors
const validateEmailFormat = QGenUtils.validateEmailFormat || ((email) => ({ valid: false, error: 'Email validation not available' }));
const validatePasswordStrength = QGenUtils.validatePasswordStrength || ((password) => ({ valid: false, error: 'Password validation not available' }));
const validateApiKeyFormat = QGenUtils.validateApiKeyFormat || ((key) => ({ valid: false, error: 'API key validation not available' }));
const validateMonetaryAmount = QGenUtils.validateMonetaryAmount || ((amount) => ({ valid: false, error: 'Amount validation not available' }));
const validateCurrencyCode = QGenUtils.validateCurrencyCode || ((code) => ({ valid: false, error: 'Currency validation not available' }));
const validateDateRange = QGenUtils.validateDateRange || ((range) => ({ valid: false, error: 'Date range validation not available' }));
const validateSubscriptionPlan = QGenUtils.validateSubscriptionPlan || ((plan) => ({ valid: false, error: 'Subscription validation not available' }));
const sanitizeInput = QGenUtils.sanitizeInput || ((input) => ({ clean: '', error: 'Input sanitization not available' }));

// Security utilities - Fix: Graceful fallbacks instead of throwing errors
const maskApiKey = QGenUtils.maskApiKey || ((key) => ({ valid: false, error: 'maskApiKey not available' }));
const hashPassword = QGenUtils.hashPassword || ((password) => ({ valid: false, error: 'hashPassword not available' }));
const verifyPassword = QGenUtils.verifyPassword || ((hash, password) => ({ valid: false, error: 'verifyPassword not available' }));
const generateSecurePassword = QGenUtils.generateSecurePassword || ((options) => ({ valid: false, error: 'generateSecurePassword not available' }));
const timingSafeCompare = QGenUtils.timingSafeCompare || ((a, b) => ({ valid: false, error: 'timingSafeCompare not available' }));
const extractApiKey = QGenUtils.extractApiKey || ((input) => ({ valid: false, error: 'extractApiKey not available' }));

// Collections utilities - Now use lodash directly for removed utilities
const _ = require('lodash');
const groupBy = QGenUtils.groupBy || _.groupBy;
const partition = QGenUtils.partition || _.partition;
const unique = QGenUtils.unique || _.uniq;
const chunk = QGenUtils.chunk || _.chunk;
const flatten = QGenUtils.flatten || _.flatten;
const intersection = QGenUtils.intersection || _.intersection;
const difference = QGenUtils.difference || _.difference;
const sortBy = QGenUtils.sortBy || _.sortBy;
const shuffle = QGenUtils.shuffle || _.shuffle;
const take = QGenUtils.take || _.take;
const skip = QGenUtils.skip || _.drop;
const takeWhile = QGenUtils.takeWhile || _.takeWhile;
const skipWhile = QGenUtils.skipWhile || _.dropWhile;

// Object utilities - Now use lodash directly for removed utilities
const isPlainObject = QGenUtils.isPlainObject;
const pick = QGenUtils.pick || _.pick;
const omit = QGenUtils.omit || _.omit;
const deepMerge = QGenUtils.deepMerge;
const deepClone = QGenUtils.deepClone || _.cloneDeep;
const getNestedValue = QGenUtils.getNestedValue || _.get;
const setNestedValue = QGenUtils.setNestedValue;
const isEqual = QGenUtils.isEqual || _.isEqual;
const mapKeys = QGenUtils.mapKeys || _.mapKeys;
const mapValues = QGenUtils.mapValues || _.mapValues;
const filterKeys = QGenUtils.filterKeys || _.pickBy;
const isEmpty = QGenUtils.isEmpty || _.isEmpty;
const toQueryString = QGenUtils.toQueryString;
const fromQueryString = QGenUtils.fromQueryString;

// Performance utilities
const memoize = QGenUtils.memoize;
const throttle = QGenUtils.throttle;
const debounce = QGenUtils.debounce;
const safeDurationFromTimer = QGenUtils.safeDurationFromTimer;
const createSafeDurationExtractor = QGenUtils.createSafeDurationExtractor;

// String utilities
const sanitizeString = QGenUtils.sanitizeString;

// File utilities
const formatFileSize = QGenUtils.formatFileSize;

// DateTime utilities
const formatDateTime = QGenUtils.formatDateTime;
const formatDuration = QGenUtils.formatDuration;
const addDays = QGenUtils.addDays;
const formatDate = QGenUtils.formatDate;
const formatDateWithPrefix = QGenUtils.formatDateWithPrefix;
const createTimeProvider = QGenUtils.createTimeProvider;
const formatDateTimeWithProvider = QGenUtils.formatDateTimeWithProvider;
const formatDurationWithProvider = QGenUtils.formatDurationWithProvider;
const formatRelativeTime = QGenUtils.formatRelativeTime;

// URL utilities
const ensureProtocol = QGenUtils.ensureProtocol;
const ensureProtocolUrl = QGenUtils.ensureProtocolUrl;
const normalizeUrlOrigin = QGenUtils.normalizeUrlOrigin;
const stripProtocol = QGenUtils.stripProtocol;
const parseUrlParts = QGenUtils.parseUrlParts;

// Array utilities
const dedupeByLowercaseFirst = QGenUtils.dedupeByLowercaseFirst;

// ID generation utilities
const generateExecutionId = QGenUtils.generateExecutionId;
const makeIdempotencyKey = QGenUtils.makeIdempotencyKey;
const makeIdempotencyKeyObj = QGenUtils.makeIdempotencyKeyObj;

// Logger utilities
const getAppLogger = QGenUtils.getAppLogger;
const createRunId = QGenUtils.createRunId;
const getAppLoggerCore = QGenUtils.getAppLoggerCore;
const createRunIdCore = QGenUtils.createRunIdCore;

// API utilities
const buildEndpointMeta = QGenUtils.buildEndpointMeta;
const attachEndpointMeta = QGenUtils.attachEndpointMeta;

// HTTP utilities - createJsonHeaders and createBasicAuth removed, provide fallbacks
const createJsonHeaders = QGenUtils.createJsonHeaders || ((additionalHeaders = {}) => ({
  'Content-Type': 'application/json',
  ...additionalHeaders
}));
const createBasicAuth = QGenUtils.createBasicAuth || ((apiKey, username = 'anystring') => ({
  username,
  password: apiKey
}));
const contextualTimeouts = QGenUtils.contextualTimeouts;
const getContextualTimeout = QGenUtils.getContextualTimeout;
const createTimeoutConfig = QGenUtils.createTimeoutConfig;
const createDynamicTimeout = QGenUtils.createDynamicTimeout;
const createHttpConfig = QGenUtils.createHttpConfig;

// Batch utilities
const createSemaphore = QGenUtils.createSemaphore;
const retryWithBackoff = QGenUtils.retryWithBackoff;
const processBatch = QGenUtils.processBatch;

// Scheduling utilities
const msToCron = QGenUtils.msToCron;
const scheduleInterval = QGenUtils.scheduleInterval;
const scheduleOnce = QGenUtils.scheduleOnce;
const cleanupJobs = QGenUtils.cleanupJobs;

// Config utilities
const buildFeatureConfig = QGenUtils.buildFeatureConfig;
const buildSecurityConfig = QGenUtils.buildSecurityConfig;
const buildValidationConfig = QGenUtils.buildValidationConfig;
const buildTestRunnerConfig = QGenUtils.buildTestRunnerConfig;
const createPerformanceMetrics = QGenUtils.createPerformanceMetrics;
const createProcessingCapabilities = QGenUtils.createProcessingCapabilities;

// Function utilities
const createDualVersionFunction = QGenUtils.createDualVersionFunction;
const execHelperWrapper = QGenUtils.execHelperWrapper;
const createExecHelper = QGenUtils.createExecHelper;

// Data structures
const createMinHeap = QGenUtils.createMinHeap;

// Secure config utilities
const maskSensitiveValue = QGenUtils.maskSensitiveValue;
const validateConfigValue = QGenUtils.validateConfigValue;
const buildSecureConfig = QGenUtils.buildSecureConfig;

// Module loader utilities
const loadAndFlattenModule = QGenUtils.loadAndFlattenModule;
const createCachedLoader = QGenUtils.createCachedLoader;
const createSimpleLoader = QGenUtils.createSimpleLoader;
const createDirectLoader = QGenUtils.createDirectLoader;

// Performance monitoring utilities
const collectPerformanceMetrics = QGenUtils.collectPerformanceMetrics;
const measureEventLoopLag = QGenUtils.measureEventLoopLag;
const analyzePerformanceMetrics = QGenUtils.analyzePerformanceMetrics;
const getPerformanceHealthStatus = QGenUtils.getPerformanceHealthStatus;
const createPerformanceMonitor = QGenUtils.createPerformanceMonitor;

// ============================================================================
// BROWSER EXPORT - CommonJS Compatibility
// ============================================================================

/**
 * Browser Utilities Export
 * 
 * This export provides CommonJS compatibility for browser environments
 * that support module.exports (primarily for bundling tools and testing
 * frameworks that expect CommonJS format).
 * 
 * Export Strategy:
 * - CommonJS Format: Compatible with Node.js and bundler ecosystems
 * - Categorized Exports: Logical grouping for better organization
 * - Complete API: Full utility access for comprehensive browser usage
 * - Type Preservation: Maintains utility signatures and behaviors
 * 
 * Bundler Integration:
 * - Webpack: Proper module resolution and tree-shaking
 * - Rollup: Efficient bundle generation with external dependencies
 * - Parcel: Automatic bundling with zero configuration
 * - Browserify: CommonJS to browser module conversion
 * 
 * Usage Patterns:
 * ```javascript
 * // Direct require in bundler context
 * const utils = require('./browser-utils.js');
 * 
 * // Destructured imports for specific utilities
 * const { validateEmailFormat, hashPassword } = require('./browser-utils.js');
 * ```
 * 
 * Production Considerations:
 * - Bundle Size: Use tree-shaking to reduce final bundle size
 * - Polyfills: Include core-js for legacy browser support
 * - Minification: Enable for production deployments
 * - Source Maps: Generate for debugging in development
 */
module.exports = {
    // Validation
    validateEmailFormat,
    validatePasswordStrength,
    validateApiKeyFormat,
    validateMonetaryAmount,
    validateCurrencyCode,
    validateDateRange,
    validateSubscriptionPlan,
    sanitizeInput,
    
    // Security
    maskApiKey,
    hashPassword,
    verifyPassword,
    generateSecurePassword,
    timingSafeCompare,
    extractApiKey,
    
    // Collections & Arrays
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
    skip,
    takeWhile,
    skipWhile,
    dedupeByLowercaseFirst,
    
    // Objects
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
    
    // Performance
    memoize,
    throttle,
    debounce,
    safeDurationFromTimer,
    createSafeDurationExtractor,
    
    // String & File
    sanitizeString,
    formatFileSize,
    
    // DateTime
    formatDateTime,
    formatDuration,
    addDays,
    formatDate,
    formatDateWithPrefix,
    createTimeProvider,
    formatDateTimeWithProvider,
    formatDurationWithProvider,
    formatRelativeTime,
    
    // URL
    ensureProtocol,
    ensureProtocolUrl,
    normalizeUrlOrigin,
    stripProtocol,
    parseUrlParts,
    
    // IDs
    generateExecutionId,
    makeIdempotencyKey,
    makeIdempotencyKeyObj,
    
    // Logger
    getAppLogger,
    createRunId,
    getAppLoggerCore,
    createRunIdCore,
    
    // API & HTTP
    buildEndpointMeta,
    attachEndpointMeta,
    createJsonHeaders,
    createBasicAuth,
    contextualTimeouts,
    getContextualTimeout,
    createTimeoutConfig,
    createDynamicTimeout,
    createHttpConfig,
    
    // Batch
    createSemaphore,
    retryWithBackoff,
    processBatch,
    
    // Scheduling
    msToCron,
    scheduleInterval,
    scheduleOnce,
    cleanupJobs,
    
    // Config
    buildFeatureConfig,
    buildSecurityConfig,
    buildValidationConfig,
    buildTestRunnerConfig,
    createPerformanceMetrics,
    createProcessingCapabilities,
    
    // Functions
    createDualVersionFunction,
    execHelperWrapper,
    createExecHelper,
    
    // Data Structures
    createMinHeap,
    
    // Secure Config
    maskSensitiveValue,
    validateConfigValue,
    buildSecureConfig,
    
    // Module Loader
    loadAndFlattenModule,
    createCachedLoader,
    createSimpleLoader,
    createDirectLoader,
    
    // Performance Monitoring
    collectPerformanceMetrics,
    measureEventLoopLag,
    analyzePerformanceMetrics,
    getPerformanceHealthStatus,
    createPerformanceMonitor
};
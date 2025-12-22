/**
 * QGenUtils Browser Bundle
 * Provides browser-compatible utilities for demo interface
 */

// Import utilities from the main index.js
// Browser environment - QGenUtils needs to be imported differently
// This won't work in browser without bundling
console.warn('browser-utils.js needs bundling for browser compatibility');

let QGenUtils = {};
if (typeof window !== 'undefined' && window.QGenUtils) {
    QGenUtils = window.QGenUtils;
}

// Validation utilities
const validateEmailFormat = QGenUtils.validateEmailFormat;
const validatePasswordStrength = QGenUtils.validatePasswordStrength;
const validateApiKeyFormat = QGenUtils.validateApiKeyFormat;
const validateMonetaryAmount = QGenUtils.validateMonetaryAmount;
const validateCurrencyCode = QGenUtils.validateCurrencyCode;
const validateDateRange = QGenUtils.validateDateRange;
const validateSubscriptionPlan = QGenUtils.validateSubscriptionPlan;
const sanitizeInput = QGenUtils.sanitizeInput;

// Security utilities
const maskApiKey = QGenUtils.maskApiKey;
const hashPassword = QGenUtils.hashPassword;
const verifyPassword = QGenUtils.verifyPassword;
const generateSecurePassword = QGenUtils.generateSecurePassword;
const timingSafeCompare = QGenUtils.timingSafeCompare;
const extractApiKey = QGenUtils.extractApiKey;

// Collections utilities
const groupBy = QGenUtils.groupBy;
const partition = QGenUtils.partition;
const unique = QGenUtils.unique;
const chunk = QGenUtils.chunk;
const flatten = QGenUtils.flatten;
const intersection = QGenUtils.intersection;
const difference = QGenUtils.difference;
const sortBy = QGenUtils.sortBy;
const shuffle = QGenUtils.shuffle;
const take = QGenUtils.take;
const skip = QGenUtils.skip;
const takeWhile = QGenUtils.takeWhile;
const skipWhile = QGenUtils.skipWhile;

// Object utilities
const isPlainObject = QGenUtils.isPlainObject;
const pick = QGenUtils.pick;
const omit = QGenUtils.omit;
const deepMerge = QGenUtils.deepMerge;
const deepClone = QGenUtils.deepClone;
const getNestedValue = QGenUtils.getNestedValue;
const setNestedValue = QGenUtils.setNestedValue;
const isEqual = QGenUtils.isEqual;
const mapKeys = QGenUtils.mapKeys;
const mapValues = QGenUtils.mapValues;
const filterKeys = QGenUtils.filterKeys;
const isEmpty = QGenUtils.isEmpty;
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

// HTTP utilities
const createJsonHeaders = QGenUtils.createJsonHeaders;
const createBasicAuth = QGenUtils.createBasicAuth;
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

// Export all utilities for browser use
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
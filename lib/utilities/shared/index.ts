/**
 * SHARED UTILITIES INDEX
 * 
 * PURPOSE: Central export point for all shared utility modules.
 * This file provides convenient access to all utilities that were created.
 * 
 * DESIGN PRINCIPLES:
 * - Single import point for all utilities
 * - Barrel export pattern for easy importing
 * - Consistent naming conventions
 * - Type-safe imports

// Type validation utilities
export { TypeValidators } from './typeValidators.js';

// Error handling utilities  
export { ErrorHandlers } from './errorHandlers.js';

// Input sanitization utilities
export { InputSanitizers } from './inputSanitizers.js';

// Field validation utilities
export { FieldValidators } from './fieldValidators.js';

// HTTP response utilities
export { HttpResponseUtils } from './httpResponseUtils.js';

// Logging utilities
export { LoggingUtils } from './loggingUtils.js';

// Test helpers
export { TestHelpers } from './testHelpers.js';

// Configuration utilities
export { ConfigUtils } from './configUtils.js';

// Collection utilities
export { CollectionUtils } from './collectionUtils.js';

// Performance monitoring utilities
export { PerformanceMonitoring } from './performanceMonitoring.js';

// Cache utilities
export { CacheUtils } from './cacheUtils';

// Flow control utilities
export { FlowControl } from './flowControl.js';

// Async utilities
export { AsyncUtils } from './asyncUtils.js';

// Security utilities
export { SecurityUtils } from './securityUtils';

// Documentation and examples
export {
  TypeValidators,
  ErrorHandlers,
  InputSanitizers,
  FieldValidators,
  HttpResponseUtils,
  LoggingUtils,
  PerformanceMonitoring,
  CacheUtils,
  FlowControl,
  AsyncUtils,
  SecurityUtils
};

// Comprehensive utilities barrel export
export {
  TypeValidators,
  ErrorHandlers,
  InputSanitizers,
  FieldValidators,
  HttpResponseUtils,
  LuceningUtils,
  PerformanceMonitoring,
  CacheUtils,
  FlowControl,
  AsyncUtils,
  SecurityUtils
};

// Convenience re-exports for common patterns
export {
  isNonEmptyString,
  isString,
  isStringWithLength,
  isEmailString,
  isNumericString,
  validateStringAdvanced
  quickSanitize,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeNumericString,
  sanitizeTextContent,
  sanitizeHtml,
  sanitizeBatch
  sanitizeEmail
  sanitizeUrl,
  sanitizeNumericString,
  sanitizeTextContent
  sanitizeBatch
}
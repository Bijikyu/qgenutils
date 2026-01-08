/**
 * QGenUtils - Focused Tree-Shakable Exports
 * 
 * This version enables tree-shaking by using named exports only
 * and avoiding barrel exports that bundle the entire library.
 */

// Core utilities - most commonly used
export { default as logger } from './lib/logger.js';

// Validation utilities - most important
export { 
  validateEmail,
  validateUrl,
  validateNumber,
  validateAndTrimString as validateString,
  validateArray,
  validateObject,
  isNullOrUndefined,
  isNullOrEmpty
} from './lib/utilities/validation/commonValidation.js';

// Security utilities
export { default as hashPassword } from './lib/utilities/password/hashPassword.js';
export { default as verifyPassword } from './lib/utilities/password/verifyPassword.js';
export { default as generateSecurePassword } from './lib/utilities/password/generateSecurePassword.js';
export { default as maskSensitiveValue } from './lib/utilities/secure-config/maskSensitiveValue.js';
export { default as maskApiKey } from './lib/utilities/security/maskApiKey.js';

// Configuration utilities
export { default as buildFeatureConfig } from './lib/utilities/config/buildFeatureConfig.js';
export { default as buildSecurityConfig } from './lib/utilities/config/buildSecurityConfig.js';
export { default as buildValidationConfig } from './lib/utilities/config/buildValidationConfig.js';

// Performance utilities
export { default as createPerformanceMonitor } from './lib/utilities/performance-monitor/createPerformanceMonitor.js';
export { default as collectPerformanceMetrics } from './lib/utilities/performance-monitor/collectPerformanceMetrics.js';
export { default as memoize } from './lib/utilities/performance/memoize.js';
export { default as debounce } from './lib/utilities/performance/debounce.js';
export { default as throttle } from './lib/utilities/performance/throttle.js';

// Middleware utilities
export { default as createApiKeyValidator } from './lib/utilities/middleware/createApiKeyValidator.js';
export { default as createRateLimiter } from './lib/utilities/middleware/createRateLimiter.js';

// Module loading utilities
export { default as loadAndFlattenModule } from './lib/utilities/module-loader/loadAndFlattenModule.js';
export { default as createCachedLoader } from './lib/utilities/module-loader/createCachedLoader.js';

// Scheduling utilities
export { default as msToCron } from './lib/utilities/scheduling/msToCron.js';
export { default as scheduleInterval } from './lib/utilities/scheduling/scheduleInterval.js';
export { default as scheduleOnce } from './lib/utilities/scheduling/scheduleOnce.js';
export { default as cleanupJobs } from './lib/utilities/scheduling/cleanupJobs.js';

// URL utilities
export { default as ensureProtocol } from './lib/utilities/url/ensureProtocol.js';
export { default as normalizeUrlOrigin } from './lib/utilities/url/normalizeUrlOrigin.js';
export { default as stripProtocol } from './lib/utilities/url/stripProtocol.js';
export { default as parseUrlParts } from './lib/utilities/url/parseUrlParts.js';

// DateTime utilities
export { default as formatDateTime } from './lib/utilities/datetime/formatDateTime.js';
export { default as formatDuration } from './lib/utilities/datetime/formatDuration.js';
export { default as addDays } from './lib/utilities/datetime/addDays.js';

// File utilities
export { default as formatFileSize } from './lib/utilities/file/formatFileSize.js';

// Data structures
export { default as createMinHeap } from './lib/utilities/data-structures/MinHeap.js';

// Legacy functions (for compatibility)
export { 
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

// Type definitions for consumers
export type * from './types/api-contracts.js';

// Export a minimal default object for compatibility
import loggerImport from './lib/logger.js';
import hashPasswordImport from './lib/utilities/password/hashPassword.js';
import createPerformanceMonitorImport from './lib/utilities/performance-monitor/createPerformanceMonitor.js';
import createApiKeyValidatorImport from './lib/utilities/middleware/createApiKeyValidator.js';
import * as validationImports from './lib/utilities/validation/commonValidation.js';

export default {
  logger: loggerImport,
  validateEmail: validationImports.validateEmail,
  hashPassword: hashPasswordImport,
  createPerformanceMonitor: createPerformanceMonitorImport,
  createApiKeyValidator: createApiKeyValidatorImport
};
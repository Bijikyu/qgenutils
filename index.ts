/**
 * QGenUtils - Security-First Node.js Utility Library
 * 
 * A focused utility library providing authentication, validation, security, 
 * performance, and common operations. Designed as a lightweight alternative 
 * to heavy npm packages with comprehensive error handling and fail-closed security patterns.
 * 
 * This library supports tree-shaking - import only what you need!
 * 
 * @version 1.0.3
 * @author Q
 */

// Core utilities - most commonly used
export { default as logger } from './lib/logger.js';

// Data structures
export { default as createMinHeap } from './lib/utilities/data-structures/MinHeap.js';

// Security utilities
export { default as hashPassword } from './lib/utilities/password/hashPassword.js';
export { default as verifyPassword } from './lib/utilities/password/verifyPassword.js';
export { default as generateSecurePassword } from './lib/utilities/password/generateSecurePassword.js';
export { default as maskSensitiveValue } from './lib/utilities/secure-config/maskSensitiveValue.js';
export { default as validateConfigValue } from './lib/utilities/secure-config/validateConfigValue.js';
export { default as buildSecureConfig } from './lib/utilities/secure-config/buildSecureConfig.js';

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

// Configuration utilities  
export { default as buildFeatureConfig } from './lib/utilities/config/buildFeatureConfig.js';
export { default as buildSecurityConfig } from './lib/utilities/config/buildSecurityConfig.js';
export { default as buildValidationConfig } from './lib/utilities/config/buildValidationConfig.js';

// Performance utilities
export { default as createPerformanceMonitor } from './lib/utilities/performance-monitor/createPerformanceMonitor.js';
export { default as collectPerformanceMetrics } from './lib/utilities/performance-monitor/collectPerformanceMetrics.js';

// Middleware utilities
export { default as createApiKeyValidator } from './lib/utilities/middleware/createApiKeyValidator.js';
export { default as createRateLimiter } from './lib/utilities/middleware/createRateLimiter.js';

// Module loading utilities
export { default as loadAndFlattenModule } from './lib/utilities/module-loader/loadAndFlattenModule.js';
export { default as createCachedLoader } from './lib/utilities/module-loader/createCachedLoader.js';
export { default as createSimpleLoader } from './lib/utilities/module-loader/createSimpleLoader.js';
export { default as createDirectLoader } from './lib/utilities/module-loader/createDirectLoader.js';

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
export { default as formatDate } from './lib/utilities/datetime/formatDate.js';
export { default as formatDateWithPrefix } from './lib/utilities/datetime/formatDateWithPrefix.js';

// ID generation utilities
export { default as generateExecutionId } from './lib/utilities/id-generation/generateExecutionId.js';

// String utilities
export { default as sanitizeString } from './lib/utilities/string/sanitizeString.js';

// File utilities
export { default as formatFileSize } from './lib/utilities/file/formatFileSize.js';

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

// Welcome message for tree-shaking
export const treeShakable = true;

// Named exports for specific commonly used validators
// export { default as defaultEmailValidator } from './lib/utilities/validation/validateEmailSimple.js';

// Default export with key utilities (explicit import for syntax)
import loggerImport from './lib/logger.js';
// import validateEmailImport from './lib/utilities/validation/validateEmailSimple.js';
// import sanitizeInputImport from './lib/utilities/validation/sanitizeInput.js';
import createMinHeapImport from './lib/utilities/data-structures/MinHeap.js';
import hashPasswordImport from './lib/utilities/password/hashPassword.js';
import verifyPasswordImport from './lib/utilities/password/verifyPassword.js';
import buildSecureConfigImport from './lib/utilities/secure-config/buildSecureConfig.js';
import buildFeatureConfigImport from './lib/utilities/config/buildFeatureConfig.js';
import createPerformanceMonitorImport from './lib/utilities/performance-monitor/createPerformanceMonitor.js';
import createApiKeyValidatorImport from './lib/utilities/middleware/createApiKeyValidator.js';
import loadAndFlattenModuleImport from './lib/utilities/module-loader/loadAndFlattenModule.js';
import formatDateTimeImport from './lib/utilities/datetime/formatDateTime.js';
import formatDurationImport from './lib/utilities/datetime/formatDuration.js';
import addDaysImport from './lib/utilities/datetime/addDays.js';
import formatDateImport from './lib/utilities/datetime/formatDate.js';
import formatDateWithPrefixImport from './lib/utilities/datetime/formatDateWithPrefix.js';
import ensureProtocolImport from './lib/utilities/url/ensureProtocol.js';
import normalizeUrlOriginImport from './lib/utilities/url/normalizeUrlOrigin.js';
import stripProtocolImport from './lib/utilities/url/stripProtocol.js';
import parseUrlPartsImport from './lib/utilities/url/parseUrlParts.js';
import generateExecutionIdImport from './lib/utilities/id-generation/generateExecutionId.js';
import sanitizeStringImport from './lib/utilities/string/sanitizeString.js';
import formatFileSizeImport from './lib/utilities/file/formatFileSize.js';

export default {
  logger: loggerImport,
  // validateEmail: validateEmailImport,
  // sanitizeInput: sanitizeInputImport,
  createMinHeap: createMinHeapImport,
  hashPassword: hashPasswordImport,
  verifyPassword: verifyPasswordImport,
  buildSecureConfig: buildSecureConfigImport,
  buildFeatureConfig: buildFeatureConfigImport,
  createPerformanceMonitor: createPerformanceMonitorImport,
  createApiKeyValidator: createApiKeyValidatorImport,
  loadAndFlattenModule: loadAndFlattenModuleImport,
  formatDateTime: formatDateTimeImport,
  formatDuration: formatDurationImport,
  addDays: addDaysImport,
  formatDate: formatDateImport,
  formatDateWithPrefix: formatDateWithPrefixImport,
  ensureProtocol: ensureProtocolImport,
  normalizeUrlOrigin: normalizeUrlOriginImport,
  stripProtocol: stripProtocolImport,
  parseUrlParts: parseUrlPartsImport,
  generateExecutionId: generateExecutionIdImport,
  sanitizeString: sanitizeStringImport,
  formatFileSize: formatFileSizeImport
};

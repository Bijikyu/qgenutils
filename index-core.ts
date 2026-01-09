/**
 * QGenUtils - Core Exports (Tree Shakable)
 *
 * This is the main entry point focused on tree-shaking.
 * Import only what you need:
 *
 * import { validateEmail, hashPassword } from 'qgenutils';
 */

// Most commonly used utilities
export { default as logger } from './lib/logger.js';

// Essential validation
export {
  validateEmail,
  validateUrl,
  validateNumber,
  validateAndTrimString as validateString,
  isNullOrUndefined,
  isNullOrEmpty
} from './lib/utilities/validation/commonValidation.js';

// Core security
export { default as hashPassword } from './lib/utilities/password/hashPassword.js';
export { default as verifyPassword } from './lib/utilities/password/verifyPassword.js';
export { default as maskApiKey } from './lib/utilities/security/maskApiKey.js';
export { default as generateSecurePassword } from './lib/utilities/password/generateSecurePassword.js';

// Configuration utilities
export { default as buildFeatureConfig } from './lib/utilities/config/buildFeatureConfig.js';
export { default as buildSecurityConfig } from './lib/utilities/config/buildSecurityConfig.js';

// Performance utilities
export { default as createPerformanceMonitor } from './lib/utilities/performance-monitor/createPerformanceMonitor.js';
export { default as collectPerformanceMetrics } from './lib/utilities/performance-monitor/collectPerformanceMetrics.js';
export { default as memoize } from './lib/utilities/performance/memoize.js';
export { default as debounce } from './lib/utilities/performance/debounce.js';

// Essential middleware
export { default as createApiKeyValidator } from './lib/utilities/middleware/createApiKeyValidator.js';
export { default as createRateLimiter } from './lib/utilities/middleware/createRateLimiter.js';

// URL utilities
export { default as ensureProtocol } from './lib/utilities/url/ensureProtocol.js';
export { default as normalizeUrlOrigin } from './lib/utilities/url/normalizeUrlOrigin.js';
export { default as stripProtocol } from './lib/utilities/url/stripProtocol.js';

// DateTime utilities
export { default as formatDateTime } from './lib/utilities/datetime/formatDateTime.js';
export { default as formatDuration } from './lib/utilities/datetime/formatDuration.js';
export { default as addDays } from './lib/utilities/datetime/addDays.js';

// File utilities
export { default as formatFileSize } from './lib/utilities/file/formatFileSize.js';

// Data structures
export { default as createMinHeap } from './lib/utilities/data-structures/MinHeap.js';

// Scheduling utilities
export { default as scheduleInterval } from './lib/utilities/scheduling/scheduleInterval.js';
export { default as scheduleOnce } from './lib/utilities/scheduling/scheduleOnce.js';
export { default as cleanupJobs } from './lib/utilities/scheduling/cleanupJobs.js';

// Type definitions
export type * from './types/api-contracts.js';

// Minimal default for compatibility
import loggerImport from './lib/logger.js';
import hashPasswordImport from './lib/utilities/password/hashPassword.js';
import createApiKeyValidatorImport from './lib/utilities/middleware/createApiKeyValidator.js';
import * as validationImports from './lib/utilities/validation/commonValidation.js';

export default {
  logger: loggerImport,
  validateEmail: validationImports.validateEmail,
  hashPassword: hashPasswordImport,
  createApiKeyValidator: createApiKeyValidatorImport
};

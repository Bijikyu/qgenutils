
/*
 * Main Module Entry Point
 * 
 * This file serves as the central export hub for all utility functions organized
 * across specialized modules. The design follows a modular architecture pattern
 * where related functionality is grouped into focused modules under /lib/.
 * 
 * RATIONALE FOR THIS APPROACH:
 * 1. Separation of Concerns: Each module handles a specific domain (auth, HTTP, URLs, etc.)
 * 2. Maintainability: Changes to one area don't affect others
 * 3. Testability: Individual modules can be tested in isolation
 * 4. Backward Compatibility: All functions remain accessible from the main module
 * 5. Tree Shaking: Bundlers can optimize imports by including only needed modules
 * 
 * The dual export strategy (CommonJS + ES modules) ensures compatibility with
 * both legacy require() callers and modern import syntax.  // clarify support for dual module systems
 * It exposes a CommonJS module.exports object and sets module.exports.default
 * for ES module consumers.  // explain parallel exports for broad usage
 */

// Import all utility functions from organized modules
// Each require() statement pulls in a focused set of related functionality
const logger = require('./lib/logger'); // winston logger
const { formatDateTime, formatDuration, addDays, formatDate, formatDateWithPrefix, formatTimestamp, formatRelativeTime, formatExecutionDuration, formatCompletionDate } = require('./lib/datetime'); // enhanced date formatting and arithmetic helpers
const { calculateContentLength, buildCleanHeaders, getRequiredHeader } = require('./lib/http'); // HTTP header and length utilities
const { sendJsonResponse, sendValidationError, sendAuthError, sendServerError } = require('./lib/response-utils'); // import additional response helpers for centralized error handling
const { requireFields } = require('./lib/validation'); // request field validation
const { checkPassportAuth, hasGithubStrategy } = require('./lib/auth'); // Passport.js helpers
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('./lib/url'); // URL normalization helpers
const { renderView, registerViewRoute } = require('./lib/views'); // view rendering utilities
const { requireEnvVars, hasEnvVar, getEnvVar } = require('./lib/env'); // environment variable utilities
const { makeCopyFn, isClipboardSupported, isBrowser } = require('./lib/browser'); // browser utilities
const { createBroadcastRegistry, createPaymentBroadcastRegistry, createSocketBroadcastRegistry, validateBroadcastData } = require('./lib/realtime'); // real-time communication utilities
const { generateExecutionId, generateTaskId, generateSecureId, generateSimpleId } = require('./lib/id-generation'); // secure ID generation utilities
const { sanitizeString, sanitizeErrorMessage, sanitizeForHtml, validatePagination } = require('./lib/string-utils'); // string sanitization and validation utilities
const { validateGitHubUrl, extractGitHubInfo, validateGitHubRepo, validateGitHubUrlDetailed } = require('./lib/github-validation'); // GitHub repository validation utilities
const { validateEmail, validateRequired, validateMaxLength, validateSelection, combineValidations, validateObjectId } = require('./lib/advanced-validation'); // advanced validation utilities
const { formatFileSize } = require('./lib/file-utils'); // file utilities for formatting and file operations
const { createWorkerPool } = require('./lib/worker-pool'); // worker thread pool management for CPU-intensive tasks

/*
 * Export Strategy Explanation:
 *
 * All utilities are re-exported from this file so consumers can access them
 * through one entry point, ensuring older codebases continue to `require('qgenutils')`
 * without modification. This backward compatible approach lets developers
 * cherry-pick imports while still benefiting from a single aggregated module.
 *
 * Exposing every utility here keeps the API surface small, allowing bundlers to
 * tree shake unused members and include only what is required. The simplified
 * surface also makes discovery easier for new developers.
 *
 * We attach `module.exports.default` below so ES module loaders expecting a
 * default export can import the same object. This maintains parity between
 * `require()` and `import` usage without forcing consumers to change syntax.
 */

// Export all functions for backward compatibility
// This ensures existing code using require('./index.js') continues to work
module.exports = {
  // DateTime utilities - handle date formatting, duration calculations, and date arithmetic
  formatDateTime, // convert a Date to a locale string for UIs
  formatDuration, // return human readable elapsed time
  addDays, // calculate future dates for business logic and expiration handling
  formatDate, // format date with locale support and fallback handling
  formatDateWithPrefix, // format date with contextual prefix (e.g., "Added 12/25/2023")
  formatTimestamp, // format timestamp with both date and time components
  formatRelativeTime, // format relative time (e.g., "5 minutes ago", "2 hours ago")
  formatExecutionDuration, // format execution duration in compact format (e.g., "5m", "2h")
  formatCompletionDate, // format completion date for execution status displays
  
  // HTTP utilities - manage content length, headers, responses, and validation
  calculateContentLength, // compute body byte length for header
  buildCleanHeaders, // remove dangerous headers from requests
  sendJsonResponse, // send JSON payload with proper status
  sendValidationError, // issue 400 when fields fail validation
  sendAuthError, // issue standard 401 response when unauthorized
  sendServerError, // issue generic 500 and log details
  getRequiredHeader, // fetch mandatory header or error
  
  // URL utilities - handle protocol normalization and URL parsing
  ensureProtocol, // prefix http/https when missing
  normalizeUrlOrigin, // normalize origin for comparisons
  stripProtocol, // remove http/https scheme from URL
  parseUrlParts, // split URL into host and path
  
  // Validation utilities - field presence and format checking
  requireFields, // confirm required request fields exist
  
  // Authentication utilities - Passport.js integration helpers
  checkPassportAuth, // verify request authenticated via Passport
  hasGithubStrategy, // detect configured GitHub strategy
  
  // View utilities - template rendering and route registration
  renderView, // render EJS template with data
  registerViewRoute, // register Express route for view
  
  // Environment utilities - configuration validation and access
  requireEnvVars, // validate presence of required environment variables
  hasEnvVar, // check if single environment variable exists
  getEnvVar, // get environment variable value with optional default
  
  // Browser utilities - client-side functionality and clipboard operations
  makeCopyFn, // factory to create clipboard copy handlers with feedback
  isClipboardSupported, // check if clipboard API is available in browser
  isBrowser, // detect if code is running in browser environment
  
  // Real-time communication utilities - socket.io broadcast registries and validation
  createBroadcastRegistry, // factory to create custom broadcast function registries
  createPaymentBroadcastRegistry, // pre-configured registry for payment/usage broadcasts
  createSocketBroadcastRegistry, // static interface registry with fixed broadcast functions
  validateBroadcastData, // validate data before real-time transmission
  
  // ID generation utilities - secure identifier creation for tracking and data integrity
  generateExecutionId, // create unique execution IDs with timestamp and random component
  generateTaskId, // create unique task IDs for workflow tracking
  generateSecureId, // core secure ID generator with configurable prefix
  generateSimpleId, // generate simple random IDs without timestamp
  
  // String sanitization utilities - security-first string processing
  sanitizeString, // remove dangerous characters and normalize whitespace
  sanitizeErrorMessage, // sanitize error messages to prevent information disclosure
  sanitizeForHtml, // HTML-safe string sanitization with XSS prevention
  validatePagination, // validate and sanitize pagination parameters with safe defaults
  
  // GitHub validation utilities - repository URL and format validation
  validateGitHubUrl, // validate GitHub repository URL format with strict pattern matching
  extractGitHubInfo, // extract owner and repository name from validated GitHub URL
  validateGitHubRepo, // validate GitHub repository name in "owner/repo" format
  validateGitHubUrlDetailed, // comprehensive GitHub URL validation with error categorization
  
  // Advanced validation utilities - comprehensive field validation with error reporting
  validateEmail, // validate email address format using standard regex patterns
  validateRequired, // validate required text fields with optional minimum length
  validateMaxLength, // validate text fields with maximum length constraints
  validateSelection, // validate dropdown/select field selections
  combineValidations, // combine multiple validation functions with first-error reporting
  validateObjectId, // validate MongoDB ObjectId format (24-character hexadecimal)
  
  // File utilities - file operations and formatting for storage management and UI display
  formatFileSize, // format file size in bytes to human-readable string with appropriate units
  
  // Worker pool utilities - CPU-intensive task management with automatic worker replacement
  createWorkerPool, // create and manage pool of worker threads for parallel processing
  
  logger, // winston logger instance
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

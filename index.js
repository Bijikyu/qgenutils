
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
const { formatDateTime, formatDuration } = require('./lib/datetime'); // date formatting helpers
const { calculateContentLength, buildCleanHeaders, getRequiredHeader } = require('./lib/http'); // HTTP header and length utilities
const { sendJsonResponse, sendValidationError, sendAuthError, sendServerError } = require('./lib/response-utils'); // import additional response helpers for centralized error handling
const { requireFields } = require('./lib/validation'); // request field validation
const { checkPassportAuth, hasGithubStrategy } = require('./lib/auth'); // Passport.js helpers
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('./lib/url'); // URL normalization helpers
const { renderView, registerViewRoute } = require('./lib/views'); // view rendering utilities
const { requireEnvVars, hasEnvVar, getEnvVar } = require('./lib/env'); // environment variable utilities
const { makeCopyFn, isClipboardSupported, isBrowser } = require('./lib/browser'); // browser utilities
const { createBroadcastRegistry, createPaymentBroadcastRegistry, validateBroadcastData } = require('./lib/realtime'); // real-time communication utilities

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
  // DateTime utilities - handle date formatting and duration calculations
  formatDateTime, // convert a Date to a locale string for UIs
  formatDuration, // return human readable elapsed time
  
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
  validateBroadcastData, // validate data before real-time transmission
  
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

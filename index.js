
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
 * both older Node.js projects and modern JavaScript environments.
 */

// Import all utility functions from organized modules
// Each require() statement pulls in a focused set of related functionality
const { formatDateTime, formatDuration } = require('./lib/datetime'); // date formatting helpers
const { calculateContentLength, buildCleanHeaders, getRequiredHeader } = require('./lib/http'); // HTTP header and length utilities
const { sendJsonResponse, sendValidationError, sendAuthError, sendServerError } = require('./lib/response-utils'); // import additional response helpers for centralized error handling
const { requireFields } = require('./lib/validation'); // request field validation
const { checkPassportAuth, hasGithubStrategy } = require('./lib/auth'); // Passport.js helpers
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('./lib/url'); // URL normalization helpers
const { renderView, registerViewRoute } = require('./lib/views'); // view rendering utilities

/*
 * Export Strategy Explanation:
 * 
 * We export all functions in a single object to maintain backward compatibility
 * with any existing code that imports from this main module. This allows users
 * to either import specific functions or the entire module without breaking
 * existing implementations.
 * 
 * The flat export structure (rather than nested objects) makes the API simpler
 * and more intuitive for developers who don't need to understand the internal
 * module organization.
 */

// Export all functions for backward compatibility
// This ensures existing code using require('./index.js') continues to work
module.exports = {
  // DateTime utilities - handle date formatting and duration calculations
  formatDateTime, // expose formatDateTime for locale display
  formatDuration, // expose formatDuration for elapsed time
  
  // HTTP utilities - manage content length, headers, responses, and validation
  calculateContentLength, // expose content-length calculation
  buildCleanHeaders, // expose header sanitization logic
  sendJsonResponse, // expose JSON response helper
  sendValidationError, // expose validation error helper for consistency
  sendAuthError, // expose auth error helper to centralize 401 responses
  sendServerError, // expose server error helper for unified 500 handling
  getRequiredHeader, // expose header validation helper
  
  // URL utilities - handle protocol normalization and URL parsing
  ensureProtocol, // expose protocol enforcement
  normalizeUrlOrigin, // expose origin normalization
  stripProtocol, // expose protocol removal
  parseUrlParts, // expose URL decomposition
  
  // Validation utilities - field presence and format checking
  requireFields, // expose field presence check
  
  // Authentication utilities - Passport.js integration helpers
  checkPassportAuth, // expose runtime auth check
  hasGithubStrategy, // expose GitHub strategy detection
  
  // View utilities - template rendering and route registration
  renderView, // expose EJS view rendering
  registerViewRoute // expose route helper for views
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

// Export functions for ES modules (if needed)
module.exports.default = module.exports; // provide default export for import syntax

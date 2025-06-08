
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
const { formatDateTime, formatDuration } = require('./lib/datetime');
const { calculateContentLength, buildCleanHeaders, getRequiredHeader } = require('./lib/http');
const { sendJsonResponse } = require('./lib/response-utils');
const { requireFields } = require('./lib/validation');
const { checkPassportAuth, hasGithubStrategy } = require('./lib/auth');
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('./lib/url');
const { renderView, registerViewRoute } = require('./lib/views');

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
  formatDateTime,
  formatDuration,
  
  // HTTP utilities - manage content length, headers, responses, and validation
  calculateContentLength,
  buildCleanHeaders,
  sendJsonResponse,
  getRequiredHeader,
  
  // URL utilities - handle protocol normalization and URL parsing
  ensureProtocol,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts,
  
  // Validation utilities - field presence and format checking
  requireFields,
  
  // Authentication utilities - Passport.js integration helpers
  checkPassportAuth,
  hasGithubStrategy,
  
  // View utilities - template rendering and route registration
  renderView,
  registerViewRoute
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
module.exports.default = module.exports;

/**
 * Main Module Entry Point
 * 
 * This file serves as the central hub for all utility functions that were previously
 * contained in a single monolithic file. The code has been refactored into logical
 * modules under the /lib directory to improve maintainability and organization.
 * 
 * Rationale for this architecture:
 * 1. Single Responsibility: Each module handles one domain (dates, HTTP, auth, etc.)
 * 2. Maintainability: Developers can locate and modify specific functionality easily
 * 3. Testing: Individual modules can be tested in isolation
 * 4. Reusability: Specific modules can be imported without loading unused functionality
 * 5. Backward Compatibility: This file maintains the original API surface
 * 
 * The export strategy ensures that existing code depending on this module continues
 * to work without modification while allowing new code to import specific modules
 * directly if desired.
 */

// Import all utility functions from organized modules
// These imports mirror the original function organization but now source from specialized modules
const { formatDateTime, formatDuration } = require('./lib/datetime');
const { calculateContentLength, buildCleanHeaders, sendJsonResponse, getRequiredHeader } = require('./lib/http');
const { requireFields } = require('./lib/validation');
const { checkPassportAuth, hasGithubStrategy } = require('./lib/auth');
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('./lib/url');
const { renderView, registerViewRoute } = require('./lib/views');

/**
 * Export Strategy Explanation:
 * 
 * We export all functions in a single object to maintain the exact same API that
 * existed before the refactoring. This ensures zero breaking changes for existing
 * consumers of this module.
 * 
 * The order of exports matches the logical flow of a typical web request:
 * 1. Date/time utilities for logging and timestamps
 * 2. Content length calculation for HTTP headers
 * 3. URL processing for request routing
 * 4. Header extraction and validation
 * 5. JSON response formatting
 * 6. Field validation for request bodies
 * 7. Authentication checking
 * 8. Header cleaning for proxying
 * 9. View rendering for web pages
 */
module.exports = {
  formatDateTime,
  formatDuration,
  calculateContentLength,
  ensureProtocol,
  normalizeUrlOrigin,
  stripProtocol,
  parseUrlParts,
  getRequiredHeader,
  sendJsonResponse,
  requireFields,
  checkPassportAuth,
  hasGithubStrategy,
  buildCleanHeaders,
  renderView,
  registerViewRoute
};

/**
 * ES6 Module Compatibility:
 * 
 * Some bundlers and modern Node.js setups expect a 'default' export for ES6 modules.
 * This line ensures compatibility with both CommonJS (require) and ES6 (import) syntax
 * without requiring changes to the consuming code.
 * 
 * This pattern allows usage like:
 * - const utils = require('./index'); (CommonJS)
 * - import utils from './index'; (ES6 with default export)
 * - import { formatDateTime } from './index'; (ES6 named imports)
 */
module.exports.default = module.exports;
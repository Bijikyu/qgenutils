// Import all utility functions from organized modules
const { formatDateTime, formatDuration } = require('./lib/datetime');
const { calculateContentLength, buildCleanHeaders, sendJsonResponse, getRequiredHeader } = require('./lib/http');
const { requireFields } = require('./lib/validation');
const { checkPassportAuth, hasGithubStrategy } = require('./lib/auth');
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('./lib/url');
const { renderView, registerViewRoute } = require('./lib/views');

// Export all functions for backward compatibility
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

// Export functions for ES modules (if needed)
module.exports.default = module.exports;
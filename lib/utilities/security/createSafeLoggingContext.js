'use strict';

const sanitizeUrl = require('./sanitizeUrl');

const ALLOWED_HEADERS = [ // headers safe to log
  'content-type', 'accept', 'x-requested-with',
  'user-agent', 'accept-language', 'accept-encoding'
];

/**
 * Creates a safe logging context that excludes sensitive request data
 * @param {Object} req - Express request object
 * @param {Object} [options] - Configuration options
 * @param {string[]} [options.allowedHeaders] - Additional headers to include
 * @returns {Object} Safe logging context object
 * @example
 * app.use((req, res, next) => {
 *   const context = createSafeLoggingContext(req);
 *   logger.info('Request received', context);
 *   next();
 * });
 */
function createSafeLoggingContext(req, options = {}) { // create safe Express request context
  const allowedHeaders = [...ALLOWED_HEADERS, ...(options.allowedHeaders || [])];

  const context = { // base context
    method: req.method,
    url: sanitizeUrl(req.url || req.originalUrl),
    path: req.path,
    ip: req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress,
    timestamp: new Date().toISOString()
  };

  context.headers = {}; // add allowed headers only
  for (const header of allowedHeaders) {
    const value = req.get ? req.get(header) : req.headers?.[header];
    if (value) {
      context.headers[header] = value;
    }
  }

  if (req.id) { // add request ID if available
    context.requestId = req.id;
  }

  if (req.user?.id) { // add user ID if available (not full user object)
    context.userId = req.user.id;
  }

  return context;
}

createSafeLoggingContext.ALLOWED_HEADERS = ALLOWED_HEADERS; // expose for extension

module.exports = createSafeLoggingContext;

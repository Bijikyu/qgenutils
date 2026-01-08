'use strict';

import sanitizeUrl from './sanitizeUrl.js';

const ALLOWED_HEADERS = [ // headers safe to log
  'content-type', 'accept', 'x-requested-with',
  'user-agent', 'accept-language', 'accept-encoding'
];

interface SafeLoggingContextOptions {
  allowedHeaders?: string[];
}

interface SafeLoggingContext {
  method: any;
  url: any;
  path: any;
  ip: any;
  timestamp: string;
  [key: string]: any; // Allow dynamic properties
}

/**
 * Creates a safe logging context from Express request
 *
 * PURPOSE: Extracts and sanitizes request information for secure logging.
 * Filters out sensitive headers and data while preserving essential
 * debugging information. Essential for audit trails and security monitoring.
 *
 * @param {Object} req - Express request object
 * @param {Object} [options] - Configuration options
 * @returns {Object} Safe logging context
 * @example
 * const context = createSafeLoggingContext(req, { allowedHeaders: ['x-request-id'] });
 */
function createSafeLoggingContext(req: any, options: SafeLoggingContextOptions = {}) { // create safe Express request context
  const allowedHeaders: any = [...ALLOWED_HEADERS, ...(options.allowedHeaders || [])];

  const context: any = { // base context
    method: req.method,
    url: sanitizeUrl(req.url || req.originalUrl),
    path: req.path,
    ip: req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress,
    timestamp: new Date().toISOString()
  };

  context.headers = {}; // add allowed headers only
  for (const header of allowedHeaders) {
    const value: any = req.get ? req.get(header) : req.headers?.[header];
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

export default createSafeLoggingContext;

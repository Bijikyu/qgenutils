
/**
 * Convert ISO string to locale display format
 * @param {string} dateString - The ISO date string to format
 * @returns {string} The formatted date string
 */
function formatDateTime(dateString) {
  console.log(`formatDateTime is running with ${dateString}`);
  try {
    if (!dateString) return 'N/A';
    const result = new Date(dateString).toLocaleString();
    console.log(`formatDateTime is returning ${result}`);
    return result;
  } catch (err) {
    console.log('formatDateTime has run resulting in a final value of failure');
    throw err;
  }
}

/**
 * Show elapsed time as hh:mm:ss format
 * @param {string} startDate - The start date ISO string
 * @param {string|null} [endDate] - The end date ISO string (optional, defaults to current time)
 * @returns {string} The formatted duration string
 */
function formatDuration(startDate, endDate = null) {
  console.log(`formatDuration is running with ${startDate} and ${endDate}`);
  try {
    if (!startDate) return '00:00:00';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const seconds = Math.floor(diffMs / 1000) % 60;
    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(`formatDuration is returning ${result}`);
    return result;
  } catch (err) {
    console.log('formatDuration has run resulting in a final value of failure');
    throw err;
  }
}

const qerrors = require('qerrors');

// Headers removed in all proxied requests for reuse
const HEADERS_TO_REMOVE = [
    'host',
    'x-target-url',
    'x-api-key',
    'cdn-loop',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'cf-visitor',
    'render-proxy-ttl',
    'connection'
];

/**
 * Build clean headers by removing unwanted headers and managing content-length
 * @param {object} headers - Original headers object
 * @param {string} method - HTTP method
 * @param {*} body - Request body
 * @returns {object} Cleaned headers object
 */
function buildCleanHeaders(headers, method, body) {
    console.log(`buildCleanHeaders is running with ${method}`); // start log
    try {
        const cleanHeaders = { ...headers }; // clone incoming headers
        HEADERS_TO_REMOVE.forEach(header => { delete cleanHeaders[header]; }); // strip banned headers
        if (!body || method.toLowerCase() === 'get') delete cleanHeaders['content-length']; // remove length when none
        if (method.toLowerCase() !== 'get' && body && Object.keys(body).length > 0) {
            cleanHeaders['content-length'] = calculateContentLength(body); // set recalculated length
        }
        console.log(`buildCleanHeaders is returning ${JSON.stringify(cleanHeaders)}`); // return log
        return cleanHeaders;
    } catch (error) {
        qerrors(error, 'buildCleanHeaders', { method }); // error log
        return headers; // fallback when error
    }
}

/**
 * Send a consistent JSON response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data
 */
function sendJsonResponse(res, statusCode, data) {
  console.log(`sendJsonResponse is sending ${statusCode} with`, data);
  res.status(statusCode).json(data);
}

/**
 * Validate required fields in an object
 * @param {object} res - Express response object
 * @param {object} obj - Object to validate
 * @param {string[]} fieldNames - Array of required field names
 * @returns {boolean} True if all fields are present, false otherwise
 */
function requireFields(res, obj, fieldNames) {
  console.log(`requireFields is running with ${fieldNames}`); // Log validation attempt for debugging
  try {
    // Filter to find fields that are missing or falsy
    // This catches undefined, null, empty string, 0, false, etc.
    const missing = fieldNames.filter(name => !obj[name]);

    if (missing.length > 0) {
      // Send detailed error message listing all missing fields
      // This helps developers fix multiple validation issues at once
      sendJsonResponse(res, 400, {
        error: `Missing required fields: ${missing.join(', ')}`
      });
      console.log(`requireFields is returning false`); // Log validation failure
      return false; // Indicate validation failure to caller
    }

    console.log(`requireFields is returning true`); // Log validation success
    return true; // All required fields are present
  } catch (error) {
    // Handle unexpected errors during validation (malformed objects, etc.)
    // Send generic error to client while logging specific error for debugging
    sendJsonResponse(res, 500, { error: 'Validation error' });
    console.log(`requireFields error ${error.message}`); // Log specific error details
    return false; // Treat errors as validation failures for safety
  }
}

/**
 * Check Passport authentication status
 * @param {object} req - Express request object
 * @returns {boolean} True if user is authenticated, false otherwise
 */
function checkPassportAuth(req) {
  console.log(`checkPassportAuth is running with ${req.user ? req.user.username : 'guest'}`); // Log authentication check with user context
  try {
    // Check if Passport authentication method exists and user is authenticated
    // req.isAuthenticated is added by Passport.js middleware
    const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated()); // convert to strict boolean using !! (description of change & current functionality)
    console.log(`checkPassportAuth is returning ${isAuthenticated}`); // Log authentication result for debugging
    return isAuthenticated;
  } catch (error) {
    // Handle any errors in authentication checking gracefully
    // This prevents authentication errors from breaking the entire request
    qerrors(error, 'checkPassportAuth', req); // Log error with request context
    return false; // Default to unauthenticated state for security (fail-closed)
  }
}

/**
 * Detect presence of GitHub OAuth strategy
 * @returns {boolean} True if GitHub strategy is configured, false otherwise
 */
function hasGithubStrategy() {
  console.log(`hasGithubStrategy is running with none`); // start log for strategy check
  try {
    const configured = Boolean(passport._strategies && passport._strategies.github); // convert to strict boolean (description of change & current functionality)
    console.log(`hasGithubStrategy is returning ${configured}`); // log boolean result
    return configured; // return evaluation
  } catch (error) {
    qerrors(error, 'hasGithubStrategy'); // log unexpected error context
    return false; // default absence on error
  }
}

/**
 * Extract and validate required HTTP headers
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} headerName - Name of the required header
 * @param {number} statusCode - Status code to send if header is missing
 * @param {string} errorMessage - Error message to send if header is missing
 * @returns {string|null} The header value or null if missing/error
 */
function getRequiredHeader(req, res, headerName, statusCode, errorMessage) {
  console.log(`getRequiredHeader is running with ${headerName}`); // Log header extraction attempt
  try {
    const headerValue = req?.headers?.[headerName]; // Safely access header value even if headers undefined
    if (!headerValue) {
      sendJsonResponse(res, statusCode, { error: errorMessage }); // use sendJsonResponse for consistent error output
      console.log(`getRequiredHeader is returning null due to missing header`); // Log validation failure
      return null; // Inform caller that header was missing
    }
    console.log(`getRequiredHeader is returning ${headerValue}`); // Log successful header extraction
    return headerValue; // Return found header value
  } catch (error) {
    qerrors(error, 'getRequiredHeader', { headerName, statusCode, errorMessage }); // Log unexpected error
    sendJsonResponse(res, 500, { error: 'Internal server error' }); // use sendJsonResponse for fallback error
    return null; // Signal failure to calling code
  }
}

/**
 * Ensure a URL has a protocol (defaults to HTTPS)
 * @param {string} url - The URL to check
 * @returns {string|null} The URL with protocol or null if invalid
 */
function ensureProtocol(url) {
  console.log(`ensureProtocol is running with ${url}`); // start log for incoming value
  try {
    if (typeof url !== 'string' || !url) { // validate url is usable string
      qerrors(new Error('invalid url input'), 'ensureProtocol', url); // record bad input with context
      console.log(`ensureProtocol is returning null`); // log early return path
      return null; // gracefully exit when invalid
    }
    let finalUrl = url; // hold original url for check
    const hasProto = /^https?:\/\//i.test(finalUrl); // case insensitive protocol check
    if (!hasProto) { finalUrl = 'https://' + finalUrl; } // Default to HTTPS for security
    console.log(`ensureProtocol is returning ${finalUrl}`); // log return
    return finalUrl; // Return unchanged if protocol already present
  } catch (error) {
    qerrors(error, 'ensureProtocol', url); // error path logs context
    return url; // fallback return original
  }
}

/**
 * Normalize a URL to its origin in lowercase
 * @param {string} url - The URL to normalize
 * @returns {string|null} The normalized origin or null if invalid
 */
function normalizeUrlOrigin(url) {
  console.log(`normalizeUrlOrigin is running with ${url}`); // log start
  try {
    const origin = new URL(ensureProtocol(url)).origin.toLowerCase(); // convert to normalized origin
    console.log(`normalizeUrlOrigin is returning ${origin}`); // log return
    return origin;
  } catch (error) {
    qerrors(error, 'normalizeUrlOrigin', url); // log error with context
    return null; // graceful failure
  }
}

/**
 * Strip protocol and trailing slash from URL
 * @param {string} url - The URL to strip
 * @returns {string} The URL without protocol
 */
function stripProtocol(url) {
  console.log(`stripProtocol is running with ${url}`); // log start
  try {
    const processed = url
      .replace(/^https?:\/\//i, '') // remove protocol prefix
      .replace(/\/$/, ''); // trim trailing slash
    console.log(`stripProtocol is returning ${processed}`); // log return
    return processed;
  } catch (error) {
    qerrors(error, 'stripProtocol', url); // log error
    return url; // fallback to original
  }
}

/**
 * Parse URL into base URL and endpoint parts
 * @param {string} url - The URL to parse
 * @returns {object|null} Object with baseUrl and endpoint properties or null if invalid
 */
function parseUrlParts(url) {
  console.log(`parseUrlParts is running with ${url}`);
  try {
    const processedUrl = ensureProtocol(url); // normalize url before parsing
    if (processedUrl === null) { // abort if protocol step failed
      console.log(`parseUrlParts is returning null`); // log skip due to invalid input
      return null; // return early when url invalid
    }
    const parsed = new URL(processedUrl); // parse into parts
    const result = {
      baseUrl: parsed.origin,
      endpoint: parsed.pathname + parsed.search
    };
    console.log(`parseUrlParts is returning ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    qerrors(error, 'parseUrlParts', url);
    return null;
  }
}

/**
 * Calculate the content length of a body in bytes
 * @param {*} body - The body to calculate length for
 * @returns {string} The content length as a string
 */
function calculateContentLength(body) {
  console.log(`calculateContentLength is running with ${body}`); // start log
  try {
    if (body === undefined) throw new TypeError('Body is undefined'); // throw on undefined
    const emptyObj = typeof body === 'object' && body !== null && Object.keys(body).length === 0; // check empty object
    if (body === null || body === '' || emptyObj) { // return zero only for valid empty bodies
      console.log(`calculateContentLength is returning 0`); // return log
      return '0'; // return zero as string
    }

    if (typeof body === 'string') { // handle string bodies
      const len = Buffer.byteLength(body, 'utf8'); // compute byte size
      console.log(`calculateContentLength is returning ${len}`); // return log
      return len.toString(); // return length string
    }

    if (typeof body === 'object') { // handle object bodies
      const jsonString = JSON.stringify(body); // stringify for count
      const len = Buffer.byteLength(jsonString, 'utf8'); // compute bytes
      console.log(`calculateContentLength is returning ${len}`); // return log
      return len.toString(); // return length string
    }

    console.log(`calculateContentLength is returning 0`); // fallback log
    return '0'; // fallback for unknown types
  } catch (error) {
    qerrors(error, 'calculateContentLength', { body }); // log errors via qerrors
    throw error; // rethrow so caller handles invalid input
  }
}

// Export functions for CommonJS
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
  buildCleanHeaders
};

// Export functions for ES modules (if needed)
module.exports.default = module.exports;


const { qerrors } = require('qerrors');

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

module.exports = {
  calculateContentLength,
  buildCleanHeaders,
  sendJsonResponse,
  getRequiredHeader,
  HEADERS_TO_REMOVE
};

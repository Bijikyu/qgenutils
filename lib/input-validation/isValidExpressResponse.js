const hasMethod = require('./hasMethod');

/**
 * Verify that a value resembles an Express response object.
 *
 * PURPOSE: Many utilities need to send HTTP responses but should gracefully
 * bail out if the response object is missing or malformed. A boolean return
 * allows quick validation without throwing.
 *
 * ASSUMPTIONS: res may be anything; we simply check for the presence of the
 * status() and json() methods that Express provides.
 *
 * EDGE CASES: If either method is missing, hasMethod returns false, preventing
 * attempts to call undefined functions which would otherwise throw.
 *
 * @param {*} res - Value to check
 * @returns {boolean} True if valid Express response, false otherwise
 */
function isValidExpressResponse(res) {
  return hasMethod(res, 'status') && hasMethod(res, 'json'); // both Express methods must be functions
}

module.exports = isValidExpressResponse;
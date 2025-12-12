'use strict';

const sanitizeHtml = require('sanitize-html'); // XSS prevention library

/**
 * Extract and sanitize validation errors from express-validator result
 * @param {Object} errors - express-validator error result (from validationResult())
 * @returns {Array<{field: string, message: string, value: *}>} Array of sanitized error objects
 * @example
 * const errors = validationResult(req);
 * const sanitizedErrors = extractValidationErrors(errors);
 */
function extractValidationErrors(errors) { // utility function to extract and sanitize validation errors
  if (!errors || typeof errors.array !== 'function') { // validate input is express-validator result
    throw new Error('Invalid validation errors object');
  }

  return errors.array().map(error => ({
    field: error.path || error.param || 'unknown', // field that failed validation
    message: sanitizeHtml(error.msg, { allowedTags: [], allowedAttributes: {} }), // sanitize error messages for security
    value: error.value // original value that failed
  }));
}

module.exports = extractValidationErrors;

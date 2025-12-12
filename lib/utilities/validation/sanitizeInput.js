'use strict';

const sanitizeHtml = require('sanitize-html'); // XSS prevention library

/**
 * Sanitize input to prevent XSS and injection attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized input string with all HTML tags removed
 * @example
 * sanitizeInput('<script>alert("xss")</script>Hello') // returns 'Hello'
 * sanitizeInput('Normal text') // returns 'Normal text'
 */
function sanitizeInput(input) { // comprehensive input sanitization using sanitize-html
  if (!input || typeof input !== 'string') { // check for input presence and string type
    return ''; // return empty string for invalid input
  }

  return sanitizeHtml(input, {
    allowedTags: [], // disallow all HTML tags for maximum security
    allowedAttributes: {}, // disallow all attributes
    textFilter: (text) => text.trim() // preserve text content while trimming whitespace
  });
}

module.exports = sanitizeInput;

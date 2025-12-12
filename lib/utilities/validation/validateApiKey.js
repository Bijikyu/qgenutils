'use strict';

/**
 * Validate API key format and structure
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if API key is valid, false otherwise
 * @example
 * validateApiKey('sk_live_abc123...') // returns true (if >= 32 chars)
 * validateApiKey('test') // returns false (common test key rejected)
 */
function validateApiKey(apiKey) { // comprehensive API key validation with format checking
  if (!apiKey || typeof apiKey !== 'string') { // check for API key presence and string type
    return false; // invalid input rejection
  }

  const hasValidLength = apiKey.length >= 32 && apiKey.length <= 128; // API key length requirements

  if (!hasValidLength) { // early exit for invalid length
    return false;
  }

  const hasValidFormat = /^[a-zA-Z0-9_-]+$/.test(apiKey); // alphanumeric and safe special characters only

  if (!hasValidFormat) { // reject invalid characters
    return false;
  }

  const commonTestKeys = ['test', 'demo', 'example', 'sample']; // prevent common test keys in production
  const isNotCommon = !commonTestKeys.includes(apiKey.toLowerCase());

  return isNotCommon; // return API key validation result
}

module.exports = validateApiKey;

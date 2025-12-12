'use strict';

/**
 * Creates standard HTTP basic authentication object for API keys
 * @param {string} apiKey - The API key to use for authentication
 * @returns {Object} Authentication object with username and password
 * @example
 * const auth = createApiKeyAuth('sk_live_xxx');
 * // Returns: { username: 'anystring', password: 'sk_live_xxx' }
 */
function createApiKeyAuth(apiKey) { // create HTTP basic auth from API key
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('API key is required');
  }

  return {
    username: 'anystring', // many APIs accept any username with API key as password
    password: apiKey
  };
}

module.exports = createApiKeyAuth;

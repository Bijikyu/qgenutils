/**
 * Creates a complete HTTP configuration object with common settings.
 *
 * PURPOSE: Consolidates header creation, authentication, and timeout
 * configuration into a single, axios-compatible configuration object.
 * Simplifies HTTP client setup for common API integration patterns.
 *
 * TIMEOUT: Uses contextual 'http-api' timeout (30s) by default for consistency
 * with the library's timeout strategy. Override with customTimeout parameter.
 *
 * @param {string} [apiKey] - Optional API key for authentication
 * @param {Record<string, string>} [additionalHeaders] - Optional additional headers
 * @param {number} [customTimeout] - Optional custom timeout override
 * @returns {{ headers?: Record<string, string>; auth?: { username: string; password: string }; timeout: number }}
 */
const createJsonHeaders: any = require('./createJsonHeaders');
const createBasicAuth: any = require('./createBasicAuth');
const getContextualTimeout: any = require('./getContextualTimeout');

function createHttpConfig(apiKey, additionalHeaders, customTimeout) {
  const config = {
    timeout: customTimeout || getContextualTimeout('http-api')
  };
  
  if (apiKey) {
    config.auth = createBasicAuth(apiKey);
  }
  
  config.headers = createJsonHeaders(additionalHeaders);
  
  return config;
}

export default createHttpConfig;

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
import { qerrors } from '@bijikyu/qerrors';
import getContextualTimeout from './getContextualTimeout.js';

function createHttpConfig(apiKey: string | null = null, additionalHeaders: Record<string, string> | null = null, customTimeout?: number) {
  try {
    const config: any = {
      timeout: customTimeout || getContextualTimeout('http-api')
    };

    if (apiKey) {
      config.auth = { username: 'anystring', password: apiKey };
    }

    config.headers = { 'Content-Type': 'application/json', ...(additionalHeaders || {}) };

    return config;
  } catch (err) {
    qerrors(err, 'createHttpConfig', 'HTTP config creation failed');
    throw err;
  }
}

export default createHttpConfig;

import { qerrors } from 'qerrors';

/**
 * Creates basic authentication object for HTTP requests.
 *
 * PURPOSE: Generates authentication credentials compatible with axios and
 * other HTTP clients. Many APIs use the password field for API keys with
 * an arbitrary username (often 'anystring' or 'api').
 *
 * @param {string} apiKey - The API key to use as password
 * @param {string} [username='anystring'] - Optional username (defaults to 'anystring')
 * @returns {{ username: string; password: string }} Basic authentication object
 */
function createBasicAuth(apiKey: string, username: string = 'anystring') {
  try {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key must be a non-empty string');
    }
    
    if (!username || typeof username !== 'string') {
      throw new Error('Username must be a non-empty string');
    }

    return {
      username,
      password: apiKey
    };
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'createBasicAuth', `Basic auth creation failed for username: ${username || 'undefined'}`);
    throw error;
  }
}

export default createBasicAuth;

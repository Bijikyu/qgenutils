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
function createBasicAuth(apiKey, username = 'anystring') {
  return {
    username,
    password: apiKey
  };
}

export default createBasicAuth;

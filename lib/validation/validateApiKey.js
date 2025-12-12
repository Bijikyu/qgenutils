/**
 * Validates that an API key is provided and non-empty.
 *
 * PURPOSE: Provides service-specific API key validation with clear error
 * messages indicating which service is missing configuration. This is
 * essential for early failure when integrating with external services.
 *
 * @param {unknown} apiKey - The API key to validate
 * @param {string} serviceName - The name of the service for error messages
 * @returns {string} The validated and trimmed API key
 * @throws {Error} If API key is missing, empty, or whitespace-only
 */
function validateApiKey(apiKey, serviceName) {
  const apiKeyStr = String(apiKey || '');
  const trimmed = apiKeyStr.trim();
  
  if (!trimmed) {
    throw new Error(`${serviceName} API key is required`);
  }
  
  return trimmed;
}

module.exports = validateApiKey;

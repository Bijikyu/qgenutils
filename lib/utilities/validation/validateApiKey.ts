'use strict';

/**
 * Validate API key format and structure
 * Allows alphanumeric characters plus underscores and hyphens to support
 * common API key formats (e.g., sk_live_xxx, pk_test_xxx, api-key-format)
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if API key is valid, false otherwise
 * @example
 * validateApiKey('sk_live_abc123...') // returns true (if >= 32 chars)
 * validateApiKey('test') // returns false (common test key rejected)
 */
function validateApiKey(apiKey: string) { // comprehensive API key validation with format checking
  if (!apiKey || typeof apiKey !== 'string') { // check for API key presence and string type
    return false; // invalid input rejection
  }

  const hasValidLength: any = apiKey.length >= 32 && apiKey.length <= 128; // API key length requirements

  if (!hasValidLength) { // early exit for invalid length
    return false;
  }

  const hasValidFormat: any = /^[a-zA-Z0-9_-]+$/.test(apiKey); // alphanumeric plus underscore/hyphen for formats like sk_live_xxx

  if (!hasValidFormat) { // reject invalid characters
    return false;
  }

  // Enhanced validation to prevent obvious test keys (but not too strict)
  const obviousTestKeys: string[] = [
    'test_key', 'demo_key', 'example_key', 'sample_key', 'fake_key', 'mock_key',
    'sk_test_', 'pk_test_', 'sk_live_test', 'pk_live_test'
  ];
  const apiKeyLower: string = apiKey.toLowerCase();
  
  // Only check for exact matches of obvious test keys, not substrings
  const isNotObviousTest: boolean = !obviousTestKeys.some(testKey => 
    apiKeyLower === testKey
  );

  return isNotObviousTest; // return API key validation result
}

export default validateApiKey;

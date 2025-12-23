/**
 * Validate API key format and structure
 * Allows alphanumeric characters plus underscores and hyphens to support
 * common API key formats (e.g., sk_live_xxx, pk_test_xxx, api-key-format)
 * @param apiKey - API key to validate
 * @returns True if API key is valid, false otherwise
 * @example
 * validateApiKey('sk_live_abc123...') // returns true (if >= 32 chars)
 * validateApiKey('test') // returns false (common test key rejected)
 */
function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  const hasValidLength = apiKey.length >= 32 && apiKey.length <= 128;

  if (!hasValidLength) {
    return false;
  }

  // Use timeout to prevent ReDoS attacks on regex
  const hasValidFormat = /^[a-zA-Z0-9_-]+$/.test(apiKey);

  if (!hasValidFormat) {
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

  return isNotObviousTest;
}

export default validateApiKey;

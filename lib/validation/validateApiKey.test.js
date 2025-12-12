const validateApiKey = require('./validateApiKey');

describe('validateApiKey', () => {
  it('should return trimmed API key for valid input', () => {
    expect(validateApiKey('sk-12345', 'OpenAI')).toBe('sk-12345');
    expect(validateApiKey('  api-key-123  ', 'Stripe')).toBe('api-key-123');
  });

  it('should throw for empty string', () => {
    expect(() => validateApiKey('', 'OpenAI')).toThrow('OpenAI API key is required');
  });

  it('should throw for whitespace-only string', () => {
    expect(() => validateApiKey('   ', 'Stripe')).toThrow('Stripe API key is required');
  });

  it('should throw for null', () => {
    expect(() => validateApiKey(null, 'Mailchimp')).toThrow('Mailchimp API key is required');
  });

  it('should throw for undefined', () => {
    expect(() => validateApiKey(undefined, 'AWS')).toThrow('AWS API key is required');
  });

  it('should include service name in error message', () => {
    expect(() => validateApiKey('', 'CustomService')).toThrow('CustomService API key is required');
    expect(() => validateApiKey(null, 'ThirdPartyAPI')).toThrow('ThirdPartyAPI API key is required');
  });

  it('should handle numeric input by converting to string', () => {
    expect(validateApiKey(12345, 'TestService')).toBe('12345');
  });
});

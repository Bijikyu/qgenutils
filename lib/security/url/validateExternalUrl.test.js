const validateExternalUrl = require('./validateExternalUrl');

describe('validateExternalUrl', () => {
  it('should not throw for allowed URLs', () => {
    expect(() => validateExternalUrl('https://api.stripe.com/v1', 'api.stripe.com'))
      .not.toThrow();
  });

  it('should throw for disallowed URLs', () => {
    expect(() => validateExternalUrl('https://evil.com/attack', 'api.stripe.com'))
      .toThrow('URL domain not allowed: evil.com');
  });

  it('should throw for malformed URLs', () => {
    expect(() => validateExternalUrl('not-a-url', 'example.com'))
      .toThrow('Invalid URL format: not-a-url');
  });

  it('should work with wildcard domains', () => {
    expect(() => validateExternalUrl('https://sub.example.com', '*.example.com'))
      .not.toThrow();
    expect(() => validateExternalUrl('https://other.com', '*.example.com'))
      .toThrow('URL domain not allowed: other.com');
  });
});

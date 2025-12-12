const isAllowedExternalUrl = require('./isAllowedExternalUrl');

describe('isAllowedExternalUrl', () => {
  it('should allow exact domain match', () => {
    expect(isAllowedExternalUrl('https://api.stripe.com/v1/charges', 'api.stripe.com')).toBe(true);
    expect(isAllowedExternalUrl('https://example.com/path', 'example.com')).toBe(true);
  });

  it('should allow multiple domains', () => {
    const domains = 'api.stripe.com, api.github.com, api.example.com';
    expect(isAllowedExternalUrl('https://api.stripe.com/v1', domains)).toBe(true);
    expect(isAllowedExternalUrl('https://api.github.com/repos', domains)).toBe(true);
  });

  it('should support wildcard subdomains', () => {
    expect(isAllowedExternalUrl('https://api.example.com/data', '*.example.com')).toBe(true);
    expect(isAllowedExternalUrl('https://mail.example.com', '*.example.com')).toBe(true);
    expect(isAllowedExternalUrl('https://example.com', '*.example.com')).toBe(true);
  });

  it('should reject non-matching domains', () => {
    expect(isAllowedExternalUrl('https://evil.com/attack', 'api.stripe.com')).toBe(false);
    expect(isAllowedExternalUrl('https://api.stripe.com.evil.com', 'api.stripe.com')).toBe(false);
  });

  it('should reject subdomain without wildcard', () => {
    expect(isAllowedExternalUrl('https://sub.example.com', 'example.com')).toBe(false);
  });

  it('should throw for malformed URLs', () => {
    expect(() => isAllowedExternalUrl('not-a-url', 'example.com'))
      .toThrow('Invalid URL format: not-a-url');
  });

  it('should handle whitespace in domain list', () => {
    const domains = '  api.stripe.com  ,  api.github.com  ';
    expect(isAllowedExternalUrl('https://api.stripe.com', domains)).toBe(true);
  });
});

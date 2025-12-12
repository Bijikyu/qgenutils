const buildSafeExternalUrl = require('./buildSafeExternalUrl');

describe('buildSafeExternalUrl', () => {
  it('should build URL with path', () => {
    const result = buildSafeExternalUrl('https://api.example.com', 'v1/users');
    expect(result).toBe('https://api.example.com/v1/users');
  });

  it('should normalize path separators', () => {
    const result = buildSafeExternalUrl('https://api.example.com/', '/api//v1/');
    expect(result).toBe('https://api.example.com/api/v1/');
  });

  it('should prevent directory traversal', () => {
    const result = buildSafeExternalUrl('https://api.example.com', '../../../etc/passwd');
    expect(result).not.toContain('..');
  });

  it('should validate against allowed domains', () => {
    expect(() => buildSafeExternalUrl(
      'https://api.stripe.com', 
      'v1/charges', 
      'api.stripe.com'
    )).not.toThrow();
    
    expect(() => buildSafeExternalUrl(
      'https://evil.com', 
      'attack', 
      'api.stripe.com'
    )).toThrow('URL domain not allowed: evil.com');
  });

  it('should work without allowedDomains', () => {
    const result = buildSafeExternalUrl('https://any.domain.com', 'path');
    expect(result).toBe('https://any.domain.com/path');
  });

  it('should handle URLs with existing paths', () => {
    const result = buildSafeExternalUrl('https://api.example.com/v1', 'users/123');
    expect(result).toBe('https://api.example.com/v1/users/123');
  });
});

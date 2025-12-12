const createBasicAuth = require('./createBasicAuth');

describe('createBasicAuth', () => {
  it('should create auth object with default username', () => {
    const auth = createBasicAuth('my-api-key');
    expect(auth.username).toBe('anystring');
    expect(auth.password).toBe('my-api-key');
  });

  it('should use custom username when provided', () => {
    const auth = createBasicAuth('secret-key', 'api');
    expect(auth.username).toBe('api');
    expect(auth.password).toBe('secret-key');
  });

  it('should handle empty API key', () => {
    const auth = createBasicAuth('');
    expect(auth.username).toBe('anystring');
    expect(auth.password).toBe('');
  });

  it('should handle various username values', () => {
    expect(createBasicAuth('key', 'user123').username).toBe('user123');
    expect(createBasicAuth('key', '').username).toBe('');
    expect(createBasicAuth('key', 'admin@example.com').username).toBe('admin@example.com');
  });
});

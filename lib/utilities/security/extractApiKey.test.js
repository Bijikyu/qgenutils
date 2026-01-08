const { default: extractApiKey } = require('./extractApiKey');

describe('extractApiKey', () => {
  it('should extract from Authorization Bearer header', () => {
    const req = { headers: { authorization: 'Bearer my-secret-key' } };
    expect(extractApiKey(req)).toBe('my-secret-key');
  });

  it('should extract from x-api-key header', () => {
    const req = { headers: { 'x-api-key': 'header-key-123' } };
    expect(extractApiKey(req)).toBe('header-key-123');
  });

  it('should extract from api-key header', () => {
    const req = { headers: { 'api-key': 'alt-header-key' } };
    expect(extractApiKey(req)).toBe('alt-header-key');
  });

  it('should extract from query parameter', () => {
    const req = { headers: {}, query: { api_key: 'query-key-456' } };
    expect(extractApiKey(req)).toBe('query-key-456');
  });

  it('should extract from body when enabled', () => {
    const req = { headers: {}, query: {}, body: { api_key: 'body-key-789' } };
    expect(extractApiKey(req, { checkBody: true })).toBe('body-key-789');
  });

  it('should not extract from body when disabled', () => {
    const req = { headers: {}, query: {}, body: { api_key: 'body-key-789' } };
    expect(extractApiKey(req)).toBeNull();
  });

  it('should prioritize Authorization header over other sources', () => {
    const req = {
      headers: { authorization: 'Bearer bearer-key', 'x-api-key': 'header-key' },
      query: { api_key: 'query-key' }
    };
    expect(extractApiKey(req)).toBe('bearer-key');
  });

  it('should prioritize headers over query params', () => {
    const req = { headers: { 'x-api-key': 'header-key' }, query: { api_key: 'query-key' } };
    expect(extractApiKey(req)).toBe('header-key');
  });

  it('should respect custom header names', () => {
    const req = { headers: { 'my-custom-key': 'custom-value' } };
    expect(extractApiKey(req, { headerNames: ['my-custom-key'] })).toBe('custom-value');
  });

  it('should respect custom query param name', () => {
    const req = { headers: {}, query: { token: 'token-value' } };
    expect(extractApiKey(req, { queryParam: 'token' })).toBe('token-value');
  });

  it('should respect custom auth prefix', () => {
    const req = { headers: { authorization: 'ApiKey secret123' } };
    expect(extractApiKey(req, { authPrefix: 'ApiKey ' })).toBe('secret123');
  });

  it('should trim whitespace from extracted keys', () => {
    const req = { headers: { 'x-api-key': '  spaced-key  ' } };
    expect(extractApiKey(req)).toBe('spaced-key');
  });

  it('should return null for missing key', () => {
    expect(extractApiKey({ headers: {}, query: {} })).toBeNull();
    expect(extractApiKey({ headers: {} })).toBeNull();
    expect(extractApiKey({})).toBeNull();
  });

  it('should return null for invalid request object', () => {
    expect(extractApiKey(null)).toBeNull();
    expect(extractApiKey(undefined)).toBeNull();
    expect(extractApiKey('string')).toBeNull();
  });

  it('should handle empty Authorization header after prefix', () => {
    const req = { headers: { authorization: 'Bearer ' } };
    expect(extractApiKey(req)).toBeNull();
  });

  it('should handle custom body field', () => {
    const req = { headers: {}, query: {}, body: { secret: 'body-secret' } };
    expect(extractApiKey(req, { checkBody: true, bodyField: 'secret' })).toBe('body-secret');
  });
});

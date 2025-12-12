const createJsonHeaders = require('./createJsonHeaders');

describe('createJsonHeaders', () => {
  it('should create headers with Content-Type application/json', () => {
    const headers = createJsonHeaders();
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should merge additional headers', () => {
    const headers = createJsonHeaders({
      'Authorization': 'Bearer token123',
      'X-Custom-Header': 'value'
    });
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer token123');
    expect(headers['X-Custom-Header']).toBe('value');
  });

  it('should allow overriding Content-Type', () => {
    const headers = createJsonHeaders({
      'Content-Type': 'application/xml'
    });
    expect(headers['Content-Type']).toBe('application/xml');
  });

  it('should handle null or undefined additionalHeaders', () => {
    expect(createJsonHeaders(null)['Content-Type']).toBe('application/json');
    expect(createJsonHeaders(undefined)['Content-Type']).toBe('application/json');
  });

  it('should ignore non-object additionalHeaders', () => {
    expect(createJsonHeaders('invalid')['Content-Type']).toBe('application/json');
    expect(createJsonHeaders(123)['Content-Type']).toBe('application/json');
  });
});

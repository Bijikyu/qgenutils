const fromQueryString = require('./fromQueryString');

describe('fromQueryString', () => {
  it('should parse query string to object', () => {
    expect(fromQueryString('a=1&b=hello')).toEqual({ a: '1', b: 'hello' });
  });

  it('should handle leading question mark', () => {
    expect(fromQueryString('?a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('should decode URL-encoded values', () => {
    expect(fromQueryString('q=hello+world')).toEqual({ q: 'hello world' });
    expect(fromQueryString('q=hello%20world')).toEqual({ q: 'hello world' });
  });

  it('should handle empty string', () => {
    expect(fromQueryString('')).toEqual({});
    expect(fromQueryString('?')).toEqual({});
  });

  it('should handle null/undefined', () => {
    expect(fromQueryString(null)).toEqual({});
    expect(fromQueryString(undefined)).toEqual({});
  });

  it('should handle single param', () => {
    expect(fromQueryString('key=value')).toEqual({ key: 'value' });
  });
});

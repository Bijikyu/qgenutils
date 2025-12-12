const toQueryString = require('./toQueryString');

describe('toQueryString', () => {
  it('should convert object to query string', () => {
    const result = toQueryString({ a: 1, b: 'hello' });
    expect(result).toBe('a=1&b=hello');
  });

  it('should URL encode values', () => {
    const result = toQueryString({ q: 'hello world' });
    expect(result).toBe('q=hello+world');
  });

  it('should skip null/undefined values', () => {
    const result = toQueryString({ a: 1, b: null, c: undefined, d: 2 });
    expect(result).toBe('a=1&d=2');
  });

  it('should handle empty object', () => {
    expect(toQueryString({})).toBe('');
  });

  it('should handle null/undefined input', () => {
    expect(toQueryString(null)).toBe('');
    expect(toQueryString(undefined)).toBe('');
  });

  it('should convert non-string values', () => {
    const result = toQueryString({ num: 42, bool: true });
    expect(result).toBe('num=42&bool=true');
  });
});

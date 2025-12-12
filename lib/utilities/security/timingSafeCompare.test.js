const timingSafeCompare = require('./timingSafeCompare');

describe('timingSafeCompare', () => {
  it('should return true for equal strings', () => {
    expect(timingSafeCompare('secret123', 'secret123')).toBe(true);
    expect(timingSafeCompare('', '')).toBe(true);
    expect(timingSafeCompare('a', 'a')).toBe(true);
  });

  it('should return false for different strings', () => {
    expect(timingSafeCompare('secret123', 'secret124')).toBe(false);
    expect(timingSafeCompare('abc', 'abd')).toBe(false);
  });

  it('should return false for different lengths', () => {
    expect(timingSafeCompare('short', 'longer')).toBe(false);
    expect(timingSafeCompare('abc', 'ab')).toBe(false);
  });

  it('should return false for non-string inputs', () => {
    expect(timingSafeCompare(null, 'test')).toBe(false);
    expect(timingSafeCompare('test', null)).toBe(false);
    expect(timingSafeCompare(123, '123')).toBe(false);
    expect(timingSafeCompare(undefined, undefined)).toBe(false);
  });

  it('should handle special characters', () => {
    expect(timingSafeCompare('test!@#$%', 'test!@#$%')).toBe(true);
    expect(timingSafeCompare('key=abc&token=xyz', 'key=abc&token=xyz')).toBe(true);
  });

  it('should handle unicode strings', () => {
    expect(timingSafeCompare('héllo', 'héllo')).toBe(true);
    expect(timingSafeCompare('日本語', '日本語')).toBe(true);
    expect(timingSafeCompare('héllo', 'hello')).toBe(false);
  });
});

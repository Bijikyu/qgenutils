const omit = require('./omit');

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('should ignore non-existent keys', () => {
    const obj = { a: 1, b: 2 };
    expect(omit(obj, ['z'])).toEqual({ a: 1, b: 2 });
  });

  it('should handle empty keys array', () => {
    expect(omit({ a: 1 }, [])).toEqual({ a: 1 });
  });

  it('should handle null/undefined object', () => {
    expect(omit(null, ['a'])).toEqual({});
    expect(omit(undefined, ['a'])).toEqual({});
  });

  it('should handle invalid keys parameter', () => {
    expect(omit({ a: 1 }, null)).toEqual({ a: 1 });
  });
});

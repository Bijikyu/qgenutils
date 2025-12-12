const pick = require('./pick');

describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('should ignore non-existent keys', () => {
    const obj = { a: 1, b: 2 };
    expect(pick(obj, ['a', 'z'])).toEqual({ a: 1 });
  });

  it('should handle empty keys array', () => {
    expect(pick({ a: 1 }, [])).toEqual({});
  });

  it('should handle null/undefined object', () => {
    expect(pick(null, ['a'])).toEqual({});
    expect(pick(undefined, ['a'])).toEqual({});
  });

  it('should handle invalid keys parameter', () => {
    expect(pick({ a: 1 }, null)).toEqual({});
  });
});

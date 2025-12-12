const filterKeys = require('./filterKeys');

describe('filterKeys', () => {
  it('should filter by key', () => {
    const obj = { a: 1, b: 2, ab: 3 };
    const result = filterKeys(obj, key => key.includes('a'));
    expect(result).toEqual({ a: 1, ab: 3 });
  });

  it('should filter by value', () => {
    const obj = { a: 1, b: null, c: 3 };
    const result = filterKeys(obj, (_, value) => value !== null);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should handle empty object', () => {
    expect(filterKeys({}, () => true)).toEqual({});
  });

  it('should handle null/undefined', () => {
    expect(filterKeys(null, () => true)).toEqual({});
    expect(filterKeys(undefined, () => true)).toEqual({});
  });

  it('should handle invalid predicate', () => {
    expect(filterKeys({ a: 1 }, null)).toEqual({ a: 1 });
  });

  it('should filter all out', () => {
    expect(filterKeys({ a: 1, b: 2 }, () => false)).toEqual({});
  });
});

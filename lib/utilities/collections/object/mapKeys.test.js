const mapKeys = require('./mapKeys');

describe('mapKeys', () => {
  it('should transform keys', () => {
    const obj = { a: 1, b: 2 };
    const result = mapKeys(obj, key => key.toUpperCase());
    expect(result).toEqual({ A: 1, B: 2 });
  });

  it('should provide value to mapper', () => {
    const obj = { a: 1, b: 2 };
    const result = mapKeys(obj, (key, value) => `${key}_${value}`);
    expect(result).toEqual({ a_1: 1, b_2: 2 });
  });

  it('should handle empty object', () => {
    expect(mapKeys({}, k => k)).toEqual({});
  });

  it('should handle null/undefined', () => {
    expect(mapKeys(null, k => k)).toEqual({});
    expect(mapKeys(undefined, k => k)).toEqual({});
  });

  it('should handle invalid mapper', () => {
    expect(mapKeys({ a: 1 }, null)).toEqual({ a: 1 });
  });
});

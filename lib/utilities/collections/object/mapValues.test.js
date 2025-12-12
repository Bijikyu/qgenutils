const mapValues = require('./mapValues');

describe('mapValues', () => {
  it('should transform values', () => {
    const obj = { a: 1, b: 2 };
    const result = mapValues(obj, value => value * 2);
    expect(result).toEqual({ a: 2, b: 4 });
  });

  it('should provide key to mapper', () => {
    const obj = { a: 1, b: 2 };
    const result = mapValues(obj, (value, key) => `${key}:${value}`);
    expect(result).toEqual({ a: 'a:1', b: 'b:2' });
  });

  it('should handle empty object', () => {
    expect(mapValues({}, v => v)).toEqual({});
  });

  it('should handle null/undefined', () => {
    expect(mapValues(null, v => v)).toEqual({});
    expect(mapValues(undefined, v => v)).toEqual({});
  });

  it('should handle invalid mapper', () => {
    expect(mapValues({ a: 1 }, null)).toEqual({ a: 1 });
  });
});

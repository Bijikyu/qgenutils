const deepMerge = require('./deepMerge');

describe('deepMerge', () => {
  it('should merge shallow objects', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('should deep merge nested objects', () => {
    const obj1 = { a: { b: 1, c: 2 } };
    const obj2 = { a: { c: 3, d: 4 } };
    
    expect(deepMerge(obj1, obj2)).toEqual({ a: { b: 1, c: 3, d: 4 } });
  });

  it('should override non-object with object', () => {
    expect(deepMerge({ a: 1 }, { a: { b: 2 } })).toEqual({ a: { b: 2 } });
  });

  it('should merge multiple objects', () => {
    expect(deepMerge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should handle empty objects', () => {
    expect(deepMerge({}, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
  });

  it('should handle null/undefined', () => {
    expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 });
  });

  it('should not merge arrays deeply', () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3, 4] })).toEqual({ a: [3, 4] });
  });
});

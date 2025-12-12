const flatten = require('./flatten');

describe('flatten', () => {
  it('should flatten one level deep', () => {
    expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });

  it('should flatten deeply nested', () => {
    expect(flatten([1, [2, [3, [4, 5]]]])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle mixed nesting', () => {
    expect(flatten([1, 2, [3], [[4]], [[[5]]]])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle empty arrays', () => {
    expect(flatten([])).toEqual([]);
    expect(flatten([[], [], []])).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(flatten(null)).toEqual([]);
  });

  it('should preserve non-array elements', () => {
    expect(flatten([1, 'a', [2, 'b']])).toEqual([1, 'a', 2, 'b']);
  });
});

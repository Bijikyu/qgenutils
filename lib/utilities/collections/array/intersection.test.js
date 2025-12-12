const intersection = require('./intersection');

describe('intersection', () => {
  it('should find common elements', () => {
    expect(intersection([1, 2, 3], [2, 3, 4], [3, 4, 5])).toEqual([3]);
  });

  it('should handle two arrays', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  it('should handle no common elements', () => {
    expect(intersection([1, 2], [3, 4])).toEqual([]);
  });

  it('should handle single array', () => {
    expect(intersection([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should handle empty arrays', () => {
    expect(intersection([], [1, 2])).toEqual([]);
    expect(intersection()).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(intersection(null, [1, 2])).toEqual([]);
  });
});

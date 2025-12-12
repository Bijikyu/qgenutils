const take = require('./take');

describe('take', () => {
  it('should take first n elements', () => {
    expect(take([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3]);
  });

  it('should handle n larger than array', () => {
    expect(take([1, 2, 3], 10)).toEqual([1, 2, 3]);
  });

  it('should handle n = 0', () => {
    expect(take([1, 2, 3], 0)).toEqual([]);
  });

  it('should handle negative n', () => {
    expect(take([1, 2, 3], -5)).toEqual([]);
  });

  it('should handle empty array', () => {
    expect(take([], 5)).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(take(null, 3)).toEqual([]);
  });
});

const skip = require('./skip');

describe('skip', () => {
  it('should skip first n elements', () => {
    expect(skip([1, 2, 3, 4, 5], 2)).toEqual([3, 4, 5]);
  });

  it('should handle n larger than array', () => {
    expect(skip([1, 2, 3], 10)).toEqual([]);
  });

  it('should handle n = 0', () => {
    expect(skip([1, 2, 3], 0)).toEqual([1, 2, 3]);
  });

  it('should handle negative n', () => {
    expect(skip([1, 2, 3], -5)).toEqual([1, 2, 3]);
  });

  it('should handle empty array', () => {
    expect(skip([], 5)).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(skip(null, 3)).toEqual([]);
  });
});

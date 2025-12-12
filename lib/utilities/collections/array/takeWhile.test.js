const takeWhile = require('./takeWhile');

describe('takeWhile', () => {
  it('should take while predicate is true', () => {
    expect(takeWhile([1, 2, 3, 4, 5], x => x < 4)).toEqual([1, 2, 3]);
  });

  it('should stop at first false', () => {
    expect(takeWhile([1, 2, 5, 3, 4], x => x < 4)).toEqual([1, 2]);
  });

  it('should handle all passing', () => {
    expect(takeWhile([1, 2, 3], x => x < 10)).toEqual([1, 2, 3]);
  });

  it('should handle all failing', () => {
    expect(takeWhile([1, 2, 3], x => x > 10)).toEqual([]);
  });

  it('should provide index to predicate', () => {
    expect(takeWhile([1, 2, 3, 4, 5], (_, i) => i < 3)).toEqual([1, 2, 3]);
  });

  it('should handle empty array', () => {
    expect(takeWhile([], x => x)).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(takeWhile(null, x => x)).toEqual([]);
  });
});

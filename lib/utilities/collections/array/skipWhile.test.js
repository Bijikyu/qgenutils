const skipWhile = require('./skipWhile');

describe('skipWhile', () => {
  it('should skip while predicate is true', () => {
    expect(skipWhile([1, 2, 3, 4, 5], x => x < 4)).toEqual([4, 5]);
  });

  it('should stop at first false', () => {
    expect(skipWhile([1, 2, 5, 3, 4], x => x < 4)).toEqual([5, 3, 4]);
  });

  it('should handle all passing', () => {
    expect(skipWhile([1, 2, 3], x => x < 10)).toEqual([]);
  });

  it('should handle all failing', () => {
    expect(skipWhile([1, 2, 3], x => x > 10)).toEqual([1, 2, 3]);
  });

  it('should provide index to predicate', () => {
    expect(skipWhile([1, 2, 3, 4, 5], (_, i) => i < 3)).toEqual([4, 5]);
  });

  it('should handle empty array', () => {
    expect(skipWhile([], x => x)).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(skipWhile(null, x => x)).toEqual([]);
  });
});

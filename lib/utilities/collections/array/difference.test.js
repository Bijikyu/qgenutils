const difference = require('./difference');

describe('difference', () => {
  it('should find items not in exclude arrays', () => {
    expect(difference([1, 2, 3, 4, 5], [2, 4])).toEqual([1, 3, 5]);
  });

  it('should handle multiple exclude arrays', () => {
    expect(difference([1, 2, 3, 4, 5], [2], [4])).toEqual([1, 3, 5]);
  });

  it('should handle no exclusions', () => {
    expect(difference([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should handle all excluded', () => {
    expect(difference([1, 2], [1, 2, 3])).toEqual([]);
  });

  it('should handle empty source array', () => {
    expect(difference([], [1, 2])).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(difference(null, [1, 2])).toEqual([]);
  });
});

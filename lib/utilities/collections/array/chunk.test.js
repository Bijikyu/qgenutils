const chunk = require('./chunk');

describe('chunk', () => {
  it('should chunk array evenly', () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it('should handle uneven chunks', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should handle chunk size larger than array', () => {
    expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });

  it('should handle empty array', () => {
    expect(chunk([], 5)).toEqual([]);
  });

  it('should throw on invalid size', () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow('Chunk size must be greater than 0');
    expect(() => chunk([1, 2, 3], -1)).toThrow('Chunk size must be greater than 0');
  });

  it('should handle non-array input', () => {
    expect(chunk(null, 2)).toEqual([]);
  });
});

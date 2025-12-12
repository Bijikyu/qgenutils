const shuffle = require('./shuffle');

describe('shuffle', () => {
  it('should return array with same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should not mutate original array', () => {
    const original = [1, 2, 3, 4, 5];
    shuffle(original);
    
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('should handle single element', () => {
    expect(shuffle([1])).toEqual([1]);
  });

  it('should handle non-array input', () => {
    expect(shuffle(null)).toEqual([]);
  });

  it('should produce different orderings (statistical)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set();
    
    for (let i = 0; i < 20; i++) {
      results.add(JSON.stringify(shuffle(original)));
    }
    
    expect(results.size).toBeGreaterThan(1);
  });
});

const unique = require('./unique');

describe('unique', () => {
  it('should deduplicate primitives', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('should deduplicate by key function', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice Copy' }
    ];
    
    const result = unique(items, item => item.id);
    
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]);
  });

  it('should handle empty array', () => {
    expect(unique([])).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(unique(null)).toEqual([]);
    expect(unique(undefined)).toEqual([]);
  });

  it('should preserve order', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });
});

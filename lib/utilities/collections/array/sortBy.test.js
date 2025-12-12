const sortBy = require('./sortBy');

describe('sortBy', () => {
  it('should sort by single criterion', () => {
    const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
    const result = sortBy(items, x => x.name);
    
    expect(result.map(x => x.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should sort by multiple criteria', () => {
    const items = [
      { role: 'admin', name: 'Bob' },
      { role: 'user', name: 'Alice' },
      { role: 'admin', name: 'Alice' }
    ];
    
    const result = sortBy(items, x => x.role, x => x.name);
    
    expect(result).toEqual([
      { role: 'admin', name: 'Alice' },
      { role: 'admin', name: 'Bob' },
      { role: 'user', name: 'Alice' }
    ]);
  });

  it('should not mutate original array', () => {
    const original = [3, 1, 2];
    const result = sortBy(original, x => x);
    
    expect(result).toEqual([1, 2, 3]);
    expect(original).toEqual([3, 1, 2]);
  });

  it('should handle empty array', () => {
    expect(sortBy([], x => x)).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(sortBy(null, x => x)).toEqual([]);
  });

  it('should handle no criteria', () => {
    const arr = [3, 1, 2];
    expect(sortBy(arr)).toEqual([3, 1, 2]);
  });
});

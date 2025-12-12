const groupBy = require('./groupBy');

describe('groupBy', () => {
  it('should group by key function', () => {
    const items = [
      { name: 'Alice', role: 'admin' },
      { name: 'Bob', role: 'user' },
      { name: 'Charlie', role: 'admin' }
    ];
    
    const result = groupBy(items, item => item.role);
    
    expect(result).toEqual({
      admin: [{ name: 'Alice', role: 'admin' }, { name: 'Charlie', role: 'admin' }],
      user: [{ name: 'Bob', role: 'user' }]
    });
  });

  it('should handle empty array', () => {
    expect(groupBy([], x => x)).toEqual({});
  });

  it('should handle non-array input', () => {
    expect(groupBy(null, x => x)).toEqual({});
    expect(groupBy(undefined, x => x)).toEqual({});
  });

  it('should throw for missing key function', () => {
    expect(() => groupBy([1, 2, 3])).toThrow('groupBy requires a key function');
    expect(() => groupBy([1, 2, 3], null)).toThrow('groupBy requires a key function');
  });

  it('should group primitives', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const result = groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd');
    
    expect(result).toEqual({
      odd: [1, 3, 5],
      even: [2, 4, 6]
    });
  });
});

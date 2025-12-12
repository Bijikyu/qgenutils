const partition = require('./partition');

describe('partition', () => {
  it('should partition by predicate', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const [evens, odds] = partition(numbers, n => n % 2 === 0);
    
    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  it('should handle empty array', () => {
    const [pass, fail] = partition([], x => x);
    expect(pass).toEqual([]);
    expect(fail).toEqual([]);
  });

  it('should handle all passing', () => {
    const [pass, fail] = partition([1, 2, 3], () => true);
    expect(pass).toEqual([1, 2, 3]);
    expect(fail).toEqual([]);
  });

  it('should handle all failing', () => {
    const [pass, fail] = partition([1, 2, 3], () => false);
    expect(pass).toEqual([]);
    expect(fail).toEqual([1, 2, 3]);
  });

  it('should handle non-array input', () => {
    expect(partition(null, x => x)).toEqual([[], []]);
  });
});

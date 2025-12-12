const memoize = require('./memoize');

describe('memoize', () => {
  it('should cache results', () => {
    let callCount = 0;
    const fn = (x) => { callCount++; return x * 2; };
    const memoized = memoize(fn);
    
    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);
    expect(callCount).toBe(1);
  });

  it('should differentiate by arguments', () => {
    let callCount = 0;
    const fn = (x) => { callCount++; return x * 2; };
    const memoized = memoize(fn);
    
    expect(memoized(5)).toBe(10);
    expect(memoized(10)).toBe(20);
    expect(callCount).toBe(2);
  });

  it('should handle multiple arguments', () => {
    const fn = (a, b) => a + b;
    const memoized = memoize(fn);
    
    expect(memoized(1, 2)).toBe(3);
    expect(memoized(1, 2)).toBe(3);
    expect(memoized(2, 1)).toBe(3);
  });

  it('should respect maxSize limit', () => {
    let callCount = 0;
    const fn = (x) => { callCount++; return x; };
    const memoized = memoize(fn, 2);
    
    memoized(1);
    memoized(2);
    memoized(3);
    
    memoized(3);
    memoized(2);
    expect(callCount).toBe(3);
    
    memoized(1);
    expect(callCount).toBe(4);
  });

  it('should work with object arguments', () => {
    let callCount = 0;
    const fn = (obj) => { callCount++; return obj.a + obj.b; };
    const memoized = memoize(fn);
    
    expect(memoized({ a: 1, b: 2 })).toBe(3);
    expect(memoized({ a: 1, b: 2 })).toBe(3);
    expect(callCount).toBe(1);
  });
});

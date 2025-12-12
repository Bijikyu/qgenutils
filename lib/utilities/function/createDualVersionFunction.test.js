const createDualVersionFunction = require('./createDualVersionFunction');

describe('createDualVersionFunction', () => {
  it('should call function with spread arguments', () => {
    const fn = createDualVersionFunction((a, b) => a + b);
    expect(fn(2, 3)).toBe(5);
  });

  it('should call function with single object argument', () => {
    const fn = createDualVersionFunction((obj) => obj.a + obj.b);
    expect(fn({ a: 2, b: 3 })).toBe(5);
  });

  it('should detect object mode when single object argument', () => {
    const fn = createDualVersionFunction((input) => input);
    const obj = { key: 'value' };
    expect(fn(obj)).toEqual(obj);
  });

  it('should use spread mode for multiple arguments', () => {
    const fn = createDualVersionFunction((...args) => args);
    expect(fn(1, 2, 3)).toEqual([1, 2, 3]);
  });

  it('should use spread mode for array argument', () => {
    const fn = createDualVersionFunction((arr) => arr);
    const arr = [1, 2, 3];
    expect(fn(arr)).toEqual(arr);
  });

  it('should use spread mode for null argument', () => {
    const fn = createDualVersionFunction((val) => val);
    expect(fn(null)).toBe(null);
  });

  it('should provide fromObject method', () => {
    const fn = createDualVersionFunction((obj) => obj.x * 2);
    expect(fn.fromObject({ x: 5 })).toBe(10);
  });

  it('should provide unwrap property with original function', () => {
    const original = (a, b) => a * b;
    const fn = createDualVersionFunction(original);
    expect(fn.unwrap).toBe(original);
    expect(fn.unwrap(3, 4)).toBe(12);
  });

  it('should work with no arguments', () => {
    const fn = createDualVersionFunction(() => 'result');
    expect(fn()).toBe('result');
  });

  it('should work with primitive arguments', () => {
    const fn = createDualVersionFunction((str) => str.toUpperCase());
    expect(fn('hello')).toBe('HELLO');
  });

  it('should handle nested objects', () => {
    const fn = createDualVersionFunction((obj) => obj.nested.value);
    expect(fn({ nested: { value: 42 } })).toBe(42);
  });
});

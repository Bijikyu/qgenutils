const getNestedValue = require('./getNestedValue');

describe('getNestedValue', () => {
  it('should get shallow property', () => {
    expect(getNestedValue({ a: 1 }, 'a', null)).toBe(1);
  });

  it('should get nested property', () => {
    const obj = { user: { address: { city: 'NYC' } } };
    expect(getNestedValue(obj, 'user.address.city', null)).toBe('NYC');
  });

  it('should return default for missing path', () => {
    expect(getNestedValue({ a: 1 }, 'b', 'default')).toBe('default');
    expect(getNestedValue({ a: 1 }, 'a.b.c', 'default')).toBe('default');
  });

  it('should handle null in path', () => {
    const obj = { a: { b: null } };
    expect(getNestedValue(obj, 'a.b.c', 'default')).toBe('default');
  });

  it('should handle null/undefined object', () => {
    expect(getNestedValue(null, 'a', 'default')).toBe('default');
    expect(getNestedValue(undefined, 'a', 'default')).toBe('default');
  });

  it('should return undefined values', () => {
    const obj = { a: undefined };
    expect(getNestedValue(obj, 'a', 'default')).toBe('default');
  });
});

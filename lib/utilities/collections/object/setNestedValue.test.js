const setNestedValue = require('./setNestedValue');

describe('setNestedValue', () => {
  it('should set shallow property', () => {
    const obj = { a: 1 };
    setNestedValue(obj, 'b', 2);
    expect(obj).toEqual({ a: 1, b: 2 });
  });

  it('should set nested property', () => {
    const obj = { user: {} };
    setNestedValue(obj, 'user.address.city', 'NYC');
    expect(obj.user.address.city).toBe('NYC');
  });

  it('should create intermediate objects', () => {
    const obj = {};
    setNestedValue(obj, 'a.b.c', 'value');
    expect(obj).toEqual({ a: { b: { c: 'value' } } });
  });

  it('should overwrite non-object intermediate', () => {
    const obj = { a: 'string' };
    setNestedValue(obj, 'a.b', 'value');
    expect(obj).toEqual({ a: { b: 'value' } });
  });

  it('should handle null/undefined object', () => {
    expect(() => setNestedValue(null, 'a', 1)).not.toThrow();
    expect(() => setNestedValue(undefined, 'a', 1)).not.toThrow();
  });
});

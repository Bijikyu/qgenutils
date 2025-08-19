const hasMethod = require('./hasMethod');

describe('hasMethod', () => {
  test('should return true when object has the specified method', () => {
    const obj = { testMethod: () => {} };
    expect(hasMethod(obj, 'testMethod')).toBe(true);
  });

  test('should return false when object does not have the method', () => {
    const obj = { prop: 'value' };
    expect(hasMethod(obj, 'testMethod')).toBe(false);
  });

  test('should return false for non-objects', () => {
    expect(hasMethod(null, 'method')).toBe(false);
    expect(hasMethod(undefined, 'method')).toBe(false);
    expect(hasMethod('string', 'method')).toBe(false);
    expect(hasMethod(123, 'method')).toBe(false);
  });

  test('should return false when method name is not a string', () => {
    const obj = { testMethod: () => {} };
    expect(hasMethod(obj, null)).toBe(false);
    expect(hasMethod(obj, undefined)).toBe(false);
    expect(hasMethod(obj, 123)).toBe(false);
  });
});
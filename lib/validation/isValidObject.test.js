const isValidObject = require('./isValidObject');

describe('isValidObject', () => {
  test('should return true for plain objects', () => {
    expect(isValidObject({})).toBe(true);
    expect(isValidObject({ key: 'value' })).toBe(true);
    expect(isValidObject({ nested: { object: true } })).toBe(true);
  });

  test('should return false for arrays', () => {
    expect(isValidObject([])).toBe(false);
    expect(isValidObject(['item'])).toBe(false);
  });

  test('should return false for null and undefined', () => {
    expect(isValidObject(null)).toBe(false);
    expect(isValidObject(undefined)).toBe(false);
  });

  test('should return false for primitives', () => {
    expect(isValidObject('string')).toBe(false);
    expect(isValidObject(123)).toBe(false);
    expect(isValidObject(true)).toBe(false);
  });

  test('should return false for functions', () => {
    expect(isValidObject(() => {})).toBe(false);
    expect(isValidObject(function() {})).toBe(false);
  });
});
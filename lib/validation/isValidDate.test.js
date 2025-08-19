const isValidDate = require('./isValidDate');

describe('isValidDate', () => {
  test('should return true for valid Date objects', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('2023-01-01'))).toBe(true);
    expect(isValidDate(new Date(2023, 0, 1))).toBe(true);
  });

  test('should return false for invalid Date objects', () => {
    expect(isValidDate(new Date('invalid'))).toBe(false);
    expect(isValidDate(new Date(''))).toBe(false);
  });

  test('should return false for non-Date values', () => {
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate('2023-01-01')).toBe(false);
    expect(isValidDate(1234567890)).toBe(false);
    expect(isValidDate({})).toBe(false);
    expect(isValidDate([])).toBe(false);
  });

  test('should handle edge cases', () => {
    expect(isValidDate(new Date(0))).toBe(true); // Unix epoch
    expect(isValidDate(new Date('1970-01-01T00:00:00.000Z'))).toBe(true);
  });
});
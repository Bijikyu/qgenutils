// 🔗 Tests: isValidDate → date validation → invalid date detection
/**
 * Tests for isValidDate validation utility
 * 
 * This test suite verifies that the shared date validation utility works correctly
 * and provides consistent behavior across all datetime utilities that use it.
 */

const isValidDate = require('./isValidDate`);

describe('isValidDate', () => {
  describe('Valid Date Objects', () => {
    test('should return true for valid Date objects', () => {
      const validDate = new Date('2023-01-01`);
      expect(isValidDate(validDate)).toBe(true);
    });

    test('should return true for current date', () => {
      const now = new Date();
      expect(isValidDate(now)).toBe(true);
    });

    test('should return true for epoch date', () => {
      const epoch = new Date(0);
      expect(isValidDate(epoch)).toBe(true);
    });

    test('should return true for future dates', () => {
      const futureDate = new Date('2025-12-31`);
      expect(isValidDate(futureDate)).toBe(true);
    });
  });

  describe('Invalid Date Objects', () => {
    test('should return false for invalid Date objects', () => {
      const invalidDate = new Date('invalid-date-string`);
      expect(isValidDate(invalidDate)).toBe(false);
    });

    test('should return false for Date constructed with NaN', () => {
      const nanDate = new Date(NaN);
      expect(isValidDate(nanDate)).toBe(false);
    });

    test('should return false for Date with invalid string', () => {
      const badDate = new Date('not-a-date`);
      expect(isValidDate(badDate)).toBe(false);
    });
  });

  describe('Non-Date Inputs', () => {
    test('should return false for null', () => {
      expect(isValidDate(null)).toBe(false);
    });

    test('should return false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    test('should return false for strings', () => {
      expect(isValidDate('2023-01-01')).toBe(false);
    });

    test('should return false for numbers', () => {
      expect(isValidDate(1234567890)).toBe(false);
    });

    test('should return false for objects', () => {
      expect(isValidDate({})).toBe(false);
    });

    test('should return false for arrays', () => {
      expect(isValidDate([])).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle Date objects that throw errors gracefully', () => {
      // Create a Date-like object that might cause issues
      const fakeDate = {
        constructor: Date,
        getTime: () => { throw new Error('Test error'); },
        toString: () => 'Wed Jan 01 2023'
      };
      
      expect(isValidDate(fakeDate)).toBe(false);
    });

    test('should return false for Date prototype', () => {
      expect(isValidDate(Date.prototype)).toBe(false);
    });
  });
});
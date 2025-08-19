const formatDate = require('./formatDate');
const formatDateTime = require('./formatDateTime');
const formatDuration = require('./formatDuration');
const addDays = require('./addDays');

describe('DateTime Utilities', () => {
  describe('formatDate', () => {
    test('should format valid dates', () => {
      const testDate = new Date('2023-01-01');
      const result = formatDate(testDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
      expect(formatDate('invalid')).toBe('N/A');
    });
  });

  describe('formatDateTime', () => {
    test('should format valid datetime', () => {
      const testDate = new Date('2023-01-01T12:00:00Z');
      const result = formatDateTime(testDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDuration', () => {
    test('should format duration in milliseconds', () => {
      expect(formatDuration(1000)).toBeDefined();
      expect(formatDuration(60000)).toBeDefined();
      expect(formatDuration(3600000)).toBeDefined();
    });
  });

  describe('addDays', () => {
    test('should add days to date', () => {
      const testDate = new Date('2023-01-01');
      const result = addDays(testDate, 7);
      expect(result instanceof Date).toBe(true);
      expect(result.getDate()).toBe(8);
    });
  });
});
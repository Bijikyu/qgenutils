const { default: formatDate } = require('./formatDate');
const { default: formatDateTime } = require('./formatDateTime');
const { default: formatDuration } = require('./formatDuration');
const { default: addDays } = require('./addDays');

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
      expect(result.original).toBe(testDate);
      expect(result.formatted).toBeDefined();
      expect(result.timestamp).toBe(testDate.getTime());
      expect(result.error).toBeUndefined();
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
    test('should add days to current date', () => {
      const result = addDays(7);
      expect(result instanceof Date).toBe(true);
      
      // Calculate expected date (current date + 7 days)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 7);
      
      expect(result.getDate()).toBe(expectedDate.getDate());
      expect(result.getMonth()).toBe(expectedDate.getMonth());
      expect(result.getFullYear()).toBe(expectedDate.getFullYear());
    });
    
    test('should use default 90 days when no parameter provided', () => {
      const result = addDays();
      expect(result instanceof Date).toBe(true);
      
      // Calculate expected date (current date + 90 days)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 90);
      
      expect(result.getDate()).toBe(expectedDate.getDate());
      expect(result.getMonth()).toBe(expectedDate.getMonth());
      expect(result.getFullYear()).toBe(expectedDate.getFullYear());
    });
  });
});

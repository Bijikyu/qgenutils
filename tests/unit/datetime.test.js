
// Unit tests verifying date/time formatting helpers handle diverse inputs and
// edge cases without throwing unexpected errors.
const { formatDateTime, formatDuration } = require('../../lib/datetime');

describe('DateTime Utilities', () => { // ensures date helpers handle real-world formats
  describe('formatDateTime', () => { // validates fallback when dates are invalid
    // verifies should format valid ISO date string
    test('should format valid ISO date string', () => {
      const isoDate = '2023-12-25T10:30:00.000Z';
      const result = formatDateTime(isoDate);
      expect(result).toMatch(/12\/25\/2023|25\/12\/2023/); // Locale-dependent format
    });

    // verifies should return "N/A" for empty string
    test('should return "N/A" for empty string', () => {
      expect(formatDateTime('')).toBe('N/A'); // empty string yields fallback value
    });

    // verifies should return "N/A" for null input
    test('should return "N/A" for null input', () => {
      expect(formatDateTime(null)).toBe('N/A'); // null should produce N/A
    });

    // verifies should return "N/A" for undefined input
    test('should return "N/A" for undefined input', () => {
      expect(formatDateTime(undefined)).toBe('N/A'); // undefined should produce N/A
    });

    // verifies should return "N/A" for invalid date string
    test('should return "N/A" for invalid date string', () => {
      expect(formatDateTime('invalid-date')).toBe('N/A'); // invalid date string triggers fallback
    });

    // verifies should handle different ISO formats
    test('should handle different ISO formats', () => {
      const formats = [
        '2023-12-25T10:30:00Z',
        '2023-12-25T10:30:00.000Z',
        '2023-12-25T10:30:00+00:00'
      ];
      
      formats.forEach(format => {
        const result = formatDateTime(format);
        expect(result).not.toBe('N/A'); // each format should produce valid string
        expect(typeof result).toBe('string'); // confirm return type
      });
    });
  });

  describe('formatDuration', () => { // checks duration math across scenarios
    // verifies should calculate duration between two valid dates
    test('should calculate duration between two valid dates', () => {
      const start = '2023-12-25T10:00:00.000Z';
      const end = '2023-12-25T11:30:45.000Z';
      expect(formatDuration(start, end)).toBe('01:30:45'); // computed difference should match
    });

    // verifies should calculate duration from start to now when end is not provided
    test('should calculate duration from start to now when end is not provided', () => {
      const start = new Date(Date.now() - 3661000).toISOString(); // 1 hour, 1 minute, 1 second ago
      const result = formatDuration(start);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/); // should return h:m:s pattern
    });

    // verifies should return "00:00:00" for empty start date
    test('should return "00:00:00" for empty start date', () => {
      expect(formatDuration('')).toBe('00:00:00'); // empty input yields zeros
    });

    // verifies should return "00:00:00" for null start date
    test('should return "00:00:00" for null start date', () => {
      expect(formatDuration(null)).toBe('00:00:00'); // null start treated as 0 duration
    });

    // verifies should handle same start and end dates
    test('should handle same start and end dates', () => {
      const date = '2023-12-25T10:00:00.000Z';
      expect(formatDuration(date, date)).toBe('00:00:00'); // same start and end produce zero duration
    });

    // verifies should handle end date before start date (absolute difference)
    test('should handle end date before start date (absolute difference)', () => {
      const start = '2023-12-25T11:00:00.000Z';
      const end = '2023-12-25T10:00:00.000Z';
      expect(formatDuration(start, end)).toBe('01:00:00'); // negative duration handled as absolute
    });

    // verifies should throw error for invalid start date
    test('should throw error for invalid start date', () => {
      expect(() => formatDuration('invalid-date')).toThrow(); // invalid start date should throw
    });

    // verifies should throw error for invalid end date
    test('should throw error for invalid end date', () => {
      const start = '2023-12-25T10:00:00.000Z';
      expect(() => formatDuration(start, 'invalid-date')).toThrow(); // invalid end date should throw
    });

    // verifies should format durations correctly with zero padding
    test('should format durations correctly with zero padding', () => {
      const start = '2023-12-25T10:00:00.000Z';
      const end = '2023-12-25T10:05:03.000Z';
      expect(formatDuration(start, end)).toBe('00:05:03'); // verify zero padding for each unit
    });
  });
});

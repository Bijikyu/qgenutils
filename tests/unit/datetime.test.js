
const { formatDateTime, formatDuration } = require('../../lib/datetime');

describe('DateTime Utilities', () => {
  describe('formatDateTime', () => {
    // verifies should format valid ISO date string
    test('should format valid ISO date string', () => {
      const isoDate = '2023-12-25T10:30:00.000Z'; // sample valid date
      const result = formatDateTime(isoDate); // convert to locale string
      expect(result).toMatch(/12\/25\/2023|25\/12\/2023/); // Locale-dependent format
    });

    // verifies should return "N/A" for empty string
    test('should return "N/A" for empty string', () => {
      expect(formatDateTime('')).toBe('N/A'); // empty input yields fallback
    });

    // verifies should return "N/A" for null input
    test('should return "N/A" for null input', () => {
      expect(formatDateTime(null)).toBe('N/A'); // null input handled gracefully
    });

    // verifies should return "N/A" for undefined input
    test('should return "N/A" for undefined input', () => {
      expect(formatDateTime(undefined)).toBe('N/A'); // undefined treated as invalid
    });

    // verifies should return "N/A" for invalid date string
    test('should return "N/A" for invalid date string', () => {
      expect(formatDateTime('invalid-date')).toBe('N/A'); // invalid string returns fallback
    });

    // verifies should handle different ISO formats
    test('should handle different ISO formats', () => {
      const formats = [
        '2023-12-25T10:30:00Z', // compact ISO
        '2023-12-25T10:30:00.000Z', // milliseconds included
        '2023-12-25T10:30:00+00:00' // explicit offset
      ];
      
      formats.forEach(format => {
        const result = formatDateTime(format); // should handle each format
        expect(result).not.toBe('N/A'); // ensure no fallback
        expect(typeof result).toBe('string'); // returns string always
      });
    });
  });

  describe('formatDuration', () => {
    // verifies should calculate duration between two valid dates
    test('should calculate duration between two valid dates', () => {
      const start = '2023-12-25T10:00:00.000Z'; // begin time
      const end = '2023-12-25T11:30:45.000Z'; // end time 1h30m45s later
      expect(formatDuration(start, end)).toBe('01:30:45'); // duration string
    });

    // verifies should calculate duration from start to now when end is not provided
    test('should calculate duration from start to now when end is not provided', () => {
      const start = new Date(Date.now() - 3661000).toISOString(); // 1 hour,1min,1sec ago
      const result = formatDuration(start); // uses now as end date
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/); // matches HH:MM:SS
    });

    // verifies should return "00:00:00" for empty start date
    test('should return "00:00:00" for empty start date', () => {
      expect(formatDuration('')).toBe('00:00:00'); // empty start results zero duration
    });

    // verifies should return "00:00:00" for null start date
    test('should return "00:00:00" for null start date', () => {
      expect(formatDuration(null)).toBe('00:00:00'); // null handled same as empty
    });

    // verifies should handle same start and end dates
    test('should handle same start and end dates', () => {
      const date = '2023-12-25T10:00:00.000Z'; // identical times
      expect(formatDuration(date, date)).toBe('00:00:00'); // zero difference
    });

    // verifies should handle end date before start date (absolute difference)
    test('should handle end date before start date (absolute difference)', () => {
      const start = '2023-12-25T11:00:00.000Z';
      const end = '2023-12-25T10:00:00.000Z'; // earlier end
      expect(formatDuration(start, end)).toBe('01:00:00'); // absolute difference
    });

    // verifies should throw error for invalid start date
    test('should throw error for invalid start date', () => {
      expect(() => formatDuration('invalid-date')).toThrow(); // start must be valid
    });

    // verifies should throw error for invalid end date
    test('should throw error for invalid end date', () => {
      const start = '2023-12-25T10:00:00.000Z'; // valid start
      expect(() => formatDuration(start, 'invalid-date')).toThrow(); // invalid end triggers error
    });

    // verifies should format durations correctly with zero padding
    test('should format durations correctly with zero padding', () => {
      const start = '2023-12-25T10:00:00.000Z';
      const end = '2023-12-25T10:05:03.000Z';
      expect(formatDuration(start, end)).toBe('00:05:03'); // check zero padding
    });
  });
});

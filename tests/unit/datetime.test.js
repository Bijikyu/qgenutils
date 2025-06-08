
const { formatDateTime, formatDuration } = require('../../lib/datetime');

describe('DateTime Utilities', () => {
  describe('formatDateTime', () => {
    test('should format valid ISO date string', () => {
      const isoDate = '2023-12-25T10:30:00.000Z';
      const result = formatDateTime(isoDate);
      expect(result).toMatch(/12\/25\/2023|25\/12\/2023/); // Locale-dependent format
    });

    test('should return "N/A" for empty string', () => {
      expect(formatDateTime('')).toBe('N/A');
    });

    test('should return "N/A" for null input', () => {
      expect(formatDateTime(null)).toBe('N/A');
    });

    test('should return "N/A" for undefined input', () => {
      expect(formatDateTime(undefined)).toBe('N/A');
    });

    test('should return "N/A" for invalid date string', () => {
      expect(formatDateTime('invalid-date')).toBe('N/A');
    });

    test('should handle different ISO formats', () => {
      const formats = [
        '2023-12-25T10:30:00Z',
        '2023-12-25T10:30:00.000Z',
        '2023-12-25T10:30:00+00:00'
      ];
      
      formats.forEach(format => {
        const result = formatDateTime(format);
        expect(result).not.toBe('N/A');
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('formatDuration', () => {
    test('should calculate duration between two valid dates', () => {
      const start = '2023-12-25T10:00:00.000Z';
      const end = '2023-12-25T11:30:45.000Z';
      expect(formatDuration(start, end)).toBe('01:30:45');
    });

    test('should calculate duration from start to now when end is not provided', () => {
      const start = new Date(Date.now() - 3661000).toISOString(); // 1 hour, 1 minute, 1 second ago
      const result = formatDuration(start);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    test('should return "00:00:00" for empty start date', () => {
      expect(formatDuration('')).toBe('00:00:00');
    });

    test('should return "00:00:00" for null start date', () => {
      expect(formatDuration(null)).toBe('00:00:00');
    });

    test('should handle same start and end dates', () => {
      const date = '2023-12-25T10:00:00.000Z';
      expect(formatDuration(date, date)).toBe('00:00:00');
    });

    test('should handle end date before start date (absolute difference)', () => {
      const start = '2023-12-25T11:00:00.000Z';
      const end = '2023-12-25T10:00:00.000Z';
      expect(formatDuration(start, end)).toBe('01:00:00');
    });

    test('should throw error for invalid start date', () => {
      expect(() => formatDuration('invalid-date')).toThrow();
    });

    test('should throw error for invalid end date', () => {
      const start = '2023-12-25T10:00:00.000Z';
      expect(() => formatDuration(start, 'invalid-date')).toThrow();
    });

    test('should format durations correctly with zero padding', () => {
      const start = '2023-12-25T10:00:00.000Z';
      const end = '2023-12-25T10:05:03.000Z';
      expect(formatDuration(start, end)).toBe('00:05:03');
    });
  });
});

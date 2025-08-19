
// Unit tests verifying date/time formatting helpers and date arithmetic functions
// handle diverse inputs and edge cases without throwing unexpected errors.
const { formatDateTime, formatDuration, addDays } = require('../datetime`);

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

  describe('addDays', () => { // validates date arithmetic for business logic
    
    // verifies should add default 90 days when no parameter provided
    test('should add default 90 days when no parameter provided', () => {
      const result = addDays();
      const today = new Date();
      const expected = new Date(today);
      expected.setDate(today.getDate() + 90);
      
      expect(result).toBeInstanceOf(Date); // returns Date object
      expect(result.getDate()).toBe(expected.getDate()); // correct day
      expect(result.getMonth()).toBe(expected.getMonth()); // correct month
      expect(result.getFullYear()).toBe(expected.getFullYear()); // correct year
    });

    // verifies should add specified number of days
    test('should add specified number of days', () => {
      const testCases = [1, 7, 30, 365];
      
      testCases.forEach(days => {
        const result = addDays(days);
        const today = new Date();
        const expected = new Date(today);
        expected.setDate(today.getDate() + days);
        
        expect(result.getDate()).toBe(expected.getDate()); // correct day for ${days} days
        expect(result.getMonth()).toBe(expected.getMonth()); // correct month for ${days} days
        expect(result.getFullYear()).toBe(expected.getFullYear()); // correct year for ${days} days
      });
    });

    // verifies should handle negative days (past dates)
    test('should handle negative days (past dates)', () => {
      const result = addDays(-7);
      const today = new Date();
      const expected = new Date(today);
      expected.setDate(today.getDate() - 7);
      
      expect(result).toBeInstanceOf(Date); // returns Date object
      expect(result.getDate()).toBe(expected.getDate()); // correct past day
      expect(result.getMonth()).toBe(expected.getMonth()); // correct past month
      expect(result.getFullYear()).toBe(expected.getFullYear()); // correct past year
    });

    // verifies should handle zero days (current date)
    test('should handle zero days (current date)', () => {
      const result = addDays(0);
      const today = new Date();
      
      expect(result).toBeInstanceOf(Date); // returns Date object
      expect(result.getDate()).toBe(today.getDate()); // same day
      expect(result.getMonth()).toBe(today.getMonth()); // same month
      expect(result.getFullYear()).toBe(today.getFullYear()); // same year
    });

    // verifies should handle month boundaries correctly
    test('should handle month boundaries correctly', () => {
      // Mock Date to test specific boundary conditions
      const originalDate = Date;
      global.Date = jest.fn(() => new originalDate('2023-01-31T10:00:00.000Z'));
      global.Date.prototype = originalDate.prototype;
      
      const result = addDays(1);
      
      // January 31 + 1 day should be February 1
      expect(result.getDate()).toBe(1); // February 1st
      expect(result.getMonth()).toBe(1); // February (0-indexed)
      expect(result.getFullYear()).toBe(2023); // same year
      
      // Restore original Date
      global.Date = originalDate;
    });

    // verifies should handle year boundaries correctly
    test('should handle year boundaries correctly', () => {
      // Mock Date to test year boundary
      const originalDate = Date;
      global.Date = jest.fn(() => new originalDate('2023-12-31T10:00:00.000Z'));
      global.Date.prototype = originalDate.prototype;
      
      const result = addDays(1);
      
      // December 31 + 1 day should be January 1 of next year
      expect(result.getDate()).toBe(1); // January 1st
      expect(result.getMonth()).toBe(0); // January (0-indexed)
      expect(result.getFullYear()).toBe(2024); // next year
      
      // Restore original Date
      global.Date = originalDate;
    });

    // verifies should preserve time component
    test('should preserve time component', () => {
      // Mock Date with specific time
      const originalDate = Date;
      global.Date = jest.fn(() => new originalDate('2023-06-15T14:30:45.123Z'));
      global.Date.prototype = originalDate.prototype;
      
      const result = addDays(5);
      
      expect(result.getHours()).toBe(14); // preserved hour
      expect(result.getMinutes()).toBe(30); // preserved minute
      expect(result.getSeconds()).toBe(45); // preserved second
      expect(result.getMilliseconds()).toBe(123); // preserved millisecond
      
      // Restore original Date
      global.Date = originalDate;
    });

    // verifies should handle invalid input gracefully
    test('should handle invalid input gracefully', () => {
      const invalidInputs = ['string', null, undefined, NaN, Infinity, -Infinity, {}];
      
      invalidInputs.forEach(input => {
        const result = addDays(input);
        expect(result).toBeInstanceOf(Date); // always returns Date object
        expect(isNaN(result.getTime())).toBe(false); // result is valid date
        
        // Should use default 90 days for invalid input
        const today = new Date();
        const expected = new Date(today);
        expected.setDate(today.getDate() + 90);
        
        const timeDiff = Math.abs(result.getTime() - expected.getTime());
        expect(timeDiff).toBeLessThan(1000); // within 1 second (accounting for execution time)
      });
    });

    // verifies should handle large day values
    test('should handle large day values', () => {
      const largeDays = 1000;
      const result = addDays(largeDays);
      const today = new Date();
      const expected = new Date(today);
      expected.setDate(today.getDate() + largeDays);
      
      expect(result).toBeInstanceOf(Date); // returns Date object
      expect(result.getFullYear()).toBeGreaterThan(today.getFullYear()); // future year
      expect(isNaN(result.getTime())).toBe(false); // valid date
    });

    // verifies should return new Date object (immutability)
    test('should return new Date object (immutability)', () => {
      const before = new Date();
      const result = addDays(30);
      const after = new Date();
      
      expect(result).toBeInstanceOf(Date); // returns Date object
      expect(result).not.toBe(before); // different object reference
      expect(result).not.toBe(after); // different object reference
      expect(result.getTime()).toBeGreaterThan(before.getTime()); // future date
    });

    // verifies should work with typical business scenarios
    test('should work with typical business scenarios', () => {
      // Credit expiration scenarios
      const creditExpiration = addDays(90);
      const trialExpiration = addDays(30);
      const annualExpiration = addDays(365);
      
      const today = new Date();
      
      expect(creditExpiration.getTime()).toBeGreaterThan(today.getTime()); // future date
      expect(trialExpiration.getTime()).toBeGreaterThan(today.getTime()); // future date
      expect(annualExpiration.getTime()).toBeGreaterThan(today.getTime()); // future date
      
      // Verify relative ordering
      expect(trialExpiration.getTime()).toBeLessThan(creditExpiration.getTime()); // 30 < 90 days
      expect(creditExpiration.getTime()).toBeLessThan(annualExpiration.getTime()); // 90 < 365 days
    });

    // verifies should handle leap year calculations
    test('should handle leap year calculations', () => {
      // Mock Date to February 28 in a leap year
      const originalDate = Date;
      global.Date = jest.fn(() => new originalDate('2024-02-28T10:00:00.000Z')); // 2024 is leap year
      global.Date.prototype = originalDate.prototype;
      
      const result = addDays(1);
      
      // February 28 + 1 day should be February 29 in leap year
      expect(result.getDate()).toBe(29); // February 29th
      expect(result.getMonth()).toBe(1); // February (0-indexed)
      expect(result.getFullYear()).toBe(2024); // leap year
      
      // Restore original Date
      global.Date = originalDate;
    });

    // verifies should be consistent across multiple calls
    test('should be consistent across multiple calls', () => {
      const calls = Array(5).fill().map(() => addDays(7));
      
      // All calls should return dates within a small time window
      const firstCall = calls[0];
      calls.forEach(call => {
        const timeDiff = Math.abs(call.getTime() - firstCall.getTime());
        expect(timeDiff).toBeLessThan(100); // within 100ms of each other
      });
    });
  });
});

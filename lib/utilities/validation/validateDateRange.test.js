'use strict';

const validateDateRange = require('./validateDateRange');

describe('validateDateRange', () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  it('should return true for valid date ranges', () => {
    expect(validateDateRange(lastMonth.toISOString(), yesterday.toISOString())).toBe(true);
    expect(validateDateRange(lastWeek.toISOString(), yesterday.toISOString())).toBe(true);
  });

  it('should return true for same start and end date', () => {
    expect(validateDateRange(yesterday.toISOString(), yesterday.toISOString())).toBe(true);
  });

  it('should return false when end is before start', () => {
    expect(validateDateRange(yesterday.toISOString(), lastMonth.toISOString())).toBe(false);
  });

  it('should return false for future end dates', () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validateDateRange(yesterday.toISOString(), tomorrow.toISOString())).toBe(false);
  });

  it('should return false for ranges exceeding 365 days', () => {
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    expect(validateDateRange(twoYearsAgo.toISOString(), yesterday.toISOString())).toBe(false);
  });

  it('should return false for invalid dates', () => {
    expect(validateDateRange('invalid', yesterday.toISOString())).toBe(false);
    expect(validateDateRange(yesterday.toISOString(), 'invalid')).toBe(false);
    expect(validateDateRange('not-a-date', 'also-not-a-date')).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(validateDateRange(null, yesterday.toISOString())).toBe(false);
    expect(validateDateRange(yesterday.toISOString(), null)).toBe(false);
    expect(validateDateRange(undefined, undefined)).toBe(false);
  });

  it('should accept Date objects', () => {
    expect(validateDateRange(lastWeek, yesterday)).toBe(true);
  });
});

/**
 * Unit tests for enhanced datetime utilities
 * 
 * These tests cover the new datetime formatting functions that were added to
 * the existing datetime module. They ensure consistent locale-aware formatting,
 * proper error handling, and reliable execution tracking functionality.
 */

const datetimeUtils = require('../../lib/datetime');

describe('Enhanced DateTime Utilities', () => {
  describe('formatDate', () => {
    test('should format Date objects to locale string', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const result = datetimeUtils.formatDate(date);
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Unknown');
    });

    test('should format ISO date strings', () => {
      const result = datetimeUtils.formatDate('2023-12-25T10:30:00Z');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Unknown');
    });

    test('should return fallback for null/undefined dates', () => {
      expect(datetimeUtils.formatDate(null)).toBe('Unknown');
      expect(datetimeUtils.formatDate(undefined)).toBe('Unknown');
      expect(datetimeUtils.formatDate(null, 'No date')).toBe('No date');
    });

    test('should return fallback for invalid dates', () => {
      expect(datetimeUtils.formatDate('invalid-date')).toBe('Unknown');
      expect(datetimeUtils.formatDate('not-a-date', 'Error')).toBe('Error');
      expect(datetimeUtils.formatDate(new Date('invalid'))).toBe('Unknown');
    });

    test('should handle various date string formats', () => {
      expect(datetimeUtils.formatDate('2023-12-25')).not.toBe('Unknown');
      expect(datetimeUtils.formatDate('12/25/2023')).not.toBe('Unknown');
      expect(datetimeUtils.formatDate('Dec 25, 2023')).not.toBe('Unknown');
    });
  });

  describe('formatDateWithPrefix', () => {
    test('should format date with default prefix', () => {
      const result = datetimeUtils.formatDateWithPrefix('2023-12-25T10:30:00Z');
      expect(result).toMatch(/^Added /);
      expect(result).not.toBe('Recently');
    });

    test('should format date with custom prefix', () => {
      const result = datetimeUtils.formatDateWithPrefix('2023-12-25T10:30:00Z', 'Created');
      expect(result).toMatch(/^Created /);
    });

    test('should return fallback for null/undefined dates', () => {
      expect(datetimeUtils.formatDateWithPrefix(null)).toBe('Recently');
      expect(datetimeUtils.formatDateWithPrefix(undefined, 'Added', 'Never')).toBe('Never');
    });

    test('should return fallback for invalid dates', () => {
      expect(datetimeUtils.formatDateWithPrefix('invalid-date')).toBe('Recently');
      expect(datetimeUtils.formatDateWithPrefix('invalid', 'Modified', 'Unknown')).toBe('Unknown');
    });

    test('should handle Date objects', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const result = datetimeUtils.formatDateWithPrefix(date, 'Updated');
      expect(result).toMatch(/^Updated /);
    });
  });

  describe('formatTimestamp', () => {
    test('should format timestamp with date and time', () => {
      const result = datetimeUtils.formatTimestamp('2023-12-25T10:30:00Z');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Unknown');
      // Should include both date and time components
      expect(result.length).toBeGreaterThan(10);
    });

    test('should format Date objects', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const result = datetimeUtils.formatTimestamp(date);
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Unknown');
    });

    test('should return fallback for null/undefined timestamps', () => {
      expect(datetimeUtils.formatTimestamp(null)).toBe('Unknown');
      expect(datetimeUtils.formatTimestamp(undefined, 'No time')).toBe('No time');
    });

    test('should return fallback for invalid timestamps', () => {
      expect(datetimeUtils.formatTimestamp('invalid-timestamp')).toBe('Unknown');
      expect(datetimeUtils.formatTimestamp(new Date('invalid'), 'Error')).toBe('Error');
    });
  });

  describe('formatRelativeTime', () => {
    test('should return "Just now" for very recent dates', () => {
      const recentDate = new Date(Date.now() - 30000); // 30 seconds ago
      const result = datetimeUtils.formatRelativeTime(recentDate);
      expect(result).toBe('Just now');
    });

    test('should format minutes ago correctly', () => {
      const minutesAgo = new Date(Date.now() - 300000); // 5 minutes ago
      const result = datetimeUtils.formatRelativeTime(minutesAgo);
      expect(result).toMatch(/\d+ minutes? ago/);
    });

    test('should format hours ago correctly', () => {
      const hoursAgo = new Date(Date.now() - 7200000); // 2 hours ago
      const result = datetimeUtils.formatRelativeTime(hoursAgo);
      expect(result).toMatch(/\d+ hours? ago/);
    });

    test('should format days ago correctly', () => {
      const daysAgo = new Date(Date.now() - 172800000); // 2 days ago
      const result = datetimeUtils.formatRelativeTime(daysAgo);
      expect(result).toMatch(/\d+ days? ago/);
    });

    test('should fall back to absolute date for longer periods', () => {
      const weekAgo = new Date(Date.now() - 604800000); // 1 week ago
      const result = datetimeUtils.formatRelativeTime(weekAgo);
      expect(result).not.toMatch(/ago$/); // Should be absolute date format
    });

    test('should handle singular vs plural correctly', () => {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const result = datetimeUtils.formatRelativeTime(oneMinuteAgo);
      expect(result).toBe('1 minute ago');
    });

    test('should return fallback for invalid dates', () => {
      expect(datetimeUtils.formatRelativeTime(null)).toBe('Unknown');
      expect(datetimeUtils.formatRelativeTime('invalid-date', 'Error')).toBe('Error');
    });

    test('should handle ISO date strings', () => {
      const isoDate = new Date(Date.now() - 300000).toISOString();
      const result = datetimeUtils.formatRelativeTime(isoDate);
      expect(result).toMatch(/\d+ minutes? ago/);
    });
  });

  describe('formatExecutionDuration', () => {
    test('should format completed execution duration in seconds', () => {
      const execution = {
        startedAt: '2023-12-25T10:00:00Z',
        completedAt: '2023-12-25T10:00:45Z'
      };
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toBe('45s');
    });

    test('should format duration in minutes', () => {
      const execution = {
        startedAt: '2023-12-25T10:00:00Z',
        completedAt: '2023-12-25T10:05:00Z'
      };
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toBe('5m');
    });

    test('should format duration in hours', () => {
      const execution = {
        startedAt: '2023-12-25T10:00:00Z',
        completedAt: '2023-12-25T12:00:00Z'
      };
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toBe('2h');
    });

    test('should calculate ongoing execution duration', () => {
      const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();
      const execution = {
        startedAt: fiveMinutesAgo
      };
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toMatch(/[45]m/); // Should be around 5 minutes
    });

    test('should handle missing startedAt', () => {
      const execution = {};
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toBe('Not started');
    });

    test('should handle null/undefined execution', () => {
      expect(datetimeUtils.formatExecutionDuration(null)).toBe('Not started');
      expect(datetimeUtils.formatExecutionDuration(undefined)).toBe('Not started');
    });

    test('should handle invalid dates', () => {
      const execution = {
        startedAt: 'invalid-date',
        completedAt: '2023-12-25T10:00:00Z'
      };
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toBe('Invalid time');
    });

    test('should handle Date objects', () => {
      const start = new Date(Date.now() - 300000);
      const end = new Date();
      const execution = {
        startedAt: start,
        completedAt: end
      };
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toMatch(/[45]m/);
    });

    test('should round durations appropriately', () => {
      const execution = {
        startedAt: '2023-12-25T10:00:00Z',
        completedAt: '2023-12-25T10:05:30Z' // 5.5 minutes
      };
      const result = datetimeUtils.formatExecutionDuration(execution);
      expect(result).toBe('6m'); // Should round to 6 minutes
    });
  });

  describe('formatCompletionDate', () => {
    test('should format completion date when completedAt is present', () => {
      const execution = {
        completedAt: '2023-12-25T10:00:00Z'
      };
      const result = datetimeUtils.formatCompletionDate(execution);
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Not completed');
      expect(result).not.toBe('Running...');
    });

    test('should return "Running..." for processing executions', () => {
      const execution = { status: 'processing' };
      const result = datetimeUtils.formatCompletionDate(execution);
      expect(result).toBe('Running...');
    });

    test('should return "Running..." for in_progress executions', () => {
      const execution = { status: 'in_progress' };
      const result = datetimeUtils.formatCompletionDate(execution);
      expect(result).toBe('Running...');
    });

    test('should use custom running text', () => {
      const execution = { status: 'processing' };
      const result = datetimeUtils.formatCompletionDate(execution, 'Active');
      expect(result).toBe('Active');
    });

    test('should return "Not completed" for other statuses', () => {
      expect(datetimeUtils.formatCompletionDate({ status: 'failed' })).toBe('Not completed');
      expect(datetimeUtils.formatCompletionDate({ status: 'cancelled' })).toBe('Not completed');
      expect(datetimeUtils.formatCompletionDate({ status: 'pending' })).toBe('Not completed');
    });

    test('should return "Not completed" for null/undefined execution', () => {
      expect(datetimeUtils.formatCompletionDate(null)).toBe('Not completed');
      expect(datetimeUtils.formatCompletionDate(undefined)).toBe('Not completed');
    });

    test('should prefer completedAt over status', () => {
      const execution = {
        completedAt: '2023-12-25T10:00:00Z',
        status: 'processing'
      };
      const result = datetimeUtils.formatCompletionDate(execution);
      expect(result).not.toBe('Running...');
      expect(typeof result).toBe('string');
    });

    test('should handle Date objects in completedAt', () => {
      const execution = {
        completedAt: new Date('2023-12-25T10:00:00Z')
      };
      const result = datetimeUtils.formatCompletionDate(execution);
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Not completed');
    });

    test('should handle invalid completedAt dates', () => {
      const execution = {
        completedAt: 'invalid-date'
      };
      const result = datetimeUtils.formatCompletionDate(execution);
      expect(result).toBe('Completed'); // Falls back to 'Completed' for invalid dates
    });
  });

  // Integration tests with existing datetime functions
  describe('Integration with existing datetime functions', () => {
    test('should work alongside existing formatDateTime', () => {
      const dateStr = '2023-12-25T10:30:00Z';
      const existing = datetimeUtils.formatDateTime(dateStr);
      const enhanced = datetimeUtils.formatTimestamp(dateStr);
      
      expect(typeof existing).toBe('string');
      expect(typeof enhanced).toBe('string');
      expect(existing).not.toBe('N/A');
      expect(enhanced).not.toBe('Unknown');
    });

    test('should work alongside existing addDays', () => {
      const futureDate = datetimeUtils.addDays(30);
      const formatted = datetimeUtils.formatDate(futureDate);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).not.toBe('Unknown');
    });

    test('should work alongside existing formatDuration', () => {
      const startDate = '2023-12-25T10:00:00Z';
      const endDate = '2023-12-25T12:30:00Z';
      
      // This should not throw an error
      expect(() => {
        datetimeUtils.formatDuration(startDate, endDate);
        datetimeUtils.formatExecutionDuration({ startedAt: startDate, completedAt: endDate });
      }).not.toThrow();
    });
  });
});
/**
 * Unit tests for file utilities module
 * 
 * Tests cover file size formatting with various input scenarios including
 * edge cases, invalid inputs, and proper unit scaling.
 */

const { formatFileSize } = require('../../lib/file-utils');

describe('File Utils', () => {
  describe('formatFileSize', () => {
    // Test zero bytes edge case
    test('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    // Test bytes range (1-1023)
    test('should format bytes correctly', () => {
      expect(formatFileSize(1)).toBe('1 Bytes');
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    // Test kilobytes range (1024-1048575)
    test('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(1048575)).toBe('1024 KB');
    });

    // Test megabytes range (1048576-1073741823)
    test('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(2097152)).toBe('2 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    // Test gigabytes range (1073741824+)
    test('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
      expect(formatFileSize(2147483648)).toBe('2 GB');
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });

    // Test decimal precision handling
    test('should handle decimal precision correctly', () => {
      expect(formatFileSize(1100)).toBe('1.07 KB'); // 1100 / 1024 = 1.07421875
      expect(formatFileSize(1234567)).toBe('1.18 MB'); // Shows proper rounding
      expect(formatFileSize(999999999)).toBe('953.67 MB'); // Large MB value
    });

    // Test trailing zero removal
    test('should remove trailing zeros from decimals', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB'); // Not "1.50 KB"
      expect(formatFileSize(2097152)).toBe('2 MB'); // Not "2.00 MB"
    });

    // Test invalid inputs
    test('should handle invalid inputs gracefully', () => {
      expect(formatFileSize(-1)).toBe('Invalid file size');
      expect(formatFileSize(-100)).toBe('Invalid file size');
      expect(formatFileSize('invalid')).toBe('Invalid file size');
      expect(formatFileSize(null)).toBe('Invalid file size');
      expect(formatFileSize(undefined)).toBe('Invalid file size');
      expect(formatFileSize(NaN)).toBe('Invalid file size');
      expect(formatFileSize(Infinity)).toBe('Invalid file size');
      expect(formatFileSize({})).toBe('Invalid file size');
      expect(formatFileSize([])).toBe('Invalid file size');
    });

    // Test very large files (beyond GB)
    test('should handle very large files', () => {
      const oneTerabyte = 1099511627776; // 1 TB in bytes
      expect(formatFileSize(oneTerabyte)).toBe('1024 GB'); // Should stay in GB
      
      const tenTerabytes = 10995116277760; // 10 TB in bytes
      expect(formatFileSize(tenTerabytes)).toBe('10240 GB'); // Should stay in GB
    });

    // Test edge cases around unit boundaries
    test('should handle unit boundary edge cases', () => {
      expect(formatFileSize(1023)).toBe('1023 Bytes'); // Just under 1 KB
      expect(formatFileSize(1024)).toBe('1 KB'); // Exactly 1 KB
      expect(formatFileSize(1025)).toBe('1 KB'); // Just over 1 KB
      
      expect(formatFileSize(1048575)).toBe('1024 KB'); // Just under 1 MB
      expect(formatFileSize(1048576)).toBe('1 MB'); // Exactly 1 MB
      expect(formatFileSize(1048577)).toBe('1 MB'); // Just over 1 MB
    });

    // Test function signature and return type
    test('should have correct function signature', () => {
      expect(typeof formatFileSize).toBe('function');
      expect(typeof formatFileSize(1024)).toBe('string');
    });

    // Test common file sizes
    test('should format common file sizes correctly', () => {
      // Common document sizes
      expect(formatFileSize(25600)).toBe('25 KB'); // Small document
      expect(formatFileSize(204800)).toBe('200 KB'); // Medium document
      expect(formatFileSize(1048576)).toBe('1 MB'); // Large document
      
      // Common image sizes
      expect(formatFileSize(51200)).toBe('50 KB'); // Small image
      expect(formatFileSize(512000)).toBe('500 KB'); // Medium image
      expect(formatFileSize(2097152)).toBe('2 MB'); // Large image
      
      // Common video/audio sizes
      expect(formatFileSize(10485760)).toBe('10 MB'); // Small video
      expect(formatFileSize(104857600)).toBe('100 MB'); // Medium video
      expect(formatFileSize(1073741824)).toBe('1 GB'); // Large video
    });
  });
});
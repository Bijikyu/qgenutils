const { default: formatFileSize } = require('./formatFileSize');

describe('File Utilities', () => {
  describe('formatFileSize', () => {
    test('should format bytes correctly', () => {
      expect(formatFileSize(1024).formatted).toBe('1.0 KB');
      expect(formatFileSize(1048576).formatted).toBe('1.0 MB');
      expect(formatFileSize(1073741824).formatted).toBe('1.0 GB');
    });

    test('should handle small files', () => {
      expect(formatFileSize(0)).toEqual({
        bytes: 0,
        formatted: '0 B',
        unit: 'B',
        size: 0,
        unitIndex: 0
      });
      expect(formatFileSize(512).formatted).toBe('512 B');
      expect(formatFileSize(1023).formatted).toBe('1023 B');
    });

    test('should handle invalid input', () => {
      expect(formatFileSize(-1).formatted).toBe('0 B');
      expect(formatFileSize(-1).error).toBeDefined();
      expect(formatFileSize('invalid').formatted).toBe('0 B');
      expect(formatFileSize(null).formatted).toBe('0 B');
      expect(formatFileSize(undefined).formatted).toBe('0 B');
    });
  });
});

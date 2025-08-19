const formatFileSize = require('./formatFileSize');

describe('File Utilities', () => {
  describe('formatFileSize', () => {
    test('should format bytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
    });

    test('should handle small files', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    test('should handle invalid input', () => {
      expect(formatFileSize(-1)).toBe('0 B');
      expect(formatFileSize('invalid')).toBe('0 B');
      expect(formatFileSize(null)).toBe('0 B');
      expect(formatFileSize(undefined)).toBe('0 B');
    });
  });
});
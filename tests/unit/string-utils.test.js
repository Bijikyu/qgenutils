/**
 * Unit tests for string sanitization and validation utilities
 * 
 * These tests ensure string utilities maintain security-first patterns while
 * providing reliable sanitization and validation functionality. All functions
 * are tested for both normal operation and edge cases.
 */

const stringUtils = require('../../lib/string-utils');

describe('String Utilities', () => {
  describe('sanitizeString', () => {
    test('should remove control characters and normalize whitespace', () => {
      expect(stringUtils.sanitizeString('Hello\x00World\t\t  ')).toBe('Hello World');
      expect(stringUtils.sanitizeString('Line1\nLine2\r\nLine3')).toBe('Line1 Line2 Line3');
      expect(stringUtils.sanitizeString('  \t  Multiple   \n  ')).toBe('Multiple');
    });

    test('should preserve Unicode content', () => {
      expect(stringUtils.sanitizeString('Café München 东京')).toBe('Café München 东京');
      expect(stringUtils.sanitizeString('Émojis: 🎉 ✨')).toBe('Émojis: 🎉 ✨');
    });

    test('should handle invalid input gracefully', () => {
      expect(stringUtils.sanitizeString(null)).toBe('');
      expect(stringUtils.sanitizeString(undefined)).toBe('');
      expect(stringUtils.sanitizeString(123)).toBe('');
      expect(stringUtils.sanitizeString({})).toBe('');
    });

    test('should handle empty and whitespace-only strings', () => {
      expect(stringUtils.sanitizeString('')).toBe('');
      expect(stringUtils.sanitizeString('   ')).toBe('');
      expect(stringUtils.sanitizeString('\t\n\r')).toBe('');
    });
  });

  describe('sanitizeErrorMessage', () => {
    test('should sanitize file paths', () => {
      const result = stringUtils.sanitizeErrorMessage('File not found: /home/user/.env');
      expect(result).toBe('File not found: [PATH]');
    });

    test('should sanitize IP addresses', () => {
      const result = stringUtils.sanitizeErrorMessage('Connection failed to 192.168.1.100:5432');
      expect(result).toBe('Connection failed to [IP]:5432');
    });

    test('should sanitize database URLs', () => {
      expect(stringUtils.sanitizeErrorMessage('mongodb://user:pass@cluster.mongodb.net/db')).toBe('[DATABASE_URL]');
      expect(stringUtils.sanitizeErrorMessage('mysql://user:pass@localhost:3306/db')).toBe('[DATABASE_URL]');
      expect(stringUtils.sanitizeErrorMessage('postgres://user:pass@host:5432/db')).toBe('[DATABASE_URL]');
    });

    test('should handle error objects', () => {
      const error = new Error('File not found: /path/to/file');
      const result = stringUtils.sanitizeErrorMessage(error);
      expect(result).toBe('File not found: [PATH]');
    });

    test('should handle invalid error types', () => {
      expect(stringUtils.sanitizeErrorMessage(null)).toBe('An error occurred while processing your request.');
      expect(stringUtils.sanitizeErrorMessage(123)).toBe('An error occurred while processing your request.');
      expect(stringUtils.sanitizeErrorMessage({})).toBe('An error occurred while processing your request.');
    });

    test('should limit message length', () => {
      const longMessage = 'x'.repeat(300);
      const result = stringUtils.sanitizeErrorMessage(longMessage);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('sanitizeForHtml', () => {
    test('should escape HTML special characters', () => {
      expect(stringUtils.sanitizeForHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;');
    });

    test('should convert line breaks to <br> tags', () => {
      expect(stringUtils.sanitizeForHtml('Line 1\nLine 2')).toBe('Line 1<br>Line 2');
    });

    test('should escape quotes and ampersands', () => {
      expect(stringUtils.sanitizeForHtml('Text with "quotes" & \'apostrophes\''))
        .toBe('Text with &quot;quotes&quot; &amp; &#x27;apostrophes&#x27;');
    });

    test('should handle invalid input', () => {
      expect(stringUtils.sanitizeForHtml(null)).toBe('');
      expect(stringUtils.sanitizeForHtml(undefined)).toBe('');
      expect(stringUtils.sanitizeForHtml(123)).toBe('');
    });
  });

  describe('validatePagination', () => {
    test('should return default values for empty query', () => {
      const result = stringUtils.validatePagination({});
      expect(result).toEqual({ limit: 20, offset: 0 });
    });

    test('should parse valid limit and offset parameters', () => {
      const result = stringUtils.validatePagination({ limit: '25', offset: '100' });
      expect(result).toEqual({ limit: 25, offset: 100 });
    });

    test('should handle skip parameter as alias for offset', () => {
      const result = stringUtils.validatePagination({ limit: '15', skip: '50' });
      expect(result).toEqual({ limit: 15, offset: 50 });
    });

    test('should use defaults for invalid limit parameters', () => {
      expect(stringUtils.validatePagination({ limit: 'invalid' })).toEqual({ limit: 20, offset: 0 });
      expect(stringUtils.validatePagination({ limit: '0' })).toEqual({ limit: 20, offset: 0 });
      expect(stringUtils.validatePagination({ limit: '1000' })).toEqual({ limit: 20, offset: 0 });
    });

    test('should use defaults for invalid offset parameters', () => {
      expect(stringUtils.validatePagination({ offset: 'invalid' })).toEqual({ limit: 20, offset: 0 });
      expect(stringUtils.validatePagination({ offset: '-5' })).toEqual({ limit: 20, offset: 0 });
    });

    test('should support custom limits configuration', () => {
      const customLimits = { minLimit: 5, maxLimit: 50, defaultLimit: 10 };
      const result = stringUtils.validatePagination({}, customLimits);
      expect(result).toEqual({ limit: 10, offset: 0 });
    });

    test('should handle invalid query object', () => {
      expect(stringUtils.validatePagination(null)).toEqual({ limit: 20, offset: 0 });
      expect(stringUtils.validatePagination('invalid')).toEqual({ limit: 20, offset: 0 });
    });
  });
});
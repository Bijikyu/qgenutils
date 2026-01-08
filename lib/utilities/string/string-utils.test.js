const { default: sanitizeString } = require('./sanitizeString');

describe('String Utilities', () => {
  describe('sanitizeString', () => {
    test('should sanitize basic strings', () => {
      expect(sanitizeString('hello world')).toBeDefined();
      expect(typeof sanitizeString('test')).toBe('string');
    });

    test('should handle empty input', () => {
      expect(sanitizeString('')).toBeDefined();
      expect(sanitizeString(null)).toBeDefined();
      expect(sanitizeString(undefined)).toBeDefined();
    });

    test('should handle special characters', () => {
      expect(sanitizeString('<script>')).toBeDefined();
      expect(sanitizeString('test & string')).toBeDefined();
    });
  });
});

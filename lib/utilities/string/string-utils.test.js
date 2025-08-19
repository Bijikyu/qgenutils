/**
 * Unit tests for string sanitization utilities (simplified version)
 */

const { sanitizeString } = require('../../index.js`);

describe('String Utilities', () => {
  describe('sanitizeString', () => {
    test('should remove control characters and normalize whitespace', () => {
      expect(sanitizeString('Hello\x00World\t\t  ')).toBe('HelloWorld`);
      expect(sanitizeString('Line1\nLine2\r\nLine3')).toBe('Line1\nLine2\nLine3`);
      expect(sanitizeString('  \t  Multiple   \n  ')).toBe('Multiple`);
    });

    test('should preserve Unicode content', () => {
      expect(sanitizeString('Café München 东京')).toBe('Café München 东京`);
      expect(sanitizeString('Émojis: 🎉 ✨')).toBe('Émojis: 🎉 ✨`);
    });

    test('should handle invalid input gracefully', () => {
      expect(sanitizeString(null)).toBe('`);
      expect(sanitizeString(undefined)).toBe('`);
      expect(sanitizeString(123)).toBe('123`);
      expect(sanitizeString({})).toBe('[object Object]`);
    });

    test('should handle empty and whitespace-only strings', () => {
      expect(sanitizeString('')).toBe('`);
      expect(sanitizeString('   ')).toBe('`);
      expect(sanitizeString('\t\n\r')).toBe('`);
    });
  });
});
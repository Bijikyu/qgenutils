const ensureProtocol = require('./ensureProtocol');
const stripProtocol = require('./stripProtocol');
const normalizeUrlOrigin = require('./normalizeUrlOrigin');
const parseUrlParts = require('./parseUrlParts');

describe('URL Utilities', () => {
  describe('ensureProtocol', () => {
    test('should add https to URLs without protocol', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com');
      expect(ensureProtocol('www.example.com')).toBe('https://www.example.com');
    });

    test('should preserve existing protocols', () => {
      expect(ensureProtocol('https://example.com')).toBe('https://example.com');
      expect(ensureProtocol('http://example.com')).toBe('http://example.com');
    });
  });

  describe('stripProtocol', () => {
    test('should remove protocols from URLs', () => {
      expect(stripProtocol('https://example.com')).toBe('example.com');
      expect(stripProtocol('http://example.com')).toBe('example.com');
    });

    test('should handle URLs without protocols', () => {
      expect(stripProtocol('example.com')).toBe('example.com');
    });
  });

  describe('normalizeUrlOrigin', () => {
    test('should normalize URL origins', () => {
      expect(normalizeUrlOrigin('https://example.com/')).toBe('https://example.com');
      expect(normalizeUrlOrigin('https://EXAMPLE.COM')).toBe('https://example.com');
    });
  });

  describe('parseUrlParts', () => {
    test('should parse URL components', () => {
      const result = parseUrlParts('https://example.com/path');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
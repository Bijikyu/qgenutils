
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('../../lib/url');

describe('URL Utilities', () => {
  describe('ensureProtocol', () => {
    test('should add https to URL without protocol', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com');
    });

    test('should preserve existing https protocol', () => {
      expect(ensureProtocol('https://example.com')).toBe('https://example.com');
    });

    test('should preserve existing http protocol', () => {
      expect(ensureProtocol('http://example.com')).toBe('http://example.com');
    });

    test('should handle case-insensitive protocols', () => {
      expect(ensureProtocol('HTTP://example.com')).toBe('HTTP://example.com');
      expect(ensureProtocol('HTTPS://example.com')).toBe('HTTPS://example.com');
    });

    test('should return null for empty string', () => {
      expect(ensureProtocol('')).toBeNull();
    });

    test('should return null for null input', () => {
      expect(ensureProtocol(null)).toBeNull();
    });

    test('should return null for non-string input', () => {
      expect(ensureProtocol(123)).toBeNull();
      expect(ensureProtocol({})).toBeNull();
    });

    test('should handle URLs with paths', () => {
      expect(ensureProtocol('example.com/path')).toBe('https://example.com/path');
    });

    test('should handle URLs with query parameters', () => {
      expect(ensureProtocol('example.com/path?q=test')).toBe('https://example.com/path?q=test');
    });
  });

  describe('normalizeUrlOrigin', () => {
    test('should normalize URL to lowercase origin', () => {
      expect(normalizeUrlOrigin('HTTPS://Example.Com/path')).toBe('https://example.com');
    });

    test('should handle URL without protocol', () => {
      expect(normalizeUrlOrigin('Example.Com/path')).toBe('https://example.com');
    });

    test('should preserve port numbers', () => {
      expect(normalizeUrlOrigin('https://example.com:8080/path')).toBe('https://example.com:8080');
    });

    test('should return null for invalid URLs', () => {
      expect(normalizeUrlOrigin('')).toBeNull();
      expect(normalizeUrlOrigin(null)).toBeNull();
    });

    test('should handle complex URLs', () => {
      expect(normalizeUrlOrigin('HTTPS://API.Example.Com:443/v1/users?id=123')).toBe('https://api.example.com:443');
    });
  });

  describe('stripProtocol', () => {
    test('should remove https protocol', () => {
      expect(stripProtocol('https://example.com')).toBe('example.com');
    });

    test('should remove http protocol', () => {
      expect(stripProtocol('http://example.com')).toBe('example.com');
    });

    test('should remove trailing slash', () => {
      expect(stripProtocol('https://example.com/')).toBe('example.com');
    });

    test('should handle case-insensitive protocols', () => {
      expect(stripProtocol('HTTPS://example.com')).toBe('example.com');
      expect(stripProtocol('HTTP://example.com')).toBe('example.com');
    });

    test('should preserve paths and query parameters', () => {
      expect(stripProtocol('https://example.com/path?q=test')).toBe('example.com/path?q=test');
    });

    test('should handle URLs without protocol', () => {
      expect(stripProtocol('example.com')).toBe('example.com');
    });

    test('should handle error cases gracefully', () => {
      // Should return original input if processing fails
      expect(typeof stripProtocol('test')).toBe('string');
    });
  });

  describe('parseUrlParts', () => {
    test('should parse URL into base and endpoint', () => {
      const result = parseUrlParts('example.com/api/users?id=123');
      expect(result).toEqual({
        baseUrl: 'https://example.com',
        endpoint: '/api/users?id=123'
      });
    });

    test('should handle URL with existing protocol', () => {
      const result = parseUrlParts('https://api.example.com/v1/users');
      expect(result).toEqual({
        baseUrl: 'https://api.example.com',
        endpoint: '/v1/users'
      });
    });

    test('should handle root path', () => {
      const result = parseUrlParts('example.com/');
      expect(result).toEqual({
        baseUrl: 'https://example.com',
        endpoint: '/'
      });
    });

    test('should handle URL without path', () => {
      const result = parseUrlParts('example.com');
      expect(result).toEqual({
        baseUrl: 'https://example.com',
        endpoint: '/'
      });
    });

    test('should return null for invalid URLs', () => {
      expect(parseUrlParts('')).toBeNull();
      expect(parseUrlParts(null)).toBeNull();
    });

    test('should handle URLs with ports', () => {
      const result = parseUrlParts('example.com:8080/api');
      expect(result).toEqual({
        baseUrl: 'https://example.com:8080',
        endpoint: '/api'
      });
    });

    test('should handle complex query parameters', () => {
      const result = parseUrlParts('api.example.com/search?q=test&limit=10&sort=name');
      expect(result).toEqual({
        baseUrl: 'https://api.example.com',
        endpoint: '/search?q=test&limit=10&sort=name'
      });
    });
  });
});

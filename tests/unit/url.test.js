
// Unit tests for URL utilities covering protocol enforcement, origin
// normalization, protocol stripping, and structured parsing. Each case asserts
// reliable output for both valid and malformed input.
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('../../lib/url');

describe('URL Utilities', () => {
  describe('ensureProtocol', () => {
    // verifies should add https to URL without protocol
    test('should add https to URL without protocol', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com');
    });

    // verifies should preserve existing https protocol
    test('should preserve existing https protocol', () => {
      expect(ensureProtocol('https://example.com')).toBe('https://example.com');
    });

    // verifies should preserve existing http protocol
    test('should preserve existing http protocol', () => {
      expect(ensureProtocol('http://example.com')).toBe('http://example.com');
    });

    // verifies should handle case-insensitive protocols
    test('should handle case-insensitive protocols', () => {
      expect(ensureProtocol('HTTP://example.com')).toBe('HTTP://example.com');
      expect(ensureProtocol('HTTPS://example.com')).toBe('HTTPS://example.com');
    });

    // verifies should return null for empty string
    test('should return null for empty string', () => {
      expect(ensureProtocol('')).toBeNull();
    });

    // verifies should return null for null input
    test('should return null for null input', () => {
      expect(ensureProtocol(null)).toBeNull();
    });

    // verifies should return null for non-string input
    test('should return null for non-string input', () => {
      expect(ensureProtocol(123)).toBeNull();
      expect(ensureProtocol({})).toBeNull();
    });

    // verifies should handle URLs with paths
    test('should handle URLs with paths', () => {
      expect(ensureProtocol('example.com/path')).toBe('https://example.com/path');
    });

    // verifies should handle URLs with query parameters
    test('should handle URLs with query parameters', () => {
      expect(ensureProtocol('example.com/path?q=test')).toBe('https://example.com/path?q=test');
    });
  });

  describe('normalizeUrlOrigin', () => {
    // verifies should normalize URL to lowercase origin
    test('should normalize URL to lowercase origin', () => {
      expect(normalizeUrlOrigin('HTTPS://Example.Com/path')).toBe('https://example.com');
    });

    // verifies should handle URL without protocol
    test('should handle URL without protocol', () => {
      expect(normalizeUrlOrigin('Example.Com/path')).toBe('https://example.com');
    });

    // verifies should preserve port numbers
    test('should preserve port numbers', () => {
      expect(normalizeUrlOrigin('https://example.com:8080/path')).toBe('https://example.com:8080');
    });

    // verifies should return null for invalid URLs
    test('should return null for invalid URLs', () => {
      expect(normalizeUrlOrigin('')).toBeNull();
      expect(normalizeUrlOrigin(null)).toBeNull();
    });

    // verifies should handle complex URLs
    test('should handle complex URLs', () => {
      expect(normalizeUrlOrigin('HTTPS://API.Example.Com:443/v1/users?id=123')).toBe('https://api.example.com');
    });
  });

  describe('stripProtocol', () => {
    // verifies should remove https protocol
    test('should remove https protocol', () => {
      expect(stripProtocol('https://example.com')).toBe('example.com');
    });

    // verifies should remove http protocol
    test('should remove http protocol', () => {
      expect(stripProtocol('http://example.com')).toBe('example.com');
    });

    // verifies should remove trailing slash
    test('should remove trailing slash', () => {
      expect(stripProtocol('https://example.com/')).toBe('example.com');
    });

    // verifies should handle case-insensitive protocols
    test('should handle case-insensitive protocols', () => {
      expect(stripProtocol('HTTPS://example.com')).toBe('example.com');
      expect(stripProtocol('HTTP://example.com')).toBe('example.com');
    });

    // verifies should preserve paths and query parameters
    test('should preserve paths and query parameters', () => {
      expect(stripProtocol('https://example.com/path?q=test')).toBe('example.com/path?q=test');
    });

    // verifies should handle URLs without protocol
    test('should handle URLs without protocol', () => {
      expect(stripProtocol('example.com')).toBe('example.com');
    });

    // verifies should handle error cases gracefully
    test('should handle error cases gracefully', () => {
      // Should return original input if processing fails
      expect(typeof stripProtocol('test')).toBe('string');
    });
  });

  describe('parseUrlParts', () => {
    // verifies should parse URL into base and endpoint
    test('should parse URL into base and endpoint', () => {
      const result = parseUrlParts('example.com/api/users?id=123');
      expect(result).toEqual({
        baseUrl: 'https://example.com',
        endpoint: '/api/users?id=123'
      });
    });

    // verifies should handle URL with existing protocol
    test('should handle URL with existing protocol', () => {
      const result = parseUrlParts('https://api.example.com/v1/users');
      expect(result).toEqual({
        baseUrl: 'https://api.example.com',
        endpoint: '/v1/users'
      });
    });

    // verifies should handle root path
    test('should handle root path', () => {
      const result = parseUrlParts('example.com/');
      expect(result).toEqual({
        baseUrl: 'https://example.com',
        endpoint: '/'
      });
    });

    // verifies should handle URL without path
    test('should handle URL without path', () => {
      const result = parseUrlParts('example.com');
      expect(result).toEqual({
        baseUrl: 'https://example.com',
        endpoint: '/'
      });
    });

    // verifies should return null for invalid URLs
    test('should return null for invalid URLs', () => {
      expect(parseUrlParts('')).toBeNull();
      expect(parseUrlParts(null)).toBeNull();
    });

    // verifies should handle URLs with ports
    test('should handle URLs with ports', () => {
      const result = parseUrlParts('example.com:8080/api');
      expect(result).toEqual({
        baseUrl: 'https://example.com:8080',
        endpoint: '/api'
      });
    });

    // verifies should handle complex query parameters
    test('should handle complex query parameters', () => {
      const result = parseUrlParts('api.example.com/search?q=test&limit=10&sort=name');
      expect(result).toEqual({
        baseUrl: 'https://api.example.com',
        endpoint: '/search?q=test&limit=10&sort=name'
      });
    });
  });
});

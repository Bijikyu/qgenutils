
// Unit tests for URL utilities covering protocol enforcement, origin
// normalization, protocol stripping, and structured parsing. Each case asserts
// reliable output for both valid and malformed input.
const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('../../lib/url');

describe('URL Utilities', () => { // ensures robust URL transformations
  describe('ensureProtocol', () => { // adds protocols when missing
    // verifies should add https to URL without protocol
    test('should add https to URL without protocol', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com'); // default to https
    });

    // verifies should preserve existing https protocol
    test('should preserve existing https protocol', () => {
      expect(ensureProtocol('https://example.com')).toBe('https://example.com'); // unchanged input
    });

    // verifies should preserve existing http protocol
    test('should preserve existing http protocol', () => {
      expect(ensureProtocol('http://example.com')).toBe('http://example.com'); // keep http
    });

    // verifies should handle case-insensitive protocols
    test('should handle case-insensitive protocols', () => {
      expect(ensureProtocol('HTTP://example.com')).toBe('HTTP://example.com'); // should not alter case
      expect(ensureProtocol('HTTPS://example.com')).toBe('HTTPS://example.com'); // protocol preserved
    });

    // verifies should return null for empty string
    test('should return null for empty string', () => {
      expect(ensureProtocol('')).toBeNull(); // invalid string results in null
    });

    // verifies should return null for null input
    test('should return null for null input', () => {
      expect(ensureProtocol(null)).toBeNull(); // null returns null
    });

    // verifies should return null for non-string input
    test('should return null for non-string input', () => {
      expect(ensureProtocol(123)).toBeNull(); // non-string input returns null
      expect(ensureProtocol({})).toBeNull(); // object input returns null
    });

    // verifies should handle URLs with paths
    test('should handle URLs with paths', () => {
      expect(ensureProtocol('example.com/path')).toBe('https://example.com/path'); // path retained
    });

    // verifies should handle URLs with query parameters
    test('should handle URLs with query parameters', () => {
      expect(ensureProtocol('example.com/path?q=test')).toBe('https://example.com/path?q=test'); // query preserved
    });

    // verifies should trim whitespace and add https
    test('should trim whitespace and add https', () => {
      expect(ensureProtocol('  example.com  ')).toBe('https://example.com'); // trims whitespace
    });
  });

  describe('normalizeUrlOrigin', () => { // standardizes hostnames
    // verifies should normalize URL to lowercase origin
    test('should normalize URL to lowercase origin', () => {
      expect(normalizeUrlOrigin('HTTPS://Example.Com/path')).toBe('https://example.com'); // converts host to lowercase
    });

    // verifies should handle URL without protocol
    test('should handle URL without protocol', () => {
      expect(normalizeUrlOrigin('Example.Com/path')).toBe('https://example.com'); // protocol added when missing
    });

    // verifies should preserve port numbers
    test('should preserve port numbers', () => {
      expect(normalizeUrlOrigin('https://example.com:8080/path')).toBe('https://example.com:8080'); // port retained
    });

    // verifies should return null for invalid URLs
    test('should return null for invalid URLs', () => {
      expect(normalizeUrlOrigin('')).toBeNull(); // invalid string returns null
      expect(normalizeUrlOrigin(null)).toBeNull(); // null also returns null
    });

    // verifies should handle complex URLs
    test('should handle complex URLs', () => {
      expect(normalizeUrlOrigin('HTTPS://API.Example.Com:443/v1/users?id=123')).toBe('https://api.example.com'); // complex URL normalized
    });
  });

  describe('stripProtocol', () => { // removes schemes without breaking paths
    // verifies should remove https protocol
    test('should remove https protocol', () => {
      expect(stripProtocol('https://example.com')).toBe('example.com'); // remove https scheme
    });

    // verifies should remove http protocol
    test('should remove http protocol', () => {
      expect(stripProtocol('http://example.com')).toBe('example.com'); // remove http scheme
    });

    // verifies should remove trailing slash
    test('should remove trailing slash', () => {
      expect(stripProtocol('https://example.com/')).toBe('example.com'); // trailing slash removed
    });

    // verifies should handle case-insensitive protocols
    test('should handle case-insensitive protocols', () => {
      expect(stripProtocol('HTTPS://example.com')).toBe('example.com'); // handle uppercase
      expect(stripProtocol('HTTP://example.com')).toBe('example.com'); // handle uppercase
    });

    // verifies should preserve paths and query parameters
    test('should preserve paths and query parameters', () => {
      expect(stripProtocol('https://example.com/path?q=test')).toBe('example.com/path?q=test'); // preserve path and query
    });

    // verifies should handle URLs without protocol
    test('should handle URLs without protocol', () => {
      expect(stripProtocol('example.com')).toBe('example.com'); // input without protocol unchanged
    });

    // verifies should handle error cases gracefully
    test('should handle error cases gracefully', () => {
      // Should return original input if processing fails
      expect(typeof stripProtocol('test')).toBe('string'); // error handling returns string
    });
  });

  describe('parseUrlParts', () => { // parses URLs into base and endpoint
    // verifies should parse URL into base and endpoint
    test('should parse URL into base and endpoint', () => {
      const result = parseUrlParts('example.com/api/users?id=123');
      expect(result).toEqual({ // ensure base and endpoint returned correctly
        baseUrl: 'https://example.com',
        endpoint: '/api/users?id=123'
      });
    });

    // verifies should handle URL with existing protocol
    test('should handle URL with existing protocol', () => {
      const result = parseUrlParts('https://api.example.com/v1/users');
      expect(result).toEqual({ // existing protocol preserved
        baseUrl: 'https://api.example.com',
        endpoint: '/v1/users'
      });
    });

    // verifies should handle root path
    test('should handle root path', () => {
      const result = parseUrlParts('example.com/');
      expect(result).toEqual({ // handles root path
        baseUrl: 'https://example.com',
        endpoint: '/'
      });
    });

    // verifies should handle URL without path
    test('should handle URL without path', () => {
      const result = parseUrlParts('example.com');
      expect(result).toEqual({ // handles missing path
        baseUrl: 'https://example.com',
        endpoint: '/'
      });
    });

    // verifies should return null for invalid URLs
    test('should return null for invalid URLs', () => {
      expect(parseUrlParts('')).toBeNull(); // invalid input returns null
      expect(parseUrlParts(null)).toBeNull(); // null returns null
    });

    // verifies should handle URLs with ports
    test('should handle URLs with ports', () => {
      const result = parseUrlParts('example.com:8080/api');
      expect(result).toEqual({ // port support
        baseUrl: 'https://example.com:8080',
        endpoint: '/api'
      });
    });

    // verifies should handle complex query parameters
    test('should handle complex query parameters', () => {
      const result = parseUrlParts('api.example.com/search?q=test&limit=10&sort=name');
      expect(result).toEqual({ // complex query parameters retained
        baseUrl: 'https://api.example.com',
        endpoint: '/search?q=test&limit=10&sort=name'
      });
    });
  });
});

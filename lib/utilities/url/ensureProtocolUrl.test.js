const ensureProtocolUrl = require('./ensureProtocolUrl');

describe('ensureProtocolUrl', () => {
  describe('basic URL handling', () => {
    it('should add https:// to URL without protocol', () => {
      expect(ensureProtocolUrl({ url: 'example.com' })).toBe('https://example.com');
    });

    it('should preserve http:// protocol', () => {
      expect(ensureProtocolUrl({ url: 'http://example.com' })).toBe('http://example.com');
    });

    it('should preserve https:// protocol', () => {
      expect(ensureProtocolUrl({ url: 'https://example.com' })).toBe('https://example.com');
    });

    it('should handle protocol-relative URLs', () => {
      expect(ensureProtocolUrl({ url: '//example.com' })).toBe('https://example.com');
    });

    it('should trim whitespace from URL', () => {
      expect(ensureProtocolUrl({ url: '  example.com  ' })).toBe('https://example.com');
    });
  });

  describe('allowEmpty option', () => {
    it('should return https:// for empty URL when allowEmpty is false', () => {
      expect(ensureProtocolUrl({ url: '', allowEmpty: false })).toBe('https://');
    });

    it('should return https:// for empty URL when allowEmpty is undefined', () => {
      expect(ensureProtocolUrl({ url: '' })).toBe('https://');
    });

    it('should return empty string for empty URL when allowEmpty is true', () => {
      expect(ensureProtocolUrl({ url: '', allowEmpty: true })).toBe('');
    });

    it('should return empty string for whitespace-only URL when allowEmpty is true', () => {
      expect(ensureProtocolUrl({ url: '   ', allowEmpty: true })).toBe('');
    });

    it('should return empty string for null URL when allowEmpty is true', () => {
      expect(ensureProtocolUrl({ url: null, allowEmpty: true })).toBe('');
    });

    it('should return empty string for undefined URL when allowEmpty is true', () => {
      expect(ensureProtocolUrl({ url: undefined, allowEmpty: true })).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should return https:// for null input', () => {
      expect(ensureProtocolUrl(null)).toBe('https://');
    });

    it('should return https:// for undefined input', () => {
      expect(ensureProtocolUrl(undefined)).toBe('https://');
    });

    it('should return https:// for non-object input', () => {
      expect(ensureProtocolUrl('example.com')).toBe('https://');
    });

    it('should handle URL with path', () => {
      expect(ensureProtocolUrl({ url: 'example.com/path/to/page' }))
        .toBe('https://example.com/path/to/page');
    });

    it('should handle URL with query string', () => {
      expect(ensureProtocolUrl({ url: 'example.com?foo=bar' }))
        .toBe('https://example.com?foo=bar');
    });

    it('should handle URL with port when protocol present', () => {
      expect(ensureProtocolUrl({ url: 'https://example.com:8080' }))
        .toBe('https://example.com:8080');
    });

    it('should normalize uppercase protocol', () => {
      expect(ensureProtocolUrl({ url: 'HTTP://example.com' })).toBe('http://example.com');
      expect(ensureProtocolUrl({ url: 'HTTPS://example.com' })).toBe('https://example.com');
    });
  });
});

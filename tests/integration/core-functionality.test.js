/**
 * Integration Tests for QGenUtils Core Functionality
 *
 * Tests real-world usage scenarios and integration between utilities
 */

// Import utilities individually to avoid ES module issues
import validateEmail from '../../lib/utilities/validation/validateEmail.js';
import hashPassword from '../../lib/utilities/password/hashPassword.js';
import verifyPassword from '../../lib/utilities/password/verifyPassword.js';
import memoize from '../../lib/utilities/performance/memoize.js';
import debounce from '../../lib/utilities/performance/debounce.js';
import formatDateTime from '../../lib/utilities/datetime/formatDateTime.js';
import ensureProtocol from '../../lib/utilities/url/ensureProtocol.js';
import formatFileSize from '../../lib/utilities/file/formatFileSize.js';
import createApiKeyValidator from '../../lib/utilities/middleware/createApiKeyValidator.js';
import createRateLimiter from '../../lib/utilities/middleware/createRateLimiter.js';

describe('QGenUtils Integration Tests', () => {
  describe('Security Integration', () => {
    it('should validate email format', () => {
      const result = validateEmail('user@example.com');
      expect(result).toBe(true);
    });

    it('should hash and verify passwords', async () => {
      const hash = await hashPassword('testPassword123!');
      const isValid = await verifyPassword('testPassword123!', hash);
      expect(isValid).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    it('should memoize expensive functions', () => {
      let callCount = 0;
      const expensiveFn = (n) => {
        callCount++;
        return n * 2;
      };

      const memoizedFn = memoize(expensiveFn);

      // First call should execute function
      expect(memoizedFn(5)).toBe(10);
      expect(callCount).toBe(1);

      // Second call should use cache
      expect(memoizedFn(5)).toBe(10);
      expect(callCount).toBe(1);
    });

    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      debouncedFn();
      debouncedFn();

      // Should only call once due to debouncing
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });

  describe('Utility Integration', () => {
    it('should format date time properly', () => {
      const result = formatDateTime('2023-12-25T10:30:00.000Z');
      expect(result).toHaveProperty('formatted');
      expect(typeof result.formatted).toBe('string');
    });

    it('should ensure protocol in URLs', () => {
      const result = ensureProtocol('example.com');
      expect(result).toHaveProperty('processed');
      expect(result.processed).toBe('https://example.com');
    });

    it('should format file sizes', () => {
      const result = formatFileSize(1024);
      expect(result).toEqual({
        bytes: 1024,
        formatted: '1.0 KB',
        unit: 'KB',
        size: 1,
        unitIndex: 1
      });
    });
  });

  describe('Middleware Integration', () => {
    it('should create API key validator', () => {
      const validator = createApiKeyValidator({
        apiKey: 'test-api-key-12345',
        headerName: 'X-API-Key',
        required: true
      });

      expect(typeof validator).toBe('function');
    });

    it('should create rate limiter', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 100
      });

      expect(typeof limiter).toBe('function');
    });
  });
});

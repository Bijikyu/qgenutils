/**
 * Integration Tests for QGenUtils Core Functionality
 * 
 * Tests real-world usage scenarios and integration between utilities
 */

import { 
  validateEmail,
  hashPassword,
  verifyPassword,
  memoize,
  debounce,
  formatDateTime,
  ensureProtocol,
  formatFileSize,
  createApiKeyValidator,
  createRateLimiter
} from '../../dist/index-core.js';

describe('QGenUtils Integration Tests', () => {
  describe('Authentication Flow Integration', () => {
    test('should validate email, hash password, and verify', async () => {
      const email = 'test@example.com';
      const password = 'SecurePassword123!';
      
      // Step 1: Validate email
      expect(validateEmail(email)).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      
      // Step 2: Hash password
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      
      // Step 3: Verify password
      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    }, 10000);
  });

  describe('Performance Optimization Integration', () => {
    test('should optimize expensive operations with memoization', async () => {
      let callCount = 0;
      
      const expensiveFunction = memoize((input) => {
        callCount++;
        // Simulate expensive operation
        const result = input * 2;
        return new Promise(resolve => {
          setTimeout(() => resolve(result), 10);
        });
      });
      
      // First call should compute
      const result1 = await expensiveFunction(21);
      expect(result1).toBe(42);
      expect(callCount).toBe(1);
      
      // Second call should use cache
      const result2 = await expensiveFunction(21);
      expect(result2).toBe(42);
      expect(callCount).toBe(1); // Should not increment
      
      // Different input should compute
      const result3 = await expensiveFunction(30);
      expect(result3).toBe(60);
      expect(callCount).toBe(2);
    }, 15000);
    
    test('should debounce rapid function calls', async () => {
      let callCount = 0;
      let lastValue = null;
      
      const debouncedFunction = debounce((value) => {
        callCount++;
        lastValue = value;
      }, 100);
      
      // Rapid calls should be debounced
      debouncedFunction('value1');
      debouncedFunction('value2');
      debouncedFunction('value3');
      
      // Should not execute immediately
      expect(callCount).toBe(0);
      expect(lastValue).toBe(null);
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should execute only once with last value
      expect(callCount).toBe(1);
      expect(lastValue).toBe('value3');
    }, 5000);
  });

  describe('DateTime Integration', () => {
    test('should format dates consistently across utilities', () => {
      const testDate = new Date('2023-12-25T10:30:00.000Z');
      
      const formatted = formatDateTime(testDate);
      expect(formatted.original).toBe(testDate);
      expect(formatted.formatted).toBeDefined();
      expect(formatted.timestamp).toBe(testDate.getTime());
      expect(formatted.error).toBeUndefined();
      
      // Test with invalid date
      const invalidResult = formatDateTime('invalid-date');
      expect(invalidResult.error).toBeDefined();
      expect(invalidResult.error).toContain('Invalid date');
    }, 5000);
  });

  describe('URL Processing Integration', () => {
    test('should handle URL protocol operations correctly', () => {
      const testCases = [
        {
          input: 'example.com',
          expected: { processed: 'https://example.com', added: true }
        },
        {
          input: 'https://example.com',
          expected: { processed: 'https://example.com', added: false }
        },
        {
          input: 'ftp://files.example.com',
          expected: { processed: 'ftp://files.example.com', added: false }
        }
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = ensureProtocol(input);
        expect(result.processed).toBe(expected.processed);
        expect(result.added).toBe(expected.added);
      });
    }, 5000);
  });

  describe('File Operations Integration', () => {
    test('should format file sizes across different scales', () => {
      const testCases = [
        { input: 1024, expectedUnit: 'KB' },
        { input: 1048576, expectedUnit: 'MB' },
        { input: 1073741824, expectedUnit: 'GB' },
        { input: 1099511627776, expectedUnit: 'TB' }
      ];
      
      testCases.forEach(({ input, expectedUnit }) => {
        const result = formatFileSize(input);
        expect(result.bytes).toBe(input);
        expect(result.unit).toBe(expectedUnit);
        expect(result.size).toBeGreaterThan(0);
        expect(result.formatted).toMatch(/\d+\.\d+ [KMGT]B/);
      });
    }, 5000);
  });

  describe('Middleware Integration', () => {
    test('should create and test API key validator', () => {
      const testApiKey = 'test-api-key-12345';
      const validator = createApiKeyValidator({ apiKey: testApiKey });
      
      // Mock Express request/response
      const req = {
        headers: { 'x-api-key': testApiKey }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const next = jest.fn();
      
      // Valid API key should pass
      validator(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.validatedApiKey).toBe(testApiKey);
      expect(res.status).not.toHaveBeenCalledWith(401);
    }, 5000);
    
    test('should create and test rate limiter', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        maxRequests: 5
      });
      
      // Mock Express request/response
      const req = {
        ip: '192.168.1.1',
        headers: {},
        app: { get: jest.fn().mockReturnValue(false) }
      };
      const res = { statusCode: 200 };
      res.status = jest.fn((code) => {
        res.statusCode = code;
        return res;
      });
      res.json = jest.fn().mockReturnThis();
      res.send = jest.fn().mockReturnThis();
      res.setHeader = jest.fn();
      res.headersSent = false;
      res.writableEnded = false;

      const next = jest.fn();
      
      // First 5 requests should pass
      for (let i = 0; i < 5; i++) {
        await limiter(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        next.mockClear(); // reset for next iteration
      }
      
      // 6th request should be rate limited
      await limiter(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(next).not.toHaveBeenCalled();
    }, 5000);
  });

  describe('Error Handling Integration', () => {
    test('should handle validation errors gracefully', () => {
      expect(() => {
        validateEmail(null);
      }).not.toThrow(); // Should not throw, return false
      
      expect(() => {
        formatFileSize(-1);
      }).not.toThrow(); // Should return error object
      
      expect(() => {
        formatDateTime('invalid-date');
      }).not.toThrow(); // Should return error object
    }, 5000);
    
    test('should handle edge cases', () => {
      // Edge cases for validation
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('a@b')).toBe(true); // Minimal valid
      
      // Edge cases for file size
      expect(formatFileSize(0)).toEqual({
        bytes: 0,
        formatted: '0 B',
        unit: 'B',
        size: 0,
        unitIndex: 0
      });
      
      // Edge cases for URL
      expect(ensureProtocol('').original).toBe('');
    }, 5000);
  });

  describe('Performance Metrics Integration', () => {
    test('should measure performance across utilities', async () => {
      const startTime = performance.now();
      
      // Run multiple utilities
      const emailValid = validateEmail('test@example.com');
      const urlFixed = ensureProtocol('example.com');
      const fileSize = formatFileSize(1048576);
      const dateFormatted = formatDateTime(new Date());
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // All should work correctly
      expect(emailValid).toBe(true);
      expect(urlFixed.added).toBe(true);
      expect(fileSize.unit).toBe('MB');
      expect(dateFormatted.formatted).toBeDefined();
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(100); // 100ms max
    }, 5000);
  });

  describe('Memory Efficiency Integration', () => {
    test('should handle large data operations efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        email: `user${i}@example.com`,
        data: `Lorem ipsum dolor sit amet ${i}`.repeat(10)
      }));
      
      // Process large dataset with memoization
      let processedCount = 0;
      const processUser = memoize((user) => {
        processedCount++;
        return {
          ...user,
          isValid: validateEmail(user.email),
          processedAt: Date.now()
        };
      });
      
      // Process all users
      const results = largeDataset.map(processUser);
      
      expect(results).toHaveLength(1000);
      expect(processedCount).toBe(1000); // Each unique user processed once
      
      // Process same dataset again (should use cache)
      const cachedResults = largeDataset.map(processUser);
      expect(cachedResults).toHaveLength(1000);
      expect(processedCount).toBe(1000); // No additional processing
    }, 20000);
  });
});

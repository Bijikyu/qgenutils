# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/tests/integration/core-functionality.test.js

### Output:
```
  ● QGenUtils Integration Tests › Security Integration › should validate email format

    TypeError: (0 , _validateEmail.validateEmail) is not a function

      20 |   describe('Security Integration', () => {
      21 |     it('should validate email format', () => {
    > 22 |       const result = validateEmail('user@example.com');
         |                                   ^
      23 |       expect(result).toBe(true);
      24 |     });
      25 |

      at Object.<anonymous> (tests/integration/core-functionality.test.js:22:35)

  ● QGenUtils Integration Tests › Security Integration › should hash and verify passwords

    TypeError: (0 , _hashPassword.hashPassword) is not a function

      25 |
      26 |     it('should hash and verify passwords', async () => {
    > 27 |       const { hash, salt } = await hashPassword('testPassword123!');
         |                                                ^
      28 |       const isValid = await verifyPassword('testPassword123!', hash, salt);
      29 |       expect(isValid).toBe(true);
      30 |     });

      at Object.<anonymous> (tests/integration/core-functionality.test.js:27:48)

  ● QGenUtils Integration Tests › Performance Integration › should memoize expensive functions

    TypeError: (0 , _memoize.memoize) is not a function

      39 |       };
      40 |       
    > 41 |       const memoizedFn = memoize(expensiveFn);
         |                                 ^
      42 |       
      43 |       // First call should execute function
      44 |       expect(memoizedFn(5)).toBe(10);

      at Object.<anonymous> (tests/integration/core-functionality.test.js:41:33)

  ● QGenUtils Integration Tests › Performance Integration › should debounce function calls

    TypeError: (0 , _debounce.debounce) is not a function

      52 |     it('should debounce function calls', (done) => {
      53 |       let callCount = 0;
    > 54 |       const debouncedFn = debounce(() => {
         |                                   ^
      55 |         callCount++;
      56 |       }, 100);
      57 |       

      at Object.<anonymous> (tests/integration/core-functionality.test.js:54:35)

  ● QGenUtils Integration Tests › Utility Integration › should format date time properly

    TypeError: (0 , _formatDateTime.formatDateTime) is not a function

      69 |   describe('Utility Integration', () => {
      70 |     it('should format date time properly', () => {
    > 71 |       const result = formatDateTime('2023-12-25T10:30:00.000Z');
         |                                    ^
      72 |       expect(result).toHaveProperty('formatted');
      73 |       expect(typeof result.formatted).toBe('string');
      74 |     });

      at Object.<anonymous> (tests/integration/core-functionality.test.js:71:36)

  ● QGenUtils Integration Tests › Utility Integration › should ensure protocol in URLs

    TypeError: (0 , _ensureProtocol.ensureProtocol) is not a function

      75 |
      76 |     it('should ensure protocol in URLs', () => {
    > 77 |       const result = ensureProtocol('example.com');
         |                                    ^
      78 |       expect(result).toHaveProperty('processed');
      79 |       expect(result.processed).toBe('https://example.com');
      80 |     });

      at Object.<anonymous> (tests/integration/core-functionality.test.js:77:36)

  ● QGenUtils Integration Tests › Utility Integration › should format file sizes

    TypeError: (0 , _formatFileSize.formatFileSize) is not a function

      81 |
      82 |     it('should format file sizes', () => {
    > 83 |       const result = formatFileSize(1024);
         |                                    ^
      84 |       expect(result).toBe('1.00 KB');
      85 |     });
      86 |   });

      at Object.<anonymous> (tests/integration/core-functionality.test.js:83:36)

  ● QGenUtils Integration Tests › Middleware Integration › should create API key validator

    TypeError: (0 , _createApiKeyValidator.createApiKeyValidator) is not a function

      88 |   describe('Middleware Integration', () => {
      89 |     it('should create API key validator', () => {
    > 90 |       const validator = createApiKeyValidator({
         |                                              ^
      91 |         headerName: 'X-API-Key',
      92 |         required: true
      93 |       });

      at Object.<anonymous> (tests/integration/core-functionality.test.js:90:46)

  ● QGenUtils Integration Tests › Middleware Integration › should create rate limiter

    TypeError: (0 , _createRateLimiter.createRateLimiter) is not a function

       97 |
       98 |     it('should create rate limiter', () => {
    >  99 |       const limiter = createRateLimiter({
          |                                        ^
      100 |         windowMs: 60000,
      101 |         max: 100
      102 |       });

      at Object.<anonymous> (tests/integration/core-functionality.test.js:99:40)

```

### Duration: 3031ms

---

## Summary

- Total failed tests: 1
- Failed test files: /home/runner/workspace/tests/integration/core-functionality.test.js
- Generated: 2026-01-09T11:13:16.881Z

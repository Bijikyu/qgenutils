# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/tests/integration/core-functionality.test.js

### Output:
```
  ● QGenUtils Integration Tests › Middleware Integration › should create and test rate limiter

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: 429

    Number of calls: 0

      216 |       // 6th request should be rate limited
      217 |       await limiter(req, res, next);
    > 218 |       expect(res.status).toHaveBeenCalledWith(429);
          |                          ^
      219 |       expect(next).not.toHaveBeenCalled();
      220 |     }, 5000);
      221 |   });

      at Object.toHaveBeenCalledWith (tests/integration/core-functionality.test.js:218:26)

```

### Duration: 6145ms

---

## Summary

- Total failed tests: 1
- Failed test files: /home/runner/workspace/tests/integration/core-functionality.test.js
- Generated: 2026-01-08T22:49:53.372Z

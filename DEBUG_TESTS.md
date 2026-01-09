# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/tests/integration/core-functionality.test.js

### Output:
```
  ● QGenUtils Integration Tests › Security Integration › should hash and verify passwords

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      27 |       const { hash, salt } = await hashPassword('testPassword123!');
      28 |       const isValid = await verifyPassword('testPassword123!', hash, salt);
    > 29 |       expect(isValid).toBe(true);
         |                       ^
      30 |     });
      31 |   });
      32 |

      at Object.toBe (tests/integration/core-functionality.test.js:29:23)

  ● QGenUtils Integration Tests › Utility Integration › should format file sizes

    expect(received).toBe(expected) // Object.is equality

    Expected: "1.00 KB"
    Received: {"bytes": 1024, "formatted": "1.0 KB", "size": 1, "unit": "KB", "unitIndex": 1}

      82 |     it('should format file sizes', () => {
      83 |       const result = formatFileSize(1024);
    > 84 |       expect(result).toBe('1.00 KB');
         |                      ^
      85 |     });
      86 |   });
      87 |

      at Object.toBe (tests/integration/core-functionality.test.js:84:22)

  ● QGenUtils Integration Tests › Middleware Integration › should create API key validator

    createApiKeyValidator requires an apiKey in config

      51 | function createApiKeyValidator(config: ApiKeyValidatorConfig) {
      52 |   if (!config.apiKey) { // validate required configuration
    > 53 |     throw new Error('createApiKeyValidator requires an apiKey in config');
         |           ^
      54 |   }
      55 |
      56 |   const {

      at createApiKeyValidator (lib/utilities/middleware/createApiKeyValidator.ts:53:11)
      at Object.<anonymous> (tests/integration/core-functionality.test.js:90:46)

```

### Duration: 3618ms

---

## Failed Test 2: /home/runner/workspace/lib/logger.test.js

### Output:
```
  ● Test suite failed to run

    Configuration error:

    Could not locate module qtests/setup mapped as:
    /home/runner/workspace/node_modules/qtests/dist/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^qtests\/(.*)$/": "/home/runner/workspace/node_modules/qtests/dist/$1"
      },
      "resolver": undefined
    }

    > 1 | require('qtests/setup');
        | ^
      2 | const qtests = require('qtests');
      3 | const winston = require('winston');
      4 | const DailyRotateFile = require('winston-daily-rotate-file');

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/resolver.js:759:17)
      at Object.require (lib/logger.test.js:1:1)

```

### Duration: 0ms

---

## Summary

- Total failed tests: 2
- Failed test files: /home/runner/workspace/tests/integration/core-functionality.test.js, /home/runner/workspace/lib/logger.test.js
- Generated: 2026-01-09T17:50:46.667Z

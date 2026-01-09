# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/lib/utilities/datetime/datetime.test.js

### Output:
```
  ● DateTime Utilities › addDays › should add days to date

    expect(received).toBe(expected) // Object.is equality

    Expected: 8
    Received: 9

      45 |       const result = addDays(testDate, 7);
      46 |       expect(result instanceof Date).toBe(true);
    > 47 |       expect(result.getDate()).toBe(8);
         |                                ^
      48 |     });
      49 |   });
      50 | });

      at Object.toBe (lib/utilities/datetime/datetime.test.js:47:32)

```

### Duration: 3292ms

---

## Failed Test 2: /home/runner/workspace/tests/integration/core-functionality.test.js

### Output:
```
  ● Test suite failed to run

    Configuration error:

    Could not locate module ../../lib/utilities/validation/validateEmail.js mapped as:
    $1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^(\.{1,2}\/.*)\.js$/": "$1"
      },
      "resolver": undefined
    }

       6 |
       7 | // Import utilities individually to avoid ES module issues
    >  8 | import { validateEmail } from '../../lib/utilities/validation/validateEmail.js';
         | ^
       9 | import { hashPassword } from '../../lib/utilities/password/hashPassword.js';
      10 | import { verifyPassword } from '../../lib/utilities/password/verifyPassword.js';
      11 | import { memoize } from '../../lib/utilities/performance/memoize.js';

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/resolver.js:759:17)
      at Object.require (tests/integration/core-functionality.test.js:8:1)

```

### Duration: 0ms

---

## Summary

- Total failed tests: 2
- Failed test files: /home/runner/workspace/lib/utilities/datetime/datetime.test.js, /home/runner/workspace/tests/integration/core-functionality.test.js
- Generated: 2026-01-09T02:59:29.012Z

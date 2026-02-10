# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/lib/logger.test.js

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

- Total failed tests: 1
- Failed test files: /home/runner/workspace/lib/logger.test.js
- Generated: 2026-02-10T19:51:04.033Z

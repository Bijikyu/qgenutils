# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/lib/utilities/module-loader/DynamicImportCache.test.js

### Output:
```
  ● DynamicImportCache › getModule › should return null for non-existent modules

    TypeError: qerrors is not a function

      111 |
      112 |     // Use qerrors for consistent error reporting across the application
    > 113 |     qerrors(moduleError, 'loadAndFlattenModule', { message: `Module loading failed for: ${moduleName}` });
          |     ^
      114 |
      115 |     // Return null for backward compatibility and graceful fallback handling
      116 |     // The error is logged with full context, but calling code can handle the null result

      at loadAndFlattenModule (lib/utilities/module-loader/loadAndFlattenModule.ts:113:5)
      at lib/utilities/module-loader/DynamicImportCache.ts:257:18
      at DynamicImportCache.getModule (lib/utilities/module-loader/DynamicImportCache.ts:300:22)
      at Object.<anonymous> (lib/utilities/module-loader/DynamicImportCache.test.js:59:22)

```

### Duration: 7337ms

---

## Failed Test 2: /home/runner/workspace/lib/utilities/datetime/datetime.test.js

### Output:
```
  ● DateTime Utilities › formatDuration › should format duration in milliseconds

    TypeError: qerrors is not a function

      67 |   } catch (err) {
      68 |     logger.error('formatDuration failed', err);
    > 69 |     qerrors(err instanceof Error ? err : new Error(String(err)), 'formatDuration');
         |     ^
      70 |     return '00:00:00';
      71 |   }
      72 | }

      at formatDuration (lib/utilities/datetime/formatDuration.ts:69:5)
      at Object.formatDuration (lib/utilities/datetime/datetime.test.js:36:14)

```

### Duration: 1516ms

---

## Summary

- Total failed tests: 2
- Failed test files: /home/runner/workspace/lib/utilities/module-loader/DynamicImportCache.test.js, /home/runner/workspace/lib/utilities/datetime/datetime.test.js
- Generated: 2026-02-11T09:42:56.749Z

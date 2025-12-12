# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/lib/security/validateUserInput.GeneratedTest.test.ts

### Output:
```
  ● Test suite failed to run

    The name `expect` was looked up in the Haste module map. It cannot be resolved, because there exists several different files, or packages, that provide a module for that particular name and platform. The platform is generic (no extension). You must delete or exclude files until there remains only one of these:

      * `/home/runner/workspace/.cache/.bun/install/cache/expect@29.7.0@@@1/package.json` (package)
      * `/home/runner/workspace/.cache/.bun/install/cache/expect@30.2.0@@@1/package.json` (package)

      at ModuleMap._assertNoDuplicates (node_modules/jest-haste-map/build/ModuleMap.js:189:11)
      at _expect (node_modules/@jest/expect/build/index.js:8:16)
      at createJestExpect (node_modules/@jest/expect/build/index.js:29:3)
      at Object.<anonymous> (node_modules/@jest/expect/build/index.js:39:20)

```

### Duration: 0ms

---

## Failed Test 2: /home/runner/workspace/lib/security/sanitizeObjectRecursively.GeneratedTest.test.ts

### Output:
```
  ● Test suite failed to run

    The name `expect` was looked up in the Haste module map. It cannot be resolved, because there exists several different files, or packages, that provide a module for that particular name and platform. The platform is generic (no extension). You must delete or exclude files until there remains only one of these:

      * `/home/runner/workspace/.cache/.bun/install/cache/expect@29.7.0@@@1/package.json` (package)
      * `/home/runner/workspace/.cache/.bun/install/cache/expect@30.2.0@@@1/package.json` (package)

      at ModuleMap._assertNoDuplicates (node_modules/jest-haste-map/build/ModuleMap.js:189:11)
      at _expect (node_modules/@jest/expect/build/index.js:8:16)
      at createJestExpect (node_modules/@jest/expect/build/index.js:29:3)
      at Object.<anonymous> (node_modules/@jest/expect/build/index.js:39:20)

```

### Duration: 0ms

---

## Summary

- Total failed tests: 2
- Failed test files: /home/runner/workspace/lib/security/validateUserInput.GeneratedTest.test.ts, /home/runner/workspace/lib/security/sanitizeObjectRecursively.GeneratedTest.test.ts
- Generated: 2025-12-12T08:14:42.057Z

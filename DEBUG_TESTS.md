# Test Failure Analysis

**Creation Time:** 2025-08-19T09:44:18.089Z
**Pacific Time:** Tuesday, August 19, 2025 at 02:44:18 AM PDT

⚠️ **STALENESS WARNING:** If your code changes are after the creation time above and you are checking this file, then it is stale and tests need to be rerun.

Analyze and address the following test failures:

## Failed Test 1: index.exports.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: index.exports.test.js - 0 matches

```

### Duration: 17123ms

---

## Failed Test 2: index.test.js

### Output:
```
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
FAIL tests/index.test.js
  ● Test suite failed to run

    [96mtests/setup.ts[0m:[93m4[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'beforeAll'.

    [7m4[0m beforeAll(async () => {
    [7m [0m [91m~~~~~~~~~[0m
    [96mtests/setup.ts[0m:[93m9[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'afterAll'.

    [7m9[0m afterAll(async () => {
    [7m [0m [91m~~~~~~~~[0m

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        3.127 s
Ran all test suites matching /index.test.js/i.

```

### Duration: 20033ms

---

## Failed Test 3: lib/additional-edge-cases.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/additional-edge-cases.test.js - 0 matches

```

### Duration: 15194ms

---

## Failed Test 4: lib/logger.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/logger.test.js - 0 matches

```

### Duration: 15357ms

---

## Failed Test 5: lib/security/auth/auth.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/security/auth/auth.test.js - 0 matches

```

### Duration: 15913ms

---

## Failed Test 6: lib/security/auth/checkPassportAuth.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/security/auth/checkPassportAuth.test.js - 0 matches

```

### Duration: 16335ms

---

## Failed Test 7: lib/security/auth/hasGithubStrategy.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/security/auth/hasGithubStrategy.test.js - 0 matches

```

### Duration: 13968ms

---

## Failed Test 8: lib/security/input-sanitization.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/security/input-sanitization.test.js - 0 matches

```

### Duration: 14575ms

---

## Failed Test 9: lib/system/env/env.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/env/env.test.js - 0 matches

```

### Duration: 14222ms

---

## Failed Test 10: lib/system/env/getEnvVar.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/env/getEnvVar.test.js - 0 matches

```

### Duration: 10306ms

---

## Failed Test 11: lib/system/env/hasEnvVar.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/env/hasEnvVar.test.js - 0 matches

```

### Duration: 13255ms

---

## Failed Test 12: lib/system/env/requireEnvVars.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/env/requireEnvVars.test.js - 0 matches

```

### Duration: 10132ms

---

## Failed Test 13: lib/system/realtime/createBroadcastRegistry.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/realtime/createBroadcastRegistry.test.js - 0 matches

```

### Duration: 8621ms

---

## Failed Test 14: lib/system/realtime/realtime.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/realtime/realtime.test.js - 0 matches

```

### Duration: 9781ms

---

## Failed Test 15: lib/system/shutdown/createShutdownManager.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/shutdown/createShutdownManager.test.js - 0 matches

```

### Duration: 8156ms

---

## Failed Test 16: lib/system/shutdown/gracefulShutdown.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/shutdown/gracefulShutdown.test.js - 0 matches

```

### Duration: 8419ms

---

## Failed Test 17: lib/system/shutdown/shutdown-utils.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/shutdown/shutdown-utils.test.js - 0 matches

```

### Duration: 16951ms

---

## Failed Test 18: lib/system/worker-pool/createWorkerPool.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/worker-pool/createWorkerPool.test.js - 0 matches

```

### Duration: 16540ms

---

## Failed Test 19: lib/system/worker-pool/worker-pool.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/system/worker-pool/worker-pool.test.js - 0 matches

```

### Duration: 15637ms

---

## Failed Test 20: lib/utilities/datetime/addDays.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/datetime/addDays.test.js - 0 matches

```

### Duration: 15415ms

---

## Failed Test 21: lib/utilities/datetime/datetime-enhanced.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/datetime/datetime-enhanced.test.js - 0 matches

```

### Duration: 14671ms

---

## Failed Test 22: lib/utilities/datetime/datetime.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/datetime/datetime.test.js - 0 matches

```

### Duration: 12116ms

---

## Failed Test 23: lib/utilities/datetime/formatDate.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/datetime/formatDate.test.js - 0 matches

```

### Duration: 15256ms

---

## Failed Test 24: lib/utilities/datetime/formatDateTime.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/datetime/formatDateTime.test.js - 0 matches

```

### Duration: 16006ms

---

## Failed Test 25: lib/utilities/datetime/formatDateWithPrefix.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/datetime/formatDateWithPrefix.test.js - 0 matches

```

### Duration: 13492ms

---

## Failed Test 26: lib/utilities/datetime/formatDuration.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/datetime/formatDuration.test.js - 0 matches

```

### Duration: 8933ms

---

## Failed Test 27: lib/utilities/file/file-utils.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/file/file-utils.test.js - 0 matches

```

### Duration: 11771ms

---

## Failed Test 28: lib/utilities/file/formatFileSize.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/file/formatFileSize.test.js - 0 matches

```

### Duration: 10885ms

---

## Failed Test 29: lib/utilities/id-generation/generateExecutionId.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/id-generation/generateExecutionId.test.js - 0 matches

```

### Duration: 8245ms

---

## Failed Test 30: lib/utilities/id-generation/id-generation.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/id-generation/id-generation.test.js - 0 matches

```

### Duration: 8181ms

---

## Failed Test 31: lib/utilities/string/sanitizeString.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/string/sanitizeString.test.js - 0 matches

```

### Duration: 7642ms

---

## Failed Test 32: lib/utilities/string/string-utils.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/string/string-utils.test.js - 0 matches

```

### Duration: 7768ms

---

## Failed Test 33: lib/utilities/url/ensureProtocol.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/url/ensureProtocol.test.js - 0 matches

```

### Duration: 14268ms

---

## Failed Test 34: lib/utilities/url/normalizeUrlOrigin.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/url/normalizeUrlOrigin.test.js - 0 matches

```

### Duration: 14931ms

---

## Failed Test 35: lib/utilities/url/parseUrlParts.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/url/parseUrlParts.test.js - 0 matches

```

### Duration: 15180ms

---

## Failed Test 36: lib/utilities/url/stripProtocol.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/url/stripProtocol.test.js - 0 matches

```

### Duration: 13916ms

---

## Failed Test 37: lib/utilities/url/url.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/utilities/url/url.test.js - 0 matches

```

### Duration: 9133ms

---

## Failed Test 38: lib/validation/advanced-validation.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/advanced-validation.test.js - 0 matches

```

### Duration: 13663ms

---

## Failed Test 39: lib/validation/github-validation.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/github-validation.test.js - 0 matches

```

### Duration: 13576ms

---

## Failed Test 40: lib/validation/hasMethod.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/hasMethod.test.js - 0 matches

```

### Duration: 9110ms

---

## Failed Test 41: lib/validation/input-validation.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/input-validation.test.js - 0 matches

```

### Duration: 11085ms

---

## Failed Test 42: lib/validation/isValidDate.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/isValidDate.test.js - 0 matches

```

### Duration: 13177ms

---

## Failed Test 43: lib/validation/isValidObject.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/isValidObject.test.js - 0 matches

```

### Duration: 9086ms

---

## Failed Test 44: lib/validation/isValidString.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/isValidString.test.js - 0 matches

```

### Duration: 7352ms

---

## Failed Test 45: lib/validation/requireFields.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/requireFields.test.js - 0 matches

```

### Duration: 12100ms

---

## Failed Test 46: lib/validation/validateEmail.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/validateEmail.test.js - 0 matches

```

### Duration: 9054ms

---

## Failed Test 47: lib/validation/validateGitHubUrl.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/validateGitHubUrl.test.js - 0 matches

```

### Duration: 9044ms

---

## Failed Test 48: lib/validation/validateRequired.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/validateRequired.test.js - 0 matches

```

### Duration: 7347ms

---

## Failed Test 49: lib/validation/validation.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  8 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 4 matches
  testPathIgnorePatterns: /node_modules/ - 8 matches
  testRegex:  - 0 matches
Pattern: lib/validation/validation.test.js - 0 matches

```

### Duration: 4857ms

---

## Failed Test 50: tests/index.test.js

### Output:
```
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
FAIL tests/index.test.js
  ● Test suite failed to run

    [96mtests/setup.ts[0m:[93m4[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'beforeAll'.

    [7m4[0m beforeAll(async () => {
    [7m [0m [91m~~~~~~~~~[0m
    [96mtests/setup.ts[0m:[93m9[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'afterAll'.

    [7m9[0m afterAll(async () => {
    [7m [0m [91m~~~~~~~~[0m

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        7.917 s
Ran all test suites matching /tests\/index.test.js/i.

```

### Duration: 13578ms

---

## Failed Test 51: tests/integration/error-handling.test.js

### Output:
```
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
FAIL tests/integration/error-handling.test.js
  ● Test suite failed to run

    [96mtests/setup.ts[0m:[93m4[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'beforeAll'.

    [7m4[0m beforeAll(async () => {
    [7m [0m [91m~~~~~~~~~[0m
    [96mtests/setup.ts[0m:[93m9[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'afterAll'.

    [7m9[0m afterAll(async () => {
    [7m [0m [91m~~~~~~~~[0m

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        8.099 s
Ran all test suites matching /tests\/integration\/error-handling.test.js/i.

```

### Duration: 13255ms

---

## Failed Test 52: tests/integration/simplified-module-interactions.test.js

### Output:
```
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
FAIL tests/integration/simplified-module-interactions.test.js
  ● Test suite failed to run

    [96mtests/setup.ts[0m:[93m4[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'beforeAll'.

    [7m4[0m beforeAll(async () => {
    [7m [0m [91m~~~~~~~~~[0m
    [96mtests/setup.ts[0m:[93m9[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'afterAll'.

    [7m9[0m afterAll(async () => {
    [7m [0m [91m~~~~~~~~[0m

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        7.886 s
Ran all test suites matching /tests\/integration\/simplified-module-interactions.test.js/i.

```

### Duration: 12681ms

---

## Failed Test 53: tests/jest.config.test.js

### Output:
```
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
FAIL tests/jest.config.test.js
  ● Test suite failed to run

    [96mtests/setup.ts[0m:[93m4[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'beforeAll'.

    [7m4[0m beforeAll(async () => {
    [7m [0m [91m~~~~~~~~~[0m
    [96mtests/setup.ts[0m:[93m9[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name 'afterAll'.

    [7m9[0m afterAll(async () => {
    [7m [0m [91m~~~~~~~~[0m

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        8.11 s
Ran all test suites matching /tests\/jest.config.test.js/i.

```

### Duration: 13437ms

---

## Summary

- Total failed tests: 53
- Failed test files: index.exports.test.js, index.test.js, lib/additional-edge-cases.test.js, lib/logger.test.js, lib/security/auth/auth.test.js, lib/security/auth/checkPassportAuth.test.js, lib/security/auth/hasGithubStrategy.test.js, lib/security/input-sanitization.test.js, lib/system/env/env.test.js, lib/system/env/getEnvVar.test.js, lib/system/env/hasEnvVar.test.js, lib/system/env/requireEnvVars.test.js, lib/system/realtime/createBroadcastRegistry.test.js, lib/system/realtime/realtime.test.js, lib/system/shutdown/createShutdownManager.test.js, lib/system/shutdown/gracefulShutdown.test.js, lib/system/shutdown/shutdown-utils.test.js, lib/system/worker-pool/createWorkerPool.test.js, lib/system/worker-pool/worker-pool.test.js, lib/utilities/datetime/addDays.test.js, lib/utilities/datetime/datetime-enhanced.test.js, lib/utilities/datetime/datetime.test.js, lib/utilities/datetime/formatDate.test.js, lib/utilities/datetime/formatDateTime.test.js, lib/utilities/datetime/formatDateWithPrefix.test.js, lib/utilities/datetime/formatDuration.test.js, lib/utilities/file/file-utils.test.js, lib/utilities/file/formatFileSize.test.js, lib/utilities/id-generation/generateExecutionId.test.js, lib/utilities/id-generation/id-generation.test.js, lib/utilities/string/sanitizeString.test.js, lib/utilities/string/string-utils.test.js, lib/utilities/url/ensureProtocol.test.js, lib/utilities/url/normalizeUrlOrigin.test.js, lib/utilities/url/parseUrlParts.test.js, lib/utilities/url/stripProtocol.test.js, lib/utilities/url/url.test.js, lib/validation/advanced-validation.test.js, lib/validation/github-validation.test.js, lib/validation/hasMethod.test.js, lib/validation/input-validation.test.js, lib/validation/isValidDate.test.js, lib/validation/isValidObject.test.js, lib/validation/isValidString.test.js, lib/validation/requireFields.test.js, lib/validation/validateEmail.test.js, lib/validation/validateGitHubUrl.test.js, lib/validation/validateRequired.test.js, lib/validation/validation.test.js, tests/index.test.js, tests/integration/error-handling.test.js, tests/integration/simplified-module-interactions.test.js, tests/jest.config.test.js
- Generated: 2025-08-19T09:44:18.110Z

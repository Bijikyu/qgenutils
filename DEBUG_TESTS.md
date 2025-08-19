# Test Failure Analysis

**Creation Time:** 2025-08-19T10:42:00.831Z
**Pacific Time:** Tuesday, August 19, 2025 at 03:42:00 AM PDT

⚠️ **STALENESS WARNING:** If your code changes are after the creation time above and you are checking this file, then it is stale and tests need to be rerun.

Analyze and address the following test failures:

## Failed Test 1: index.exports.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  85 files checked.
  roots: /home/runner/workspace/lib, /home/runner/workspace/tests - 85 matches
  testMatch: **/tests/**/*.test.js, **/*.test.js - 51 matches
  testPathIgnorePatterns: /node_modules/ - 85 matches
  testRegex:  - 0 matches
Pattern: index.exports.test.js - 0 matches

```

### Duration: 47208ms

---

## Failed Test 2: lib/additional-edge-cases.test.js

### Output:
```
FAIL lib/additional-edge-cases.test.js (5.353 s)
  Additional Edge Cases
    stripProtocol
      ✕ should return input when not string and log error (25 ms)
    parseUrlParts
      ✕ should return null for malformed url with protocol only (25 ms)

  ● Additional Edge Cases › stripProtocol › should return input when not string and log error

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      19 |       const mockQerrors = jest.spyOn(require('qerrors'), 'qerrors').mockImplementation(() => {});
      20 |       const result = stripProtocol(null);
    > 21 |       expect(mockQerrors).toHaveBeenCalled(); // confirm error logged for bad input
         |                           ^
      22 |       expect(result).toBeNull(); // invalid input returns null
      23 |       mockQerrors.mockRestore();
      24 |     });

      at Object.toHaveBeenCalled (lib/additional-edge-cases.test.js:21:27)

  ● Additional Edge Cases › parseUrlParts › should return null for malformed url with protocol only

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      29 |       const mockQerrors = jest.spyOn(require('qerrors'), 'qerrors').mockImplementation(() => {});
      30 |       const result = parseUrlParts('http://');
    > 31 |       expect(mockQerrors).toHaveBeenCalled(); // invalid url should trigger logging
         |                           ^
      32 |       expect(result).toBeNull(); // result should be null on failure
      33 |       mockQerrors.mockRestore();
      34 |     });

      at Object.toHaveBeenCalled (lib/additional-edge-cases.test.js:31:27)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/additional-edge-cases.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)
      at qerrors (node_modules/qerrors/lib/qerrors.js:387:10)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/additional-edge-cases.test.js.

      at Object.get [as File] (node_modules/winston/lib/winston/transports/index.js:30:12)
      at node_modules/qerrors/lib/logger.js:164:57
      at buildLogger (node_modules/qerrors/lib/logger.js:171:11)
      at qerrors (node_modules/qerrors/lib/qerrors.js:387:10)
/home/runner/workspace/node_modules/qerrors/lib/logger.js:164
                                arr.push(new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', ...rotationOpts, maxFiles: fileCap, format: fileFormat })); //(size-based rotation for error files with count limit)
                                         ^

TypeError: transports.File is not a constructor
    at /home/runner/workspace/node_modules/qerrors/lib/logger.js:164:42
    at buildLogger (/home/runner/workspace/node_modules/qerrors/lib/logger.js:171:11)
    at qerrors (/home/runner/workspace/node_modules/qerrors/lib/qerrors.js:387:10)

Node.js v20.19.3

```

### Duration: 49907ms

---

## Failed Test 3: lib/system/env/env.test.js

### Output:
```
/home/runner/workspace/lib/system/env/env.test.js:244
              throw new Error('Environment access error');
                    ^

Error: Environment access error
    at Object.get (/home/runner/workspace/lib/system/env/env.test.js:270:21)
    at Object.getEnv (/home/runner/workspace/node_modules/qerrors/lib/config.js:51:21)
    at verboseLog (/home/runner/workspace/node_modules/qerrors/lib/qerrors.js:90:20)
    at qerrors (/home/runner/workspace/node_modules/qerrors/lib/qerrors.js:351:9)
    at qerrors (/home/runner/workspace/lib/system/env/requireEnvVars.js:108:5)
    at Object.requireEnvVars (/home/runner/workspace/lib/system/env/env.test.js:278:25)
    at Promise.then.completed (/home/runner/workspace/node_modules/jest-circus/build/utils.js:298:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/home/runner/workspace/node_modules/jest-circus/build/utils.js:231:10)
    at _callCircusTest (/home/runner/workspace/node_modules/jest-circus/build/run.js:316:40)
    at _runTest (/home/runner/workspace/node_modules/jest-circus/build/run.js:252:3)
    at _runTestsForDescribeBlock (/home/runner/workspace/node_modules/jest-circus/build/run.js:126:9)
    at _runTestsForDescribeBlock (/home/runner/workspace/node_modules/jest-circus/build/run.js:121:9)
    at _runTestsForDescribeBlock (/home/runner/workspace/node_modules/jest-circus/build/run.js:121:9)
    at run (/home/runner/workspace/node_modules/jest-circus/build/run.js:71:3)
    at runAndTransformResultsToJestFormat (/home/runner/workspace/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
    at jestAdapter (/home/runner/workspace/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
    at runTestInternal (/home/runner/workspace/node_modules/jest-runner/build/runTest.js:367:16)
    at runTest (/home/runner/workspace/node_modules/jest-runner/build/runTest.js:444:34)

Node.js v20.19.3

```

### Duration: 28030ms

---

## Failed Test 4: lib/system/realtime/realtime.test.js

### Output:
```
FAIL lib/system/realtime/realtime.test.js (15.643 s)
  Real-time Communication Utilities
    createBroadcastRegistry
      ✕ should create registry with specified functions (79 ms)
      ✕ should handle invalid configuration gracefully (3 ms)
      ✓ should allow setting and getting broadcast functions (20 ms)
      ✕ should reject non-function values (6 ms)
      ✓ should allow setting functions to null (2 ms)
      ✕ should track function readiness correctly (87 ms)
      ✕ should clear all functions (1 ms)
      ✕ should skip invalid function names (6 ms)
      ✕ should prevent deletion of registry properties (7 ms)
    createPaymentBroadcastRegistry
      ✕ should create registry with standard payment functions
      ✕ should work with standard payment workflow
      ✕ should support typical usage patterns
    createSocketBroadcastRegistry
      ✕ should create registry with static interface (1 ms)
      ✕ should allow function assignment through setters
      ✕ should execute assigned functions correctly
      ✕ should validate function assignments
      ✕ should track readiness state correctly
      ✕ should support function clearing
      ✕ should handle null assignments correctly
      ✕ should work with typical socket.io usage patterns
      ✕ should match expected interface exactly (1 ms)
    validateBroadcastData
      ✕ should validate simple valid data
      ✕ should reject null and undefined data (1 ms)
      ✕ should reject circular references
      ✕ should reject oversized data
      ✕ should detect potentially sensitive data (1 ms)
      ✕ should reject functions by default
      ✕ should allow functions when explicitly enabled
      ✕ should handle nested objects
      ✕ should handle arrays
      ✕ should handle custom size limits
      ✕ should handle validation errors gracefully (1 ms)
    Integration Scenarios
      ✕ should support complete broadcast workflow
      ✕ should handle service initialization timing (1 ms)
      ✕ should support testing with mock functions (67 ms)

  ● Real-time Communication Utilities › createBroadcastRegistry › should create registry with specified functions

    expect(received).toBeNull()

    Received: undefined

      17 |       
      18 |       expect(typeof registry).toBe('object'); // returns object
    > 19 |       expect(registry.broadcastNotification).toBeNull(); // functions start as null
         |                                              ^
      20 |       expect(registry.broadcastUpdate).toBeNull(); // functions start as null
      21 |       expect(typeof registry.allFunctionsReady).toBe('function'); // utility methods available
      22 |       expect(typeof registry.getMissingFunctions).toBe('function'); // utility methods available

      at Object.toBeNull (lib/system/realtime/realtime.test.js:19:46)

  ● Real-time Communication Utilities › createBroadcastRegistry › should handle invalid configuration gracefully

    expect(received).toThrow(expected)

    Expected substring: "Configuration object required"

    Received function did not throw

      25 |     // verifies should handle invalid configuration gracefully
      26 |     test('should handle invalid configuration gracefully', () => {
    > 27 |       expect(() => createBroadcastRegistry(null)).toThrow('Configuration object required');
         |                                                   ^
      28 |       expect(() => createBroadcastRegistry({})).toThrow('Functions array required in configuration');
      29 |       expect(() => createBroadcastRegistry({ functions: [] })).toThrow('Functions array required in configuration');
      30 |       expect(() => createBroadcastRegistry({ functions: 'not-array' })).toThrow('Functions array required in configuration');

      at Object.toThrow (lib/system/realtime/realtime.test.js:27:51)

  ● Real-time Communication Utilities › createBroadcastRegistry › should reject non-function values

    expect(received).toThrow(expected)

    Expected substring: "Broadcast function testBroadcast must be a function or null"

    Received function did not throw

      51 |       expect(() => {
      52 |         registry.testBroadcast = 'not-a-function';
    > 53 |       }).toThrow('Broadcast function testBroadcast must be a function or null');
         |          ^
      54 |       
      55 |       expect(() => {
      56 |         registry.testBroadcast = 123;

      at Object.toThrow (lib/system/realtime/realtime.test.js:53:10)

  ● Real-time Communication Utilities › createBroadcastRegistry › should track function readiness correctly

    TypeError: registry.allFunctionsReady is not a function

      82 |       });
      83 |       
    > 84 |       expect(registry.allFunctionsReady()).toBe(false); // no functions registered
         |                       ^
      85 |       expect(registry.getMissingFunctions()).toEqual(['func1', 'func2', 'func3']); // all missing
      86 |       
      87 |       registry.func1 = jest.fn();

      at Object.allFunctionsReady (lib/system/realtime/realtime.test.js:84:23)

  ● Real-time Communication Utilities › createBroadcastRegistry › should clear all functions

    TypeError: registry.allFunctionsReady is not a function

      103 |       registry.func1 = jest.fn();
      104 |       registry.func2 = jest.fn();
    > 105 |       expect(registry.allFunctionsReady()).toBe(true);
          |                       ^
      106 |       
      107 |       registry.clearAllFunctions();
      108 |       expect(registry.func1).toBeNull(); // cleared

      at Object.allFunctionsReady (lib/system/realtime/realtime.test.js:105:23)

  ● Real-time Communication Utilities › createBroadcastRegistry › should skip invalid function names

    expect(received).toBeNull()

    Received: undefined

      117 |       });
      118 |       
    > 119 |       expect(registry.validFunction).toBeNull(); // valid function available
          |                                      ^
      120 |       expect(registry['']).toBeUndefined(); // invalid names not added
      121 |       expect(registry['   ']).toBeUndefined(); // whitespace names not added
      122 |       expect(registry[null]).toBeUndefined(); // null names not added

      at Object.toBeNull (lib/system/realtime/realtime.test.js:119:38)

  ● Real-time Communication Utilities › createBroadcastRegistry › should prevent deletion of registry properties

    expect(received).not.toBeUndefined()

    Received: undefined

      133 |       
      134 |       delete registry.testFunction;
    > 135 |       expect(registry.testFunction).not.toBeUndefined(); // property still exists (configurable: false)
          |                                         ^
      136 |     });
      137 |   });
      138 |

      at Object.toBeUndefined (lib/system/realtime/realtime.test.js:135:41)

  ● Real-time Communication Utilities › createPaymentBroadcastRegistry › should create registry with standard payment functions

    ReferenceError: createPaymentBroadcastRegistry is not defined

      141 |     // verifies should create registry with standard payment functions
      142 |     test('should create registry with standard payment functions', () => {
    > 143 |       const registry = createPaymentBroadcastRegistry();
          |                        ^
      144 |       
      145 |       expect(typeof registry).toBe('object'); // returns object
      146 |       expect(registry.broadcastOutcome).toBeNull(); // standard payment function

      at Object.createPaymentBroadcastRegistry (lib/system/realtime/realtime.test.js:143:24)

  ● Real-time Communication Utilities › createPaymentBroadcastRegistry › should work with standard payment workflow

    ReferenceError: createPaymentBroadcastRegistry is not defined

      151 |     // verifies should work with standard payment workflow
      152 |     test('should work with standard payment workflow', () => {
    > 153 |       const registry = createPaymentBroadcastRegistry();
          |                        ^
      154 |       
      155 |       const mockOutcomeFn = jest.fn();
      156 |       const mockUsageFn = jest.fn();

      at Object.createPaymentBroadcastRegistry (lib/system/realtime/realtime.test.js:153:24)

  ● Real-time Communication Utilities › createPaymentBroadcastRegistry › should support typical usage patterns

    ReferenceError: createPaymentBroadcastRegistry is not defined

      166 |     // verifies should support typical usage patterns
      167 |     test('should support typical usage patterns', () => {
    > 168 |       const registry = createPaymentBroadcastRegistry();
          |                        ^
      169 |       
      170 |       // Simulate socket server registration
      171 |       const mockIo = {

      at Object.createPaymentBroadcastRegistry (lib/system/realtime/realtime.test.js:168:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should create registry with static interface

    ReferenceError: createSocketBroadcastRegistry is not defined

      189 |     // verifies should create registry with static interface
      190 |     test('should create registry with static interface', () => {
    > 191 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      192 |       
      193 |       expect(registry).toBeDefined(); // registry created
      194 |       expect(typeof registry).toBe('object'); // returns object

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:191:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should allow function assignment through setters

    ReferenceError: createSocketBroadcastRegistry is not defined

      202 |     // verifies should allow function assignment through setters
      203 |     test('should allow function assignment through setters', () => {
    > 204 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      205 |       const mockOutcomeFunction = jest.fn();
      206 |       const mockUsageFunction = jest.fn();
      207 |       

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:204:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should execute assigned functions correctly

    ReferenceError: createSocketBroadcastRegistry is not defined

      216 |     // verifies should execute assigned functions correctly
      217 |     test('should execute assigned functions correctly', () => {
    > 218 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      219 |       const mockOutcomeFunction = jest.fn();
      220 |       const mockUsageFunction = jest.fn();
      221 |       

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:218:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should validate function assignments

    ReferenceError: createSocketBroadcastRegistry is not defined

      235 |     // verifies should validate function assignments
      236 |     test('should validate function assignments', () => {
    > 237 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      238 |       
      239 |       // Test invalid assignments
      240 |       expect(() => {

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:237:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should track readiness state correctly

    ReferenceError: createSocketBroadcastRegistry is not defined

      264 |     // verifies should track readiness state correctly
      265 |     test('should track readiness state correctly', () => {
    > 266 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      267 |       
      268 |       expect(registry.allFunctionsReady()).toBe(false); // initially not ready
      269 |       expect(registry.getMissingFunctions()).toEqual(['broadcastOutcome', 'broadcastUsageUpdate']); // both missing

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:266:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should support function clearing

    ReferenceError: createSocketBroadcastRegistry is not defined

      280 |     // verifies should support function clearing
      281 |     test('should support function clearing', () => {
    > 282 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      283 |       
      284 |       registry.broadcastOutcome = () => {};
      285 |       registry.broadcastUsageUpdate = () => {};

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:282:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should handle null assignments correctly

    ReferenceError: createSocketBroadcastRegistry is not defined

      294 |     // verifies should handle null assignments correctly
      295 |     test('should handle null assignments correctly', () => {
    > 296 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      297 |       const mockFunction = jest.fn();
      298 |       
      299 |       registry.broadcastOutcome = mockFunction;

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:296:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should work with typical socket.io usage patterns

    ReferenceError: createSocketBroadcastRegistry is not defined

      307 |     // verifies should work with typical socket.io usage patterns
      308 |     test('should work with typical socket.io usage patterns', () => {
    > 309 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      310 |       
      311 |       // Simulate socket.io setup
      312 |       const mockIo = {

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:309:24)

  ● Real-time Communication Utilities › createSocketBroadcastRegistry › should match expected interface exactly

    ReferenceError: createSocketBroadcastRegistry is not defined

      336 |     // verifies should match expected interface exactly
      337 |     test('should match expected interface exactly', () => {
    > 338 |       const registry = createSocketBroadcastRegistry();
          |                        ^
      339 |       
      340 |       // Check property names match specification
      341 |       expect(registry).toHaveProperty('broadcastOutcome');

      at Object.createSocketBroadcastRegistry (lib/system/realtime/realtime.test.js:338:24)

  ● Real-time Communication Utilities › validateBroadcastData › should validate simple valid data

    ReferenceError: validateBroadcastData is not defined

      361 |     test('should validate simple valid data', () => {
      362 |       const data = { status: 'success', id: '123' };
    > 363 |       const result = validateBroadcastData(data);
          |                      ^
      364 |       
      365 |       expect(result.isValid).toBe(true); // valid data passes
      366 |       expect(result.errors).toEqual([]); // no errors

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:363:22)

  ● Real-time Communication Utilities › validateBroadcastData › should reject null and undefined data

    ReferenceError: validateBroadcastData is not defined

      369 |     // verifies should reject null and undefined data
      370 |     test('should reject null and undefined data', () => {
    > 371 |       const nullResult = validateBroadcastData(null);
          |                          ^
      372 |       const undefinedResult = validateBroadcastData(undefined);
      373 |       
      374 |       expect(nullResult.isValid).toBe(false); // null rejected

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:371:26)

  ● Real-time Communication Utilities › validateBroadcastData › should reject circular references

    ReferenceError: validateBroadcastData is not defined

      384 |       data.self = data; // create circular reference
      385 |       
    > 386 |       const result = validateBroadcastData(data);
          |                      ^
      387 |       
      388 |       expect(result.isValid).toBe(false); // circular reference rejected
      389 |       expect(result.errors).toContain('Data contains non-serializable content (circular references, functions)');

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:386:22)

  ● Real-time Communication Utilities › validateBroadcastData › should reject oversized data

    ReferenceError: validateBroadcastData is not defined

      396 |       };
      397 |       
    > 398 |       const result = validateBroadcastData(largeData, { maxSize: 65536 }); // 64KB limit
          |                      ^
      399 |       
      400 |       expect(result.isValid).toBe(false); // oversized data rejected
      401 |       expect(result.errors.some(error => error.includes('Data size'))).toBe(true); // size error reported

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:398:22)

  ● Real-time Communication Utilities › validateBroadcastData › should detect potentially sensitive data

    ReferenceError: validateBroadcastData is not defined

      410 |       };
      411 |       
    > 412 |       const result = validateBroadcastData(sensitiveData);
          |                      ^
      413 |       
      414 |       expect(result.isValid).toBe(false); // sensitive data rejected
      415 |       expect(result.errors).toContain('Data may contain sensitive information');

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:412:22)

  ● Real-time Communication Utilities › validateBroadcastData › should reject functions by default

    ReferenceError: validateBroadcastData is not defined

      423 |       };
      424 |       
    > 425 |       const result = validateBroadcastData(dataWithFunction);
          |                      ^
      426 |       
      427 |       expect(result.isValid).toBe(false); // functions rejected by default
      428 |       expect(result.errors.some(error => error.includes('Function found'))).toBe(true);

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:425:22)

  ● Real-time Communication Utilities › validateBroadcastData › should allow functions when explicitly enabled

    ReferenceError: validateBroadcastData is not defined

      436 |       };
      437 |       
    > 438 |       const result = validateBroadcastData(dataWithFunction, { allowFunctions: true });
          |                      ^
      439 |       
      440 |       // Should still be invalid due to serialization issue, but no function-specific error
      441 |       expect(result.isValid).toBe(false);

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:438:22)

  ● Real-time Communication Utilities › validateBroadcastData › should handle nested objects

    ReferenceError: validateBroadcastData is not defined

      460 |       };
      461 |       
    > 462 |       const result = validateBroadcastData(nestedData);
          |                      ^
      463 |       
      464 |       expect(result.isValid).toBe(true); // nested objects allowed
      465 |       expect(result.errors).toEqual([]); // no errors

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:462:22)

  ● Real-time Communication Utilities › validateBroadcastData › should handle arrays

    ReferenceError: validateBroadcastData is not defined

      473 |       };
      474 |       
    > 475 |       const result = validateBroadcastData(arrayData);
          |                      ^
      476 |       
      477 |       expect(result.isValid).toBe(true); // arrays allowed
      478 |       expect(result.errors).toEqual([]); // no errors

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:475:22)

  ● Real-time Communication Utilities › validateBroadcastData › should handle custom size limits

    ReferenceError: validateBroadcastData is not defined

      483 |       const data = { content: 'x'.repeat(1000) }; // 1KB content
      484 |       
    > 485 |       const smallLimitResult = validateBroadcastData(data, { maxSize: 500 });
          |                                ^
      486 |       const largeLimitResult = validateBroadcastData(data, { maxSize: 2000 });
      487 |       
      488 |       expect(smallLimitResult.isValid).toBe(false); // exceeds small limit

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:485:32)

  ● Real-time Communication Utilities › validateBroadcastData › should handle validation errors gracefully

    ReferenceError: validateBroadcastData is not defined

      498 |       });
      499 |       
    > 500 |       const result = validateBroadcastData({ test: 'data' });
          |                      ^
      501 |       
      502 |       // Restore original function
      503 |       JSON.stringify = originalStringify;

      at Object.validateBroadcastData (lib/system/realtime/realtime.test.js:500:22)

  ● Real-time Communication Utilities › Integration Scenarios › should support complete broadcast workflow

    ReferenceError: createPaymentBroadcastRegistry is not defined

      512 |     // verifies should support complete broadcast workflow
      513 |     test('should support complete broadcast workflow', () => {
    > 514 |       const registry = createPaymentBroadcastRegistry();
          |                        ^
      515 |       const broadcastHistory = [];
      516 |       
      517 |       // Setup mock broadcast functions

      at Object.createPaymentBroadcastRegistry (lib/system/realtime/realtime.test.js:514:24)

  ● Real-time Communication Utilities › Integration Scenarios › should handle service initialization timing

    ReferenceError: createPaymentBroadcastRegistry is not defined

      556 |     // verifies should handle service initialization timing
      557 |     test('should handle service initialization timing', () => {
    > 558 |       const registry = createPaymentBroadcastRegistry();
          |                        ^
      559 |       
      560 |       // Service tries to broadcast before socket server initialization
      561 |       expect(registry.broadcastOutcome).toBeNull(); // not yet available

      at Object.createPaymentBroadcastRegistry (lib/system/realtime/realtime.test.js:558:24)

  ● Real-time Communication Utilities › Integration Scenarios › should support testing with mock functions

    TypeError: registry.clearAllFunctions is not a function

      597 |       
      598 |       // Clear for cleanup
    > 599 |       registry.clearAllFunctions();
          |                ^
      600 |       expect(registry.testBroadcast).toBeNull(); // cleaned up
      601 |     });
      602 |   });

      at Object.clearAllFunctions (lib/system/realtime/realtime.test.js:599:16)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/system/realtime/realtime.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/system/realtime/realtime.test.js.

      at Object.get [as File] (node_modules/winston/lib/winston/transports/index.js:30:12)
      at node_modules/qerrors/lib/logger.js:164:57
      at buildLogger (node_modules/qerrors/lib/logger.js:171:11)
/home/runner/workspace/node_modules/qerrors/lib/logger.js:164
                                arr.push(new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', ...rotationOpts, maxFiles: fileCap, format: fileFormat })); //(size-based rotation for error files with count limit)
                                         ^

TypeError: transports.File is not a constructor
    at /home/runner/workspace/node_modules/qerrors/lib/logger.js:164:42
    at buildLogger (/home/runner/workspace/node_modules/qerrors/lib/logger.js:171:11)

Node.js v20.19.3

```

### Duration: 27157ms

---

## Failed Test 5: lib/system/shutdown/shutdown-utils.test.js

### Output:
```
FAIL lib/system/shutdown/shutdown-utils.test.js
  ● Test suite failed to run

    Cannot find module './shutdown-utils' from 'lib/system/shutdown/shutdown-utils.test.js'

    However, Jest was able to find:
    	'./shutdown-utils.test.js'

    You might want to include a file extension in your import, or update your 'moduleFileExtensions', which is currently ['js', 'json'].

    See https://jestjs.io/docs/configuration#modulefileextensions-arraystring

       6 |  */
       7 |
    >  8 | const { createShutdownManager, gracefulShutdown } = require('./shutdown-utils');
         |                                                     ^
       9 |
      10 | // Mock process.exit to prevent actual process termination during tests
      11 | const originalExit = process.exit;

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/system/shutdown/shutdown-utils.test.js:8:53)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        9.597 s
Ran all test suites matching /lib\/system\/shutdown\/shutdown-utils.test.js/i.

```

### Duration: 48654ms

---

## Failed Test 6: lib/system/worker-pool/worker-pool.test.js

### Output:
```
FAIL lib/system/worker-pool/worker-pool.test.js
  ● Test suite failed to run

    Cannot find module './worker-pool' from 'lib/system/worker-pool/worker-pool.test.js'

    However, Jest was able to find:
    	'./worker-pool.test.js'

    You might want to include a file extension in your import, or update your 'moduleFileExtensions', which is currently ['js', 'json'].

    See https://jestjs.io/docs/configuration#modulefileextensions-arraystring

       6 |  */
       7 |
    >  8 | const { createWorkerPool } = require('./worker-pool');
         |                              ^
       9 | const path = require('path');
      10 |
      11 | // Mock worker threads module for testing

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/system/worker-pool/worker-pool.test.js:8:30)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        9.595 s
Ran all test suites matching /lib\/system\/worker-pool\/worker-pool.test.js/i.

```

### Duration: 54365ms

---

## Failed Test 7: lib/utilities/datetime/datetime-enhanced.test.js

### Output:
```
FAIL lib/utilities/datetime/datetime-enhanced.test.js
  ● Test suite failed to run

    Cannot find module '../datetime' from 'lib/utilities/datetime/datetime-enhanced.test.js'

       7 |  */
       8 |
    >  9 | const datetimeUtils = require('../datetime');
         |                       ^
      10 |
      11 | describe('Enhanced DateTime Utilities', () => {
      12 |   describe('formatDate', () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/utilities/datetime/datetime-enhanced.test.js:9:23)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        13.774 s
Ran all test suites matching /lib\/utilities\/datetime\/datetime-enhanced.test.js/i.

```

### Duration: 46719ms

---

## Failed Test 8: lib/utilities/datetime/datetime.test.js

### Output:
```
FAIL lib/utilities/datetime/datetime.test.js
  ● Test suite failed to run

    Cannot find module '../datetime' from 'lib/utilities/datetime/datetime.test.js'

      2 | // Unit tests verifying date/time formatting helpers and date arithmetic functions
      3 | // handle diverse inputs and edge cases without throwing unexpected errors.
    > 4 | const { formatDateTime, formatDuration, addDays } = require('../datetime');
        |                                                     ^
      5 |
      6 | describe('DateTime Utilities', () => { // ensures date helpers handle real-world formats
      7 |   describe('formatDateTime', () => { // validates fallback when dates are invalid

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/utilities/datetime/datetime.test.js:4:53)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        14.837 s
Ran all test suites matching /lib\/utilities\/datetime\/datetime.test.js/i.

```

### Duration: 46912ms

---

## Failed Test 9: lib/utilities/file/file-utils.test.js

### Output:
```
FAIL lib/utilities/file/file-utils.test.js
  ● Test suite failed to run

    Cannot find module '../utilities/file/formatFileSize' from 'lib/utilities/file/file-utils.test.js'

       6 |  */
       7 |
    >  8 | const formatFileSize = require('../utilities/file/formatFileSize');
         |                        ^
       9 |
      10 | describe('File Utils', () => {
      11 |   describe('formatFileSize', () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/utilities/file/file-utils.test.js:8:24)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        11.874 s
Ran all test suites matching /lib\/utilities\/file\/file-utils.test.js/i.

```

### Duration: 23576ms

---

## Failed Test 10: lib/utilities/id-generation/id-generation.test.js

### Output:
```
FAIL lib/utilities/id-generation/id-generation.test.js
  ● Test suite failed to run

    Cannot find module '../id-generation' from 'lib/utilities/id-generation/id-generation.test.js'

      2 | // ID format, uniqueness guarantees, input validation, and error handling
      3 | // for execution tracking and data integrity across applications.
    > 4 | const { generateExecutionId, generateTaskId, generateSecureId, generateSimpleId } = require('../id-generation');
        |                                                                                     ^
      5 |
      6 | describe('Secure ID Generation Utilities', () => { // validates ID generation functionality
      7 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/utilities/id-generation/id-generation.test.js:4:85)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        11.508 s
Ran all test suites matching /lib\/utilities\/id-generation\/id-generation.test.js/i.

```

### Duration: 20212ms

---

## Failed Test 11: lib/utilities/string/string-utils.test.js

### Output:
```
FAIL lib/utilities/string/string-utils.test.js
  ● Test suite failed to run

    Cannot find module '../../index.js' from 'lib/utilities/string/string-utils.test.js'

      3 |  */
      4 |
    > 5 | const { sanitizeString } = require('../../index.js');
        |                            ^
      6 |
      7 | describe('String Utilities', () => {
      8 |   describe('sanitizeString', () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/utilities/string/string-utils.test.js:5:28)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        12.78 s
Ran all test suites matching /lib\/utilities\/string\/string-utils.test.js/i.

```

### Duration: 20543ms

---

## Failed Test 12: lib/utilities/url/url.test.js

### Output:
```
FAIL lib/utilities/url/url.test.js
  ● Test suite failed to run

    Cannot find module '../url' from 'lib/utilities/url/url.test.js'

      3 | // normalization, protocol stripping, and structured parsing. Each case asserts
      4 | // reliable output for both valid and malformed input.
    > 5 | const { ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts } = require('../url');
        |                                                                              ^
      6 |
      7 | describe('URL Utilities', () => { // ensures robust URL transformations
      8 |   describe('ensureProtocol', () => { // adds protocols when missing

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (lib/utilities/url/url.test.js:5:78)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        13.09 s
Ran all test suites matching /lib\/utilities\/url\/url.test.js/i.

```

### Duration: 48146ms

---

## Failed Test 13: lib/validation/advanced-validation.test.js

### Output:
```
FAIL lib/validation/advanced-validation.test.js (17.38 s)
  Advanced Validation Utilities
    validateEmail
      ✓ should validate correct email formats (1061 ms)
      ✓ should reject invalid email formats (74 ms)
      ✓ should handle empty or invalid input types (229 ms)
      ✓ should sanitize input before validation (9 ms)
    validateRequired
      ✓ should validate non-empty required fields (51 ms)
      ✓ should reject empty or whitespace-only fields (37 ms)
      ✓ should validate minimum length requirements (41 ms)
      ✓ should handle invalid input types (5 ms)
      ✕ should use singular/plural correctly in error messages (123 ms)
    validateMaxLength
      ✕ should validate fields within length limits
      ✕ should reject fields exceeding length limits
      ✕ should handle null/undefined gracefully (1 ms)
      ✕ should sanitize input before length check
    validateSelection
      ✕ should validate non-empty selections (1 ms)
      ✕ should reject empty or whitespace selections (2 ms)
      ✕ should handle invalid input types (2 ms)
      ✕ should use lowercase field names in error messages (1 ms)
    combineValidations
      ✕ should return empty string when all validators pass
      ✕ should return first error encountered
      ✕ should handle validators that throw exceptions
      ✕ should validate that all arguments are functions
      ✕ should handle empty validator list
      ✕ should work with real validation functions (1 ms)
    validateObjectId
      ✕ should validate correct MongoDB ObjectId formats
      ✕ should sanitize input before validation (4 ms)
      ✕ should throw error for invalid input types (115 ms)
      ✕ should throw error for empty input (3 ms)
      ✕ should throw error for invalid ObjectId formats (2 ms)
      ✕ should use custom field names in error messages (158 ms)

  ● Advanced Validation Utilities › validateRequired › should use singular/plural correctly in error messages

    expect(received).toBe(expected) // Object.is equality

    Expected: "Field must be at least 1 character long"
    Received: "Field is required"

      67 |
      68 |     test('should use singular/plural correctly in error messages', () => {
    > 69 |       expect(validateRequired('', 'Field', 1)).toBe('Field must be at least 1 character long');
         |                                                ^
      70 |       expect(validateRequired('a', 'Field', 5)).toBe('Field must be at least 5 characters long');
      71 |     });
      72 |   });

      at Object.toBe (lib/validation/advanced-validation.test.js:69:48)

  ● Advanced Validation Utilities › validateMaxLength › should validate fields within length limits

    ReferenceError: advancedValidation is not defined

      74 |   describe('validateMaxLength', () => {
      75 |     test('should validate fields within length limits', () => {
    > 76 |       expect(advancedValidation.validateMaxLength('Short', 'Title', 100)).toBe('');
         |              ^
      77 |       expect(advancedValidation.validateMaxLength('Exactly ten!', 'Field', 12)).toBe('');
      78 |       expect(advancedValidation.validateMaxLength('', 'Description', 500)).toBe('');
      79 |     });

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:76:14)

  ● Advanced Validation Utilities › validateMaxLength › should reject fields exceeding length limits

    ReferenceError: advancedValidation is not defined

      80 |
      81 |     test('should reject fields exceeding length limits', () => {
    > 82 |       expect(advancedValidation.validateMaxLength('Very long text that exceeds limit', 'Title', 10))
         |              ^
      83 |         .toBe('Title cannot exceed 10 characters');
      84 |       expect(advancedValidation.validateMaxLength('x'.repeat(101), 'Description', 100))
      85 |         .toBe('Description cannot exceed 100 characters');

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:82:14)

  ● Advanced Validation Utilities › validateMaxLength › should handle null/undefined gracefully

    ReferenceError: advancedValidation is not defined

      87 |
      88 |     test('should handle null/undefined gracefully', () => {
    > 89 |       expect(advancedValidation.validateMaxLength(null, 'Field', 50)).toBe('');
         |              ^
      90 |       expect(advancedValidation.validateMaxLength(undefined, 'Field', 50)).toBe('');
      91 |       expect(advancedValidation.validateMaxLength(123, 'Field', 50)).toBe('');
      92 |     });

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:89:14)

  ● Advanced Validation Utilities › validateMaxLength › should sanitize input before length check

    ReferenceError: advancedValidation is not defined

      93 |
      94 |     test('should sanitize input before length check', () => {
    > 95 |       expect(advancedValidation.validateMaxLength('  text  ', 'Field', 10)).toBe('');
         |              ^
      96 |       expect(advancedValidation.validateMaxLength('text\x00\x01', 'Field', 10)).toBe('');
      97 |     });
      98 |   });

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:95:14)

  ● Advanced Validation Utilities › validateSelection › should validate non-empty selections

    ReferenceError: advancedValidation is not defined

      100 |   describe('validateSelection', () => {
      101 |     test('should validate non-empty selections', () => {
    > 102 |       expect(advancedValidation.validateSelection('option1', 'Category')).toBe('');
          |              ^
      103 |       expect(advancedValidation.validateSelection('value', 'Status')).toBe('');
      104 |       expect(advancedValidation.validateSelection('none', 'Type')).toBe('');
      105 |     });

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:102:14)

  ● Advanced Validation Utilities › validateSelection › should reject empty or whitespace selections

    ReferenceError: advancedValidation is not defined

      106 |
      107 |     test('should reject empty or whitespace selections', () => {
    > 108 |       expect(advancedValidation.validateSelection('', 'Priority')).toBe('Please select a priority');
          |              ^
      109 |       expect(advancedValidation.validateSelection('   ', 'Status')).toBe('Please select a status');
      110 |       expect(advancedValidation.validateSelection('\t', 'Category')).toBe('Please select a category');
      111 |     });

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:108:14)

  ● Advanced Validation Utilities › validateSelection › should handle invalid input types

    ReferenceError: advancedValidation is not defined

      112 |
      113 |     test('should handle invalid input types', () => {
    > 114 |       expect(advancedValidation.validateSelection(null, 'Field')).toBe('Please select a field');
          |              ^
      115 |       expect(advancedValidation.validateSelection(undefined, 'Option')).toBe('Please select a option');
      116 |       expect(advancedValidation.validateSelection(123, 'Type')).toBe('Please select a type');
      117 |     });

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:114:14)

  ● Advanced Validation Utilities › validateSelection › should use lowercase field names in error messages

    ReferenceError: advancedValidation is not defined

      118 |
      119 |     test('should use lowercase field names in error messages', () => {
    > 120 |       expect(advancedValidation.validateSelection('', 'PRIORITY')).toBe('Please select a priority');
          |              ^
      121 |       expect(advancedValidation.validateSelection('', 'Category Type')).toBe('Please select a category type');
      122 |     });
      123 |   });

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:120:14)

  ● Advanced Validation Utilities › combineValidations › should return empty string when all validators pass

    ReferenceError: advancedValidation is not defined

      125 |   describe('combineValidations', () => {
      126 |     test('should return empty string when all validators pass', () => {
    > 127 |       const result = advancedValidation.combineValidations(
          |                      ^
      128 |         () => '',
      129 |         () => '',
      130 |         () => ''

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:127:22)

  ● Advanced Validation Utilities › combineValidations › should return first error encountered

    ReferenceError: advancedValidation is not defined

      134 |
      135 |     test('should return first error encountered', () => {
    > 136 |       const result = advancedValidation.combineValidations(
          |                      ^
      137 |         () => '',
      138 |         () => 'First error',
      139 |         () => 'Second error'

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:136:22)

  ● Advanced Validation Utilities › combineValidations › should handle validators that throw exceptions

    ReferenceError: advancedValidation is not defined

      143 |
      144 |     test('should handle validators that throw exceptions', () => {
    > 145 |       const result = advancedValidation.combineValidations(
          |                      ^
      146 |         () => '',
      147 |         () => { throw new Error('Validator failed'); },
      148 |         () => 'Should not reach here'

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:145:22)

  ● Advanced Validation Utilities › combineValidations › should validate that all arguments are functions

    ReferenceError: advancedValidation is not defined

      152 |
      153 |     test('should validate that all arguments are functions', () => {
    > 154 |       const result = advancedValidation.combineValidations(
          |                      ^
      155 |         () => '',
      156 |         'not a function',
      157 |         () => ''

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:154:22)

  ● Advanced Validation Utilities › combineValidations › should handle empty validator list

    ReferenceError: advancedValidation is not defined

      161 |
      162 |     test('should handle empty validator list', () => {
    > 163 |       const result = advancedValidation.combineValidations();
          |                      ^
      164 |       expect(result).toBe('');
      165 |     });
      166 |

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:163:22)

  ● Advanced Validation Utilities › combineValidations › should work with real validation functions

    ReferenceError: advancedValidation is not defined

      169 |       const email = 'invalid-email';
      170 |       
    > 171 |       const result = advancedValidation.combineValidations(
          |                      ^
      172 |         () => validateRequired(username, 'Username', 3),
      173 |         () => validateEmail(email)
      174 |       );

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:171:22)

  ● Advanced Validation Utilities › validateObjectId › should validate correct MongoDB ObjectId formats

    ReferenceError: advancedValidation is not defined

      180 |   describe('validateObjectId', () => {
      181 |     test('should validate correct MongoDB ObjectId formats', () => {
    > 182 |       expect(advancedValidation.validateObjectId('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011');
          |              ^
      183 |       expect(advancedValidation.validateObjectId('123456789012345678901234')).toBe('123456789012345678901234');
      184 |       expect(advancedValidation.validateObjectId('abcdef123456789012345678')).toBe('abcdef123456789012345678');
      185 |       expect(advancedValidation.validateObjectId('ABCDEF123456789012345678')).toBe('ABCDEF123456789012345678');

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:182:14)

  ● Advanced Validation Utilities › validateObjectId › should sanitize input before validation

    ReferenceError: advancedValidation is not defined

      187 |
      188 |     test('should sanitize input before validation', () => {
    > 189 |       expect(advancedValidation.validateObjectId('  507f1f77bcf86cd799439011  ')).toBe('507f1f77bcf86cd799439011');
          |              ^
      190 |       expect(advancedValidation.validateObjectId('507f1f77bcf86cd799439011\x00')).toBe('507f1f77bcf86cd799439011');
      191 |     });
      192 |

      at Object.advancedValidation (lib/validation/advanced-validation.test.js:189:14)

  ● Advanced Validation Utilities › validateObjectId › should throw error for invalid input types

    expect(received).toThrow(expected)

    Expected substring: "id is required and must be a string."
    Received message:   "advancedValidation is not defined"

          192 |
          193 |     test('should throw error for invalid input types', () => {
        > 194 |       expect(() => advancedValidation.validateObjectId(null))
              |                                       ^
          195 |         .toThrow('id is required and must be a string.');
          196 |       expect(() => advancedValidation.validateObjectId(undefined))
          197 |         .toThrow('id is required and must be a string.');

      at validateObjectId (lib/validation/advanced-validation.test.js:194:39)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/validation/advanced-validation.test.js:195:10)
      at Object.toThrow (lib/validation/advanced-validation.test.js:195:10)

  ● Advanced Validation Utilities › validateObjectId › should throw error for empty input

    expect(received).toThrow(expected)

    Expected substring: "id cannot be empty after sanitization."
    Received message:   "advancedValidation is not defined"

          201 |
          202 |     test('should throw error for empty input', () => {
        > 203 |       expect(() => advancedValidation.validateObjectId(''))
              |                                       ^
          204 |         .toThrow('id cannot be empty after sanitization.');
          205 |       expect(() => advancedValidation.validateObjectId('   '))
          206 |         .toThrow('id cannot be empty after sanitization.');

      at validateObjectId (lib/validation/advanced-validation.test.js:203:39)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/validation/advanced-validation.test.js:204:10)
      at Object.toThrow (lib/validation/advanced-validation.test.js:204:10)

  ● Advanced Validation Utilities › validateObjectId › should throw error for invalid ObjectId formats

    expect(received).toThrow(expected)

    Expected substring: "Invalid id format. Must be a valid MongoDB ObjectId."
    Received message:   "advancedValidation is not defined"

          208 |
          209 |     test('should throw error for invalid ObjectId formats', () => {
        > 210 |       expect(() => advancedValidation.validateObjectId('invalid'))
              |                                       ^
          211 |         .toThrow('Invalid id format. Must be a valid MongoDB ObjectId.');
          212 |       expect(() => advancedValidation.validateObjectId('507f1f77bcf86cd79943901')) // 23 chars
          213 |         .toThrow('Invalid id format. Must be a valid MongoDB ObjectId.');

      at validateObjectId (lib/validation/advanced-validation.test.js:210:39)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/validation/advanced-validation.test.js:211:10)
      at Object.toThrow (lib/validation/advanced-validation.test.js:211:10)

  ● Advanced Validation Utilities › validateObjectId › should use custom field names in error messages

    expect(received).toThrow(expected)

    Expected substring: "Invalid userId format. Must be a valid MongoDB ObjectId."
    Received message:   "advancedValidation is not defined"

          219 |
          220 |     test('should use custom field names in error messages', () => {
        > 221 |       expect(() => advancedValidation.validateObjectId('invalid', 'userId'))
              |                                       ^
          222 |         .toThrow('Invalid userId format. Must be a valid MongoDB ObjectId.');
          223 |       expect(() => advancedValidation.validateObjectId('', 'postId'))
          224 |         .toThrow('postId cannot be empty after sanitization.');

      at validateObjectId (lib/validation/advanced-validation.test.js:221:39)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/validation/advanced-validation.test.js:222:10)
      at Object.toThrow (lib/validation/advanced-validation.test.js:222:10)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/validation/advanced-validation.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/validation/advanced-validation.test.js.

      at Object.get [as File] (node_modules/winston/lib/winston/transports/index.js:30:12)
      at node_modules/qerrors/lib/logger.js:164:57
      at buildLogger (node_modules/qerrors/lib/logger.js:171:11)
/home/runner/workspace/node_modules/qerrors/lib/logger.js:164
                                arr.push(new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', ...rotationOpts, maxFiles: fileCap, format: fileFormat })); //(size-based rotation for error files with count limit)
                                         ^

TypeError: transports.File is not a constructor
    at /home/runner/workspace/node_modules/qerrors/lib/logger.js:164:42
    at buildLogger (/home/runner/workspace/node_modules/qerrors/lib/logger.js:171:11)

Node.js v20.19.3

```

### Duration: 50309ms

---

## Failed Test 14: lib/validation/github-validation.test.js

### Output:
```
FAIL lib/validation/github-validation.test.js (13.68 s)
  GitHub Validation Utilities
    validateGitHubUrl
      ✓ should validate correct GitHub repository URLs (1066 ms)
      ✓ should reject empty or invalid URLs (253 ms)
      ✓ should reject non-GitHub URLs (379 ms)
      ✓ should reject HTTP URLs (require HTTPS) (77 ms)
      ✓ should reject URLs with additional paths (9 ms)
      ✓ should handle malformed input safely (119 ms)
    extractGitHubInfo
      ✕ should extract owner and repository from valid URLs (1 ms)
      ✕ should handle URLs with special characters in names
      ✕ should return null for invalid URLs
      ✕ should return null for URLs with insufficient path parts
    validateGitHubRepo
      ✕ should validate correct repository formats (1 ms)
      ✕ should apply string sanitization
      ✕ should throw error for invalid input types (515 ms)
      ✕ should throw error for empty or invalid formats (23 ms)
    validateGitHubUrlDetailed
      ✕ should return valid result for correct URLs (1 ms)
      ✕ should categorize empty URL errors
      ✕ should categorize format errors
      ✕ should categorize protocol errors (1 ms)
      ✕ should categorize domain errors
      ✕ should categorize path errors
      ✕ should categorize invalid name errors
      ✕ should include original URL in all results

  ● GitHub Validation Utilities › extractGitHubInfo › should extract owner and repository from valid URLs

    ReferenceError: githubValidation is not defined

      52 |   describe('extractGitHubInfo', () => {
      53 |     test('should extract owner and repository from valid URLs', () => {
    > 54 |       expect(githubValidation.extractGitHubInfo('https://github.com/microsoft/vscode'))
         |              ^
      55 |         .toEqual({ owner: 'microsoft', repo: 'vscode' });
      56 |       expect(githubValidation.extractGitHubInfo('https://github.com/user/my-project/'))
      57 |         .toEqual({ owner: 'user', repo: 'my-project' });

      at Object.githubValidation (lib/validation/github-validation.test.js:54:14)

  ● GitHub Validation Utilities › extractGitHubInfo › should handle URLs with special characters in names

    ReferenceError: githubValidation is not defined

      59 |
      60 |     test('should handle URLs with special characters in names', () => {
    > 61 |       expect(githubValidation.extractGitHubInfo('https://github.com/my-org/my.project'))
         |              ^
      62 |         .toEqual({ owner: 'my-org', repo: 'my.project' });
      63 |       expect(githubValidation.extractGitHubInfo('https://github.com/user_name/repo-name'))
      64 |         .toEqual({ owner: 'user_name', repo: 'repo-name' });

      at Object.githubValidation (lib/validation/github-validation.test.js:61:14)

  ● GitHub Validation Utilities › extractGitHubInfo › should return null for invalid URLs

    ReferenceError: githubValidation is not defined

      66 |
      67 |     test('should return null for invalid URLs', () => {
    > 68 |       expect(githubValidation.extractGitHubInfo('invalid-url')).toBeNull();
         |              ^
      69 |       expect(githubValidation.extractGitHubInfo('https://github.com/user')).toBeNull();
      70 |       expect(githubValidation.extractGitHubInfo('https://github.com/')).toBeNull();
      71 |     });

      at Object.githubValidation (lib/validation/github-validation.test.js:68:14)

  ● GitHub Validation Utilities › extractGitHubInfo › should return null for URLs with insufficient path parts

    ReferenceError: githubValidation is not defined

      72 |
      73 |     test('should return null for URLs with insufficient path parts', () => {
    > 74 |       expect(githubValidation.extractGitHubInfo('https://github.com/user/repo/issues')).toEqual({ owner: 'user', repo: 'repo' });
         |              ^
      75 |       expect(githubValidation.extractGitHubInfo('https://github.com/user')).toBeNull();
      76 |     });
      77 |   });

      at Object.githubValidation (lib/validation/github-validation.test.js:74:14)

  ● GitHub Validation Utilities › validateGitHubRepo › should validate correct repository formats

    ReferenceError: githubValidation is not defined

      79 |   describe('validateGitHubRepo', () => {
      80 |     test('should validate correct repository formats', () => {
    > 81 |       expect(githubValidation.validateGitHubRepo('microsoft/vscode')).toBe('microsoft/vscode');
         |              ^
      82 |       expect(githubValidation.validateGitHubRepo('user/my-project')).toBe('user/my-project');
      83 |       expect(githubValidation.validateGitHubRepo('my-org/my.project.js')).toBe('my-org/my.project.js');
      84 |     });

      at Object.githubValidation (lib/validation/github-validation.test.js:81:14)

  ● GitHub Validation Utilities › validateGitHubRepo › should apply string sanitization

    ReferenceError: githubValidation is not defined

      85 |
      86 |     test('should apply string sanitization', () => {
    > 87 |       expect(githubValidation.validateGitHubRepo(' user/repo \t')).toBe('user/repo');
         |              ^
      88 |       expect(githubValidation.validateGitHubRepo('user/repo\x00')).toBe('user/repo');
      89 |     });
      90 |

      at Object.githubValidation (lib/validation/github-validation.test.js:87:14)

  ● GitHub Validation Utilities › validateGitHubRepo › should throw error for invalid input types

    expect(received).toThrow(expected)

    Expected substring: "Repository name is required and must be a string."
    Received message:   "githubValidation is not defined"

          90 |
          91 |     test('should throw error for invalid input types', () => {
        > 92 |       expect(() => githubValidation.validateGitHubRepo(null))
             |                                     ^
          93 |         .toThrow('Repository name is required and must be a string.');
          94 |       expect(() => githubValidation.validateGitHubRepo(undefined))
          95 |         .toThrow('Repository name is required and must be a string.');

      at validateGitHubRepo (lib/validation/github-validation.test.js:92:37)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/validation/github-validation.test.js:93:10)
      at Object.toThrow (lib/validation/github-validation.test.js:93:10)

  ● GitHub Validation Utilities › validateGitHubRepo › should throw error for empty or invalid formats

    expect(received).toThrow(expected)

    Expected substring: "Repository name cannot be empty after sanitization."
    Received message:   "githubValidation is not defined"

           99 |
          100 |     test('should throw error for empty or invalid formats', () => {
        > 101 |       expect(() => githubValidation.validateGitHubRepo(''))
              |                                     ^
          102 |         .toThrow('Repository name cannot be empty after sanitization.');
          103 |       expect(() => githubValidation.validateGitHubRepo('   '))
          104 |         .toThrow('Repository name cannot be empty after sanitization.');

      at validateGitHubRepo (lib/validation/github-validation.test.js:101:37)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/validation/github-validation.test.js:102:10)
      at Object.toThrow (lib/validation/github-validation.test.js:102:10)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should return valid result for correct URLs

    ReferenceError: validateGitHubUrlDetailed is not defined

      112 |   describe('validateGitHubUrlDetailed', () => {
      113 |     test('should return valid result for correct URLs', () => {
    > 114 |       const result = validateGitHubUrlDetailed('https://github.com/user/repo');
          |                      ^
      115 |       expect(result).toMatchObject({
      116 |         isValid: true,
      117 |         category: 'valid',

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:114:22)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should categorize empty URL errors

    ReferenceError: validateGitHubUrlDetailed is not defined

      123 |
      124 |     test('should categorize empty URL errors', () => {
    > 125 |       const result = validateGitHubUrlDetailed('');
          |                      ^
      126 |       expect(result).toMatchObject({
      127 |         isValid: false,
      128 |         category: 'empty',

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:125:22)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should categorize format errors

    ReferenceError: validateGitHubUrlDetailed is not defined

      132 |
      133 |     test('should categorize format errors', () => {
    > 134 |       const result = validateGitHubUrlDetailed('not-a-url');
          |                      ^
      135 |       expect(result).toMatchObject({
      136 |         isValid: false,
      137 |         category: 'format',

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:134:22)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should categorize protocol errors

    ReferenceError: validateGitHubUrlDetailed is not defined

      141 |
      142 |     test('should categorize protocol errors', () => {
    > 143 |       const result = validateGitHubUrlDetailed('http://github.com/user/repo');
          |                      ^
      144 |       expect(result).toMatchObject({
      145 |         isValid: false,
      146 |         category: 'protocol',

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:143:22)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should categorize domain errors

    ReferenceError: validateGitHubUrlDetailed is not defined

      150 |
      151 |     test('should categorize domain errors', () => {
    > 152 |       const result = validateGitHubUrlDetailed('https://gitlab.com/user/repo');
          |                      ^
      153 |       expect(result).toMatchObject({
      154 |         isValid: false,
      155 |         category: 'domain',

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:152:22)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should categorize path errors

    ReferenceError: validateGitHubUrlDetailed is not defined

      159 |
      160 |     test('should categorize path errors', () => {
    > 161 |       const result1 = validateGitHubUrlDetailed('https://github.com/user');
          |                       ^
      162 |       expect(result1).toMatchObject({
      163 |         isValid: false,
      164 |         category: 'path',

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:161:23)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should categorize invalid name errors

    ReferenceError: validateGitHubUrlDetailed is not defined

      175 |
      176 |     test('should categorize invalid name errors', () => {
    > 177 |       const result = validateGitHubUrlDetailed('https://github.com/user$/repo@');
          |                      ^
      178 |       expect(result).toMatchObject({
      179 |         isValid: false,
      180 |         category: 'path',

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:177:22)

  ● GitHub Validation Utilities › validateGitHubUrlDetailed › should include original URL in all results

    ReferenceError: validateGitHubUrlDetailed is not defined

      185 |     test('should include original URL in all results', () => {
      186 |       const originalUrl = 'https://github.com/user/repo';
    > 187 |       const result = validateGitHubUrlDetailed(originalUrl);
          |                      ^
      188 |       expect(result.originalUrl).toBe(originalUrl);
      189 |     });
      190 |   });

      at Object.validateGitHubUrlDetailed (lib/validation/github-validation.test.js:187:22)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/validation/github-validation.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/validation/github-validation.test.js.

      at Object.get [as File] (node_modules/winston/lib/winston/transports/index.js:30:12)
      at node_modules/qerrors/lib/logger.js:164:57
      at buildLogger (node_modules/qerrors/lib/logger.js:171:11)
/home/runner/workspace/node_modules/qerrors/lib/logger.js:164
                                arr.push(new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', ...rotationOpts, maxFiles: fileCap, format: fileFormat })); //(size-based rotation for error files with count limit)
                                         ^

TypeError: transports.File is not a constructor
    at /home/runner/workspace/node_modules/qerrors/lib/logger.js:164:42
    at buildLogger (/home/runner/workspace/node_modules/qerrors/lib/logger.js:171:11)

Node.js v20.19.3

```

### Duration: 46703ms

---

## Failed Test 15: lib/validation/validation.test.js

### Output:
```
FAIL lib/validation/validation.test.js (8.234 s)
  Validation Utilities
    requireFields
      ✓ should return true when all required fields are present (9 ms)
      ✕ should return false and send error for missing fields (19 ms)
      ✕ should return false for multiple missing fields (5 ms)
      ✕ should treat falsy values as missing (16 ms)
      ✓ should handle empty object (2 ms)
      ✓ should handle empty required fields array (2 ms)
      ✕ should handle undefined object gracefully (2 ms)
      ✕ should handle null object gracefully (1 ms)
      ✓ should accept truthy values (3 ms)
      ✕ should handle invalid requiredFields parameter (3 ms)
      ✕ should handle non-array requiredFields parameter (2 ms)
      ✕ should handle invalid obj parameter (2 ms)

  ● Validation Utilities › requireFields › should return false and send error for missing fields

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

      Object {
    -   "error": "Missing required fields",
    -   "missing": Array [
    +   "error": "Validation failed",
    +   "message": "Missing required fields: email",
    +   "missingFields": Array [
          "email",
        ],
      },

    Number of calls: 1

      32 |       expect(result).toBe(false); // missing email triggers failure
      33 |       expect(mockRes.status).toHaveBeenCalledWith(400); // returns bad request
    > 34 |       expect(mockRes.json).toHaveBeenCalledWith({
         |                            ^
      35 |         error: 'Missing required fields',
      36 |         missing: ['email']
      37 |       });

      at Object.toHaveBeenCalledWith (lib/validation/validation.test.js:34:28)

  ● Validation Utilities › requireFields › should return false for multiple missing fields

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

      Object {
    -   "error": "Missing required fields",
    -   "missing": Array [
    +   "error": "Validation failed",
    +   "message": "Missing required fields: email, age",
    +   "missingFields": Array [
          "email",
          "age",
        ],
      },

    Number of calls: 1

      45 |       expect(result).toBe(false); // multiple fields missing
      46 |       expect(mockRes.status).toHaveBeenCalledWith(400); // status set once
    > 47 |       expect(mockRes.json).toHaveBeenCalledWith({
         |                            ^
      48 |         error: 'Missing required fields',
      49 |         missing: ['email', 'age']
      50 |       });

      at Object.toHaveBeenCalledWith (lib/validation/validation.test.js:47:28)

  ● Validation Utilities › requireFields › should treat falsy values as missing

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

      Object {
    -   "error": "Missing required fields",
    -   "missing": Array [
    +   "error": "Validation failed",
    +   "message": "Missing required fields: name, email",
    +   "missingFields": Array [
          "name",
          "email",
    -     "age",
    -     "active",
        ],
      },

    Number of calls: 1

      58 |       expect(result).toBe(false); // falsy values considered missing
      59 |       expect(mockRes.status).toHaveBeenCalledWith(400); // still 400 response
    > 60 |       expect(mockRes.json).toHaveBeenCalledWith({
         |                            ^
      61 |         error: 'Missing required fields',
      62 |         missing: ['name', 'email', 'age', 'active']
      63 |       });

      at Object.toHaveBeenCalledWith (lib/validation/validation.test.js:60:28)

  ● Validation Utilities › requireFields › should handle undefined object gracefully

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: {"json": [Function mockConstructor], "status": [Function mockConstructor]}

      86 |       const result = requireFields(undefined, ['name'], mockRes);
      87 |       
    > 88 |       expect(result).toBe(false); // invalid obj returns false
         |                      ^
      89 |       expect(mockRes.status).toHaveBeenCalledWith(500); // internal error status
      90 |       expect(mockRes.json).toHaveBeenCalledWith({
      91 |         error: 'Internal validation error'

      at Object.toBe (lib/validation/validation.test.js:88:22)

  ● Validation Utilities › requireFields › should handle null object gracefully

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: {"json": [Function mockConstructor], "status": [Function mockConstructor]}

       97 |       const result = requireFields(null, ['name'], mockRes);
       98 |       
    >  99 |       expect(result).toBe(false); // null object also invalid
          |                      ^
      100 |       expect(mockRes.status).toHaveBeenCalledWith(500); // internal error status
      101 |     });
      102 |

      at Object.toBe (lib/validation/validation.test.js:99:22)

  ● Validation Utilities › requireFields › should handle invalid requiredFields parameter

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: true

      121 |       const result = requireFields(obj, null, mockRes);
      122 |       
    > 123 |       expect(result).toBe(false); // invalid requiredFields parameter
          |                      ^
      124 |       expect(mockRes.status).toHaveBeenCalledWith(500); // internal error for invalid param
      125 |       expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal validation error' }); // send generic message
      126 |     });

      at Object.toBe (lib/validation/validation.test.js:123:22)

  ● Validation Utilities › requireFields › should handle non-array requiredFields parameter

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: true

      131 |       const result = requireFields(obj, 'name', mockRes);
      132 |       
    > 133 |       expect(result).toBe(false); // non-array requiredFields not allowed
          |                      ^
      134 |       expect(mockRes.status).toHaveBeenCalledWith(500); // internal error
      135 |       expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal validation error' }); // error message
      136 |     });

      at Object.toBe (lib/validation/validation.test.js:133:22)

  ● Validation Utilities › requireFields › should handle invalid obj parameter

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: {"json": [Function mockConstructor], "status": [Function mockConstructor]}

      140 |       const result = requireFields(null, ['name'], mockRes);
      141 |       
    > 142 |       expect(result).toBe(false); // null object again invalid
          |                      ^
      143 |       expect(mockRes.status).toHaveBeenCalledWith(500); // internal error
      144 |       expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal validation error' }); // respond with generic
      145 |     });

      at Object.toBe (lib/validation/validation.test.js:142:22)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/validation/validation.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/validation/validation.test.js.

      at Object.get [as File] (node_modules/winston/lib/winston/transports/index.js:30:12)
      at node_modules/qerrors/lib/logger.js:164:57
      at buildLogger (node_modules/qerrors/lib/logger.js:171:11)
/home/runner/workspace/node_modules/qerrors/lib/logger.js:164
                                arr.push(new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', ...rotationOpts, maxFiles: fileCap, format: fileFormat })); //(size-based rotation for error files with count limit)
                                         ^

TypeError: transports.File is not a constructor
    at /home/runner/workspace/node_modules/qerrors/lib/logger.js:164:42
    at buildLogger (/home/runner/workspace/node_modules/qerrors/lib/logger.js:171:11)

Node.js v20.19.3

```

### Duration: 15031ms

---

## Failed Test 16: tests/integration/error-handling.test.js

### Output:
```
FAIL tests/integration/error-handling.test.js (7.64 s)
  Error Handling Integration Tests
    Cascading Error Scenarios
      ✕ should handle multiple module failures gracefully (9 ms)
      ✕ should handle error propagation in API workflow (18 ms)
    View Rendering Error Recovery
      ✕ should handle template rendering failures across multiple views
      ✕ should handle route registration with missing global app (146 ms)
    Authentication Error Scenarios
      ✓ should handle passport strategy detection with broken global state (30 ms)
      ✓ should handle authentication with various request object states (73 ms)
    URL Processing Error Recovery
      ✓ should handle malformed URLs throughout processing pipeline (16 ms)
      ✓ should handle URL processing with partial failures (224 ms)
    Data Validation Error Recovery
      ✕ should handle validation with various malformed objects (7 ms)

  ● Error Handling Integration Tests › Cascading Error Scenarios › should handle multiple module failures gracefully

    expect(received).toBeNull()

    Received: "https://"

      18 |       // Test invalid URL processing
      19 |       const invalidUrl = null;
    > 20 |       expect(utils.ensureProtocol(invalidUrl)).toBeNull(); // invalid URL returns null
         |                                                ^
      21 |       expect(utils.normalizeUrlOrigin(invalidUrl)).toBeNull(); // normalization also null
      22 |       expect(utils.parseUrlParts(invalidUrl)).toBeNull(); // parsing fails gracefully
      23 |       

      at Object.toBeNull (tests/integration/error-handling.test.js:20:48)

  ● Error Handling Integration Tests › Cascading Error Scenarios › should handle error propagation in API workflow

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: {"json": [Function mockConstructor], "status": [Function mockConstructor]}

      56 |       // Header processing would have failed but that module was removed
      57 |       
    > 58 |       expect(utils.requireFields(malformedReq.body, ['field'], mockRes)).toBe(false); // validation fails on body
         |                                                                          ^
      59 |     });
      60 |   });
      61 |

      at Object.toBe (tests/integration/error-handling.test.js:58:74)

  ● Error Handling Integration Tests › View Rendering Error Recovery › should handle template rendering failures across multiple views

    TypeError: utils.renderView is not a function

      74 |       
      75 |       views.forEach(view => {
    > 76 |         utils.renderView(mockRes, view, `${view} Error`);
         |               ^
      77 |         
      78 |         expect(mockRes.status).toHaveBeenCalledWith(500);
      79 |         expect(mockRes.send).toHaveBeenCalledWith(

      at renderView (tests/integration/error-handling.test.js:76:15)
          at Array.forEach (<anonymous>)
      at Object.forEach (tests/integration/error-handling.test.js:75:13)

  ● Error Handling Integration Tests › View Rendering Error Recovery › should handle route registration with missing global app

    expect(received).not.toThrow()

    Error name:    "TypeError"
    Error message: "utils.registerViewRoute is not a function"

           97 |         // Should not throw even with missing app
           98 |         expect(() => {
        >  99 |           utils.registerViewRoute('/test', 'test', 'Test Error');
              |                 ^
          100 |         }).not.toThrow(); // should not crash when app undefined
          101 |         
          102 |         global.app = null;

      at registerViewRoute (tests/integration/error-handling.test.js:99:17)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (tests/integration/error-handling.test.js:100:16)
      at Object.toThrow (tests/integration/error-handling.test.js:100:16)

  ● Error Handling Integration Tests › Data Validation Error Recovery › should handle validation with various malformed objects

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: {"json": [Function mockConstructor], "status": [Function mockConstructor]}

      235 |         
      236 |         const result = utils.requireFields(obj, fields, mockRes); // (reordered parameters to match obj, fields, res)
    > 237 |         expect(result).toBe(false); // validation fails as expected
          |                        ^
      238 |         expect(mockRes.status).toHaveBeenCalledWith(expectedStatus); // status matches table
      239 |       });
      240 |     });

      at toBe (tests/integration/error-handling.test.js:237:24)
          at Array.forEach (<anonymous>)
      at Object.forEach (tests/integration/error-handling.test.js:232:17)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From tests/integration/error-handling.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From tests/integration/error-handling.test.js.

      at Object.get [as File] (node_modules/winston/lib/winston/transports/index.js:30:12)
      at node_modules/qerrors/lib/logger.js:164:57
      at buildLogger (node_modules/qerrors/lib/logger.js:171:11)
/home/runner/workspace/node_modules/qerrors/lib/logger.js:164
                                arr.push(new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', ...rotationOpts, maxFiles: fileCap, format: fileFormat })); //(size-based rotation for error files with count limit)
                                         ^

TypeError: transports.File is not a constructor
    at /home/runner/workspace/node_modules/qerrors/lib/logger.js:164:42
    at buildLogger (/home/runner/workspace/node_modules/qerrors/lib/logger.js:171:11)

Node.js v20.19.3

```

### Duration: 13879ms

---

## Summary

- Total failed tests: 16
- Failed test files: index.exports.test.js, lib/additional-edge-cases.test.js, lib/system/env/env.test.js, lib/system/realtime/realtime.test.js, lib/system/shutdown/shutdown-utils.test.js, lib/system/worker-pool/worker-pool.test.js, lib/utilities/datetime/datetime-enhanced.test.js, lib/utilities/datetime/datetime.test.js, lib/utilities/file/file-utils.test.js, lib/utilities/id-generation/id-generation.test.js, lib/utilities/string/string-utils.test.js, lib/utilities/url/url.test.js, lib/validation/advanced-validation.test.js, lib/validation/github-validation.test.js, lib/validation/validation.test.js, tests/integration/error-handling.test.js
- Generated: 2025-08-19T10:42:00.881Z

# Test Failure Analysis

**Creation Time:** 2025-08-19T10:46:30.911Z
**Pacific Time:** Tuesday, August 19, 2025 at 03:46:30 AM PDT

⚠️ **STALENESS WARNING:** If your code changes are after the creation time above and you are checking this file, then it is stale and tests need to be rerun.

Analyze and address the following test failures:

## Failed Test 1: index.exports.test.js

### Output:
```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/workspace
  90 files checked.
  roots: /home/runner/workspace/lib, /home/runner/workspace/tests - 90 matches
  testMatch: **/tests/**/*.test.js, **/*.test.js - 51 matches
  testPathIgnorePatterns: /node_modules/ - 90 matches
  testRegex:  - 0 matches
Pattern: index.exports.test.js - 0 matches

```

### Duration: 50269ms

---

## Failed Test 2: lib/additional-edge-cases.test.js

### Output:
```
FAIL lib/additional-edge-cases.test.js (9.993 s)
  Additional Edge Cases
    stripProtocol
      ✕ should return input when not string and log error (19 ms)
    parseUrlParts
      ✕ should return null for malformed url with protocol only (44 ms)

  ● Additional Edge Cases › stripProtocol › should return input when not string and log error

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      20 |       const mockQerrors = jest.spyOn(qerrors, 'qerrors').mockImplementation(() => {});
      21 |       const result = stripProtocol(null);
    > 22 |       expect(mockQerrors).toHaveBeenCalled(); // confirm error logged for bad input
         |                           ^
      23 |       expect(result).toBeNull(); // invalid input returns null
      24 |       mockQerrors.mockRestore();
      25 |     });

      at Object.toHaveBeenCalled (lib/additional-edge-cases.test.js:22:27)

  ● Additional Edge Cases › parseUrlParts › should return null for malformed url with protocol only

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      30 |       const mockQerrors = jest.spyOn(qerrors, 'qerrors').mockImplementation(() => {});
      31 |       const result = parseUrlParts('http://');
    > 32 |       expect(mockQerrors).toHaveBeenCalled(); // invalid url should trigger logging
         |                           ^
      33 |       expect(result).toBeNull(); // result should be null on failure
      34 |       mockQerrors.mockRestore();
      35 |     });

      at Object.toHaveBeenCalled (lib/additional-edge-cases.test.js:32:27)


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

### Duration: 46362ms

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

### Duration: 22822ms

---

## Failed Test 4: lib/system/realtime/realtime.test.js

### Output:
```
FAIL lib/system/realtime/realtime.test.js (23.006 s)
  Real-time Communication Utilities
    createBroadcastRegistry
      ✕ should create registry with specified functions (88 ms)
      ✕ should handle invalid configuration gracefully (10 ms)
      ✓ should allow setting and getting broadcast functions (6 ms)
      ✕ should reject non-function values (7 ms)
      ✓ should allow setting functions to null (77 ms)
      ✕ should track function readiness correctly (20 ms)
      ✕ should clear all functions (220 ms)
      ✕ should skip invalid function names (3 ms)
      ✕ should prevent deletion of registry properties (2 ms)
    createPaymentBroadcastRegistry
      ✕ should create registry with standard payment functions
      ✕ should work with standard payment workflow
      ✕ should support typical usage patterns (1 ms)
    createSocketBroadcastRegistry
      ✕ should create registry with static interface
      ✕ should allow function assignment through setters (1 ms)
      ✕ should execute assigned functions correctly
      ✕ should validate function assignments
      ✕ should track readiness state correctly
      ✕ should support function clearing
      ✕ should handle null assignments correctly
      ✕ should work with typical socket.io usage patterns
      ✕ should match expected interface exactly
    validateBroadcastData
      ✕ should validate simple valid data
      ✕ should reject null and undefined data
      ✕ should reject circular references (1 ms)
      ✕ should reject oversized data
      ✕ should detect potentially sensitive data
      ✕ should reject functions by default
      ✕ should allow functions when explicitly enabled
      ✕ should handle nested objects
      ✕ should handle arrays
      ✕ should handle custom size limits
      ✕ should handle validation errors gracefully
    Integration Scenarios
      ✕ should support complete broadcast workflow
      ✕ should handle service initialization timing
      ✕ should support testing with mock functions (30 ms)

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

### Duration: 36180ms

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
Time:        7.521 s
Ran all test suites matching /lib\/system\/shutdown\/shutdown-utils.test.js/i.

```

### Duration: 55399ms

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
Time:        16.117 s
Ran all test suites matching /lib\/system\/worker-pool\/worker-pool.test.js/i.

```

### Duration: 54084ms

---

## Failed Test 7: lib/utilities/datetime/datetime-enhanced.test.js

### Output:
```
FAIL lib/utilities/datetime/datetime-enhanced.test.js (8.18 s)
  Enhanced DateTime Utilities
    formatDate
      ✓ should format Date objects to locale string (95 ms)
      ✓ should format ISO date strings (12 ms)
      ✓ should return fallback for null/undefined dates (13 ms)
      ✓ should return fallback for invalid dates (9 ms)
      ✓ should handle various date string formats (7 ms)
    formatDateWithPrefix
      ✓ should format date with default prefix (12 ms)
      ✓ should format date with custom prefix (11 ms)
      ✓ should return fallback for null/undefined dates (3 ms)
      ✓ should return fallback for invalid dates (3 ms)
      ✓ should handle Date objects (4 ms)
    formatTimestamp
      ✕ should format timestamp with date and time (4 ms)
      ✕ should format Date objects (1 ms)
      ✕ should return fallback for null/undefined timestamps
      ✕ should return fallback for invalid timestamps
    formatRelativeTime
      ✕ should return "Just now" for very recent dates (1 ms)
      ✕ should format minutes ago correctly
      ✕ should format hours ago correctly
      ✕ should format days ago correctly
      ✕ should fall back to absolute date for longer periods
      ✕ should handle singular vs plural correctly
      ✕ should return fallback for invalid dates
      ✕ should handle ISO date strings
    formatExecutionDuration
      ✕ should format completed execution duration in seconds
      ✕ should format duration in minutes
      ✕ should format duration in hours
      ✕ should calculate ongoing execution duration
      ✕ should handle missing startedAt
      ✕ should handle null/undefined execution (1 ms)
      ✕ should handle invalid dates
      ✕ should handle Date objects
      ✕ should round durations appropriately
    formatCompletionDate
      ✕ should format completion date when completedAt is present (1 ms)
      ✕ should return "Running..." for processing executions
      ✕ should return "Running..." for in_progress executions (1 ms)
      ✕ should use custom running text
      ✕ should return "Not completed" for other statuses
      ✕ should return "Not completed" for null/undefined execution
      ✕ should prefer completedAt over status
      ✕ should handle Date objects in completedAt (4 ms)
      ✕ should handle invalid completedAt dates (1 ms)
    Integration with existing datetime functions
      ✕ should work alongside existing formatDateTime (7 ms)
      ✓ should work alongside existing addDays (12 ms)
      ✕ should work alongside existing formatDuration (198 ms)

  ● Enhanced DateTime Utilities › formatTimestamp › should format timestamp with date and time

    TypeError: datetimeUtils.formatTimestamp is not a function

      74 |   describe('formatTimestamp', () => {
      75 |     test('should format timestamp with date and time', () => {
    > 76 |       const result = datetimeUtils.formatTimestamp('2023-12-25T10:30:00Z');
         |                                    ^
      77 |       expect(typeof result).toBe('string');
      78 |       expect(result).not.toBe('Unknown');
      79 |       // Should include both date and time components

      at Object.formatTimestamp (lib/utilities/datetime/datetime-enhanced.test.js:76:36)

  ● Enhanced DateTime Utilities › formatTimestamp › should format Date objects

    TypeError: datetimeUtils.formatTimestamp is not a function

      83 |     test('should format Date objects', () => {
      84 |       const date = new Date('2023-12-25T10:30:00Z');
    > 85 |       const result = datetimeUtils.formatTimestamp(date);
         |                                    ^
      86 |       expect(typeof result).toBe('string');
      87 |       expect(result).not.toBe('Unknown');
      88 |     });

      at Object.formatTimestamp (lib/utilities/datetime/datetime-enhanced.test.js:85:36)

  ● Enhanced DateTime Utilities › formatTimestamp › should return fallback for null/undefined timestamps

    TypeError: datetimeUtils.formatTimestamp is not a function

      89 |
      90 |     test('should return fallback for null/undefined timestamps', () => {
    > 91 |       expect(datetimeUtils.formatTimestamp(null)).toBe('Unknown');
         |                            ^
      92 |       expect(datetimeUtils.formatTimestamp(undefined, 'No time')).toBe('No time');
      93 |     });
      94 |

      at Object.formatTimestamp (lib/utilities/datetime/datetime-enhanced.test.js:91:28)

  ● Enhanced DateTime Utilities › formatTimestamp › should return fallback for invalid timestamps

    TypeError: datetimeUtils.formatTimestamp is not a function

      94 |
      95 |     test('should return fallback for invalid timestamps', () => {
    > 96 |       expect(datetimeUtils.formatTimestamp('invalid-timestamp')).toBe('Unknown');
         |                            ^
      97 |       expect(datetimeUtils.formatTimestamp(new Date('invalid'), 'Error')).toBe('Error');
      98 |     });
      99 |   });

      at Object.formatTimestamp (lib/utilities/datetime/datetime-enhanced.test.js:96:28)

  ● Enhanced DateTime Utilities › formatRelativeTime › should return "Just now" for very recent dates

    TypeError: datetimeUtils.formatRelativeTime is not a function

      102 |     test('should return "Just now" for very recent dates', () => {
      103 |       const recentDate = new Date(Date.now() - 30000); // 30 seconds ago
    > 104 |       const result = datetimeUtils.formatRelativeTime(recentDate);
          |                                    ^
      105 |       expect(result).toBe('Just now');
      106 |     });
      107 |

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:104:36)

  ● Enhanced DateTime Utilities › formatRelativeTime › should format minutes ago correctly

    TypeError: datetimeUtils.formatRelativeTime is not a function

      108 |     test('should format minutes ago correctly', () => {
      109 |       const minutesAgo = new Date(Date.now() - 300000); // 5 minutes ago
    > 110 |       const result = datetimeUtils.formatRelativeTime(minutesAgo);
          |                                    ^
      111 |       expect(result).toMatch(/\d+ minutes? ago/);
      112 |     });
      113 |

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:110:36)

  ● Enhanced DateTime Utilities › formatRelativeTime › should format hours ago correctly

    TypeError: datetimeUtils.formatRelativeTime is not a function

      114 |     test('should format hours ago correctly', () => {
      115 |       const hoursAgo = new Date(Date.now() - 7200000); // 2 hours ago
    > 116 |       const result = datetimeUtils.formatRelativeTime(hoursAgo);
          |                                    ^
      117 |       expect(result).toMatch(/\d+ hours? ago/);
      118 |     });
      119 |

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:116:36)

  ● Enhanced DateTime Utilities › formatRelativeTime › should format days ago correctly

    TypeError: datetimeUtils.formatRelativeTime is not a function

      120 |     test('should format days ago correctly', () => {
      121 |       const daysAgo = new Date(Date.now() - 172800000); // 2 days ago
    > 122 |       const result = datetimeUtils.formatRelativeTime(daysAgo);
          |                                    ^
      123 |       expect(result).toMatch(/\d+ days? ago/);
      124 |     });
      125 |

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:122:36)

  ● Enhanced DateTime Utilities › formatRelativeTime › should fall back to absolute date for longer periods

    TypeError: datetimeUtils.formatRelativeTime is not a function

      126 |     test('should fall back to absolute date for longer periods', () => {
      127 |       const weekAgo = new Date(Date.now() - 604800000); // 1 week ago
    > 128 |       const result = datetimeUtils.formatRelativeTime(weekAgo);
          |                                    ^
      129 |       expect(result).not.toMatch(/ago$/); // Should be absolute date format
      130 |     });
      131 |

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:128:36)

  ● Enhanced DateTime Utilities › formatRelativeTime › should handle singular vs plural correctly

    TypeError: datetimeUtils.formatRelativeTime is not a function

      132 |     test('should handle singular vs plural correctly', () => {
      133 |       const oneMinuteAgo = new Date(Date.now() - 60000);
    > 134 |       const result = datetimeUtils.formatRelativeTime(oneMinuteAgo);
          |                                    ^
      135 |       expect(result).toBe('1 minute ago');
      136 |     });
      137 |

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:134:36)

  ● Enhanced DateTime Utilities › formatRelativeTime › should return fallback for invalid dates

    TypeError: datetimeUtils.formatRelativeTime is not a function

      137 |
      138 |     test('should return fallback for invalid dates', () => {
    > 139 |       expect(datetimeUtils.formatRelativeTime(null)).toBe('Unknown');
          |                            ^
      140 |       expect(datetimeUtils.formatRelativeTime('invalid-date', 'Error')).toBe('Error');
      141 |     });
      142 |

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:139:28)

  ● Enhanced DateTime Utilities › formatRelativeTime › should handle ISO date strings

    TypeError: datetimeUtils.formatRelativeTime is not a function

      143 |     test('should handle ISO date strings', () => {
      144 |       const isoDate = new Date(Date.now() - 300000).toISOString();
    > 145 |       const result = datetimeUtils.formatRelativeTime(isoDate);
          |                                    ^
      146 |       expect(result).toMatch(/\d+ minutes? ago/);
      147 |     });
      148 |   });

      at Object.formatRelativeTime (lib/utilities/datetime/datetime-enhanced.test.js:145:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should format completed execution duration in seconds

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      154 |         completedAt: '2023-12-25T10:00:45Z'
      155 |       };
    > 156 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      157 |       expect(result).toBe('45s');
      158 |     });
      159 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:156:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should format duration in minutes

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      163 |         completedAt: '2023-12-25T10:05:00Z'
      164 |       };
    > 165 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      166 |       expect(result).toBe('5m');
      167 |     });
      168 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:165:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should format duration in hours

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      172 |         completedAt: '2023-12-25T12:00:00Z'
      173 |       };
    > 174 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      175 |       expect(result).toBe('2h');
      176 |     });
      177 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:174:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should calculate ongoing execution duration

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      181 |         startedAt: fiveMinutesAgo
      182 |       };
    > 183 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      184 |       expect(result).toMatch(/[45]m/); // Should be around 5 minutes
      185 |     });
      186 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:183:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should handle missing startedAt

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      187 |     test('should handle missing startedAt', () => {
      188 |       const execution = {};
    > 189 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      190 |       expect(result).toBe('Not started');
      191 |     });
      192 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:189:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should handle null/undefined execution

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      192 |
      193 |     test('should handle null/undefined execution', () => {
    > 194 |       expect(datetimeUtils.formatExecutionDuration(null)).toBe('Not started');
          |                            ^
      195 |       expect(datetimeUtils.formatExecutionDuration(undefined)).toBe('Not started');
      196 |     });
      197 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:194:28)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should handle invalid dates

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      201 |         completedAt: '2023-12-25T10:00:00Z'
      202 |       };
    > 203 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      204 |       expect(result).toBe('Invalid time');
      205 |     });
      206 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:203:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should handle Date objects

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      212 |         completedAt: end
      213 |       };
    > 214 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      215 |       expect(result).toMatch(/[45]m/);
      216 |     });
      217 |

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:214:36)

  ● Enhanced DateTime Utilities › formatExecutionDuration › should round durations appropriately

    TypeError: datetimeUtils.formatExecutionDuration is not a function

      221 |         completedAt: '2023-12-25T10:05:30Z' // 5.5 minutes
      222 |       };
    > 223 |       const result = datetimeUtils.formatExecutionDuration(execution);
          |                                    ^
      224 |       expect(result).toBe('6m'); // Should round to 6 minutes
      225 |     });
      226 |   });

      at Object.formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:223:36)

  ● Enhanced DateTime Utilities › formatCompletionDate › should format completion date when completedAt is present

    TypeError: datetimeUtils.formatCompletionDate is not a function

      231 |         completedAt: '2023-12-25T10:00:00Z'
      232 |       };
    > 233 |       const result = datetimeUtils.formatCompletionDate(execution);
          |                                    ^
      234 |       expect(typeof result).toBe('string');
      235 |       expect(result).not.toBe('Not completed');
      236 |       expect(result).not.toBe('Running...');

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:233:36)

  ● Enhanced DateTime Utilities › formatCompletionDate › should return "Running..." for processing executions

    TypeError: datetimeUtils.formatCompletionDate is not a function

      239 |     test('should return "Running..." for processing executions', () => {
      240 |       const execution = { status: 'processing' };
    > 241 |       const result = datetimeUtils.formatCompletionDate(execution);
          |                                    ^
      242 |       expect(result).toBe('Running...');
      243 |     });
      244 |

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:241:36)

  ● Enhanced DateTime Utilities › formatCompletionDate › should return "Running..." for in_progress executions

    TypeError: datetimeUtils.formatCompletionDate is not a function

      245 |     test('should return "Running..." for in_progress executions', () => {
      246 |       const execution = { status: 'in_progress' };
    > 247 |       const result = datetimeUtils.formatCompletionDate(execution);
          |                                    ^
      248 |       expect(result).toBe('Running...');
      249 |     });
      250 |

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:247:36)

  ● Enhanced DateTime Utilities › formatCompletionDate › should use custom running text

    TypeError: datetimeUtils.formatCompletionDate is not a function

      251 |     test('should use custom running text', () => {
      252 |       const execution = { status: 'processing' };
    > 253 |       const result = datetimeUtils.formatCompletionDate(execution, 'Active');
          |                                    ^
      254 |       expect(result).toBe('Active');
      255 |     });
      256 |

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:253:36)

  ● Enhanced DateTime Utilities › formatCompletionDate › should return "Not completed" for other statuses

    TypeError: datetimeUtils.formatCompletionDate is not a function

      256 |
      257 |     test('should return "Not completed" for other statuses', () => {
    > 258 |       expect(datetimeUtils.formatCompletionDate({ status: 'failed' })).toBe('Not completed');
          |                            ^
      259 |       expect(datetimeUtils.formatCompletionDate({ status: 'cancelled' })).toBe('Not completed');
      260 |       expect(datetimeUtils.formatCompletionDate({ status: 'pending' })).toBe('Not completed');
      261 |     });

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:258:28)

  ● Enhanced DateTime Utilities › formatCompletionDate › should return "Not completed" for null/undefined execution

    TypeError: datetimeUtils.formatCompletionDate is not a function

      262 |
      263 |     test('should return "Not completed" for null/undefined execution', () => {
    > 264 |       expect(datetimeUtils.formatCompletionDate(null)).toBe('Not completed');
          |                            ^
      265 |       expect(datetimeUtils.formatCompletionDate(undefined)).toBe('Not completed');
      266 |     });
      267 |

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:264:28)

  ● Enhanced DateTime Utilities › formatCompletionDate › should prefer completedAt over status

    TypeError: datetimeUtils.formatCompletionDate is not a function

      271 |         status: 'processing'
      272 |       };
    > 273 |       const result = datetimeUtils.formatCompletionDate(execution);
          |                                    ^
      274 |       expect(result).not.toBe('Running...');
      275 |       expect(typeof result).toBe('string');
      276 |     });

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:273:36)

  ● Enhanced DateTime Utilities › formatCompletionDate › should handle Date objects in completedAt

    TypeError: datetimeUtils.formatCompletionDate is not a function

      280 |         completedAt: new Date('2023-12-25T10:00:00Z')
      281 |       };
    > 282 |       const result = datetimeUtils.formatCompletionDate(execution);
          |                                    ^
      283 |       expect(typeof result).toBe('string');
      284 |       expect(result).not.toBe('Not completed');
      285 |     });

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:282:36)

  ● Enhanced DateTime Utilities › formatCompletionDate › should handle invalid completedAt dates

    TypeError: datetimeUtils.formatCompletionDate is not a function

      289 |         completedAt: 'invalid-date'
      290 |       };
    > 291 |       const result = datetimeUtils.formatCompletionDate(execution);
          |                                    ^
      292 |       expect(result).toBe('Completed'); // Falls back to 'Completed' for invalid dates
      293 |     });
      294 |   });

      at Object.formatCompletionDate (lib/utilities/datetime/datetime-enhanced.test.js:291:36)

  ● Enhanced DateTime Utilities › Integration with existing datetime functions › should work alongside existing formatDateTime

    TypeError: datetimeUtils.formatTimestamp is not a function

      299 |       const dateStr = '2023-12-25T10:30:00Z';
      300 |       const existing = datetimeUtils.formatDateTime(dateStr);
    > 301 |       const enhanced = datetimeUtils.formatTimestamp(dateStr);
          |                                      ^
      302 |       
      303 |       expect(typeof existing).toBe('string');
      304 |       expect(typeof enhanced).toBe('string');

      at Object.formatTimestamp (lib/utilities/datetime/datetime-enhanced.test.js:301:38)

  ● Enhanced DateTime Utilities › Integration with existing datetime functions › should work alongside existing formatDuration

    expect(received).not.toThrow()

    Error name:    "TypeError"
    Error message: "datetimeUtils.formatExecutionDuration is not a function"

          322 |       expect(() => {
          323 |         datetimeUtils.formatDuration(startDate, endDate);
        > 324 |         datetimeUtils.formatExecutionDuration({ startedAt: startDate, completedAt: endDate });
              |                       ^
          325 |       }).not.toThrow();
          326 |     });
          327 |   });

      at formatExecutionDuration (lib/utilities/datetime/datetime-enhanced.test.js:324:23)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/utilities/datetime/datetime-enhanced.test.js:325:14)
      at Object.toThrow (lib/utilities/datetime/datetime-enhanced.test.js:325:14)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/datetime/datetime-enhanced.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/datetime/datetime-enhanced.test.js.

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

### Duration: 26592ms

---

## Failed Test 8: lib/utilities/datetime/datetime.test.js

### Output:
```
FAIL lib/utilities/datetime/datetime.test.js (11.407 s)
  DateTime Utilities
    formatDateTime
      ✓ should format valid ISO date string (39 ms)
      ✓ should return "N/A" for empty string (3 ms)
      ✓ should return "N/A" for null input (10 ms)
      ✓ should return "N/A" for undefined input (1 ms)
      ✓ should return "N/A" for invalid date string (3 ms)
      ✓ should handle different ISO formats (17 ms)
    formatDuration
      ✓ should calculate duration between two valid dates (1 ms)
      ✓ should calculate duration from start to now when end is not provided (5 ms)
      ✓ should return "00:00:00" for empty start date (4 ms)
      ✓ should return "00:00:00" for null start date (8 ms)
      ✓ should handle same start and end dates (8 ms)
      ✓ should handle end date before start date (absolute difference) (6 ms)
      ✓ should throw error for invalid start date (106 ms)
      ✓ should throw error for invalid end date (4 ms)
      ✓ should format durations correctly with zero padding
    addDays
      ✓ should add default 90 days when no parameter provided (1 ms)
      ✓ should add specified number of days (35 ms)
      ✓ should handle negative days (past dates) (1 ms)
      ✓ should handle zero days (current date)
      ✓ should handle month boundaries correctly (2 ms)
      ✓ should handle year boundaries correctly (1 ms)
      ✓ should preserve time component (1 ms)
      ✕ should handle invalid input gracefully (20 ms)
      ✓ should handle large day values (59 ms)
      ✓ should return new Date object (immutability) (7 ms)
      ✓ should work with typical business scenarios (1 ms)
      ✓ should handle leap year calculations (1 ms)
      ✓ should be consistent across multiple calls (2 ms)

  ● DateTime Utilities › addDays › should handle invalid input gracefully

    expect(received).toBeLessThan(expected)

    Expected: < 1000
    Received:   7776000001

      230 |         
      231 |         const timeDiff = Math.abs(result.getTime() - expected.getTime());
    > 232 |         expect(timeDiff).toBeLessThan(1000); // within 1 second (accounting for execution time)
          |                          ^
      233 |       });
      234 |     });
      235 |

      at toBeLessThan (lib/utilities/datetime/datetime.test.js:232:26)
          at Array.forEach (<anonymous>)
      at Object.forEach (lib/utilities/datetime/datetime.test.js:221:21)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/datetime/datetime.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/datetime/datetime.test.js.

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

### Duration: 26427ms

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
Time:        12.869 s
Ran all test suites matching /lib\/utilities\/file\/file-utils.test.js/i.

```

### Duration: 25355ms

---

## Failed Test 10: lib/utilities/id-generation/id-generation.test.js

### Output:
```
FAIL lib/utilities/id-generation/id-generation.test.js (10.432 s)
  Secure ID Generation Utilities
    generateExecutionId
      ✕ should generate execution ID with correct format (68 ms)
      ✓ should generate unique IDs on multiple calls (87 ms)
      ✓ should generate IDs with recent timestamps
      ✓ should maintain chronological ordering (13 ms)
      ✓ should handle rapid generation without collisions (20 ms)
    generateTaskId
      ✕ should generate task ID with correct format (1 ms)
      ✕ should generate unique task IDs (1 ms)
      ✕ should generate different types of IDs with different prefixes
      ✕ should support workflow hierarchy tracking
    generateSecureId
      ✕ should generate ID with custom prefix
      ✕ should validate prefix parameter (75 ms)
      ✕ should accept valid prefixes (8 ms)
      ✕ should generate IDs with different prefixes correctly
      ✕ should maintain timestamp ordering across different prefixes (1 ms)
      ✕ should handle edge case prefixes
    generateSimpleId
      ✕ should generate simple ID with default length (1 ms)
      ✕ should generate simple ID with custom length
      ✕ should validate length parameter (100 ms)
      ✕ should accept valid lengths (96 ms)
      ✕ should validate prefix like generateSecureId (1 ms)
      ✕ should generate unique simple IDs
      ✕ should not include timestamp
      ✕ should work with different use cases (1 ms)
    ID Format and Security
      ✕ should use nanoid character set
      ✕ should generate IDs safe for URLs and databases (1 ms)
      ✕ should provide collision resistance (1 ms)
      ✕ should handle concurrent generation
      ✕ should maintain performance under load
    Error Handling
      ✕ should handle errors gracefully (10 ms)
      ✕ should provide descriptive error messages
      ✓ should validate all edge cases consistently (11 ms)
      ✕ should handle boundary values correctly (47 ms)

  ● Secure ID Generation Utilities › generateExecutionId › should generate execution ID with correct format

    expect(received).toMatch(expected)

    Expected pattern: /^exec_\d+_[a-zA-Z0-9_-]{11}$/
    Received string:  "exec_1755600247684_nxUVgwafbMa9"

      13 |       
      14 |       expect(typeof execId).toBe('string'); // returns string
    > 15 |       expect(execId).toMatch(/^exec_\d+_[a-zA-Z0-9_-]{11}$/); // matches expected format
         |                      ^
      16 |       expect(execId.startsWith('exec_')).toBe(true); // has execution prefix
      17 |       
      18 |       const parts = execId.split('_');

      at Object.toMatch (lib/utilities/id-generation/id-generation.test.js:15:22)

  ● Secure ID Generation Utilities › generateTaskId › should generate task ID with correct format

    TypeError: generateTaskId is not a function

      86 |     // verifies should generate task ID with correct format
      87 |     test('should generate task ID with correct format', () => {
    > 88 |       const taskId = generateTaskId();
         |                      ^
      89 |       
      90 |       expect(typeof taskId).toBe('string'); // returns string
      91 |       expect(taskId).toMatch(/^task_\d+_[a-zA-Z0-9_-]{11}$/); // matches expected format

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:88:22)

  ● Secure ID Generation Utilities › generateTaskId › should generate unique task IDs

    TypeError: generateTaskId is not a function

      105 |       
      106 |       for (let i = 0; i < numTests; i++) {
    > 107 |         const id = generateTaskId();
          |                    ^
      108 |         expect(ids.has(id)).toBe(false); // no duplicates
      109 |         ids.add(id);
      110 |       }

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:107:20)

  ● Secure ID Generation Utilities › generateTaskId › should generate different types of IDs with different prefixes

    TypeError: generateTaskId is not a function

      116 |     test('should generate different types of IDs with different prefixes', () => {
      117 |       const execId = generateExecutionId();
    > 118 |       const taskId = generateTaskId();
          |                      ^
      119 |       
      120 |       expect(execId.startsWith('exec_')).toBe(true); // execution has exec prefix
      121 |       expect(taskId.startsWith('task_')).toBe(true); // task has task prefix

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:118:22)

  ● Secure ID Generation Utilities › generateTaskId › should support workflow hierarchy tracking

    TypeError: generateTaskId is not a function

      126 |     test('should support workflow hierarchy tracking', () => {
      127 |       const executionId = generateExecutionId();
    > 128 |       const taskId1 = generateTaskId();
          |                       ^
      129 |       const taskId2 = generateTaskId();
      130 |       
      131 |       // Simulate workflow structure

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:128:23)

  ● Secure ID Generation Utilities › generateSecureId › should generate ID with custom prefix

    TypeError: generateSecureId is not a function

      146 |     // verifies should generate ID with custom prefix
      147 |     test('should generate ID with custom prefix', () => {
    > 148 |       const customId = generateSecureId('custom');
          |                        ^
      149 |       
      150 |       expect(typeof customId).toBe('string'); // returns string
      151 |       expect(customId).toMatch(/^custom_\d+_[a-zA-Z0-9_-]{11}$/); // matches expected format

      at Object.generateSecureId (lib/utilities/id-generation/id-generation.test.js:148:24)

  ● Secure ID Generation Utilities › generateSecureId › should validate prefix parameter

    expect(received).toThrow(expected)

    Expected substring: "Prefix must be a non-empty string"
    Received message:   "generateSecureId is not a function"

          160 |     test('should validate prefix parameter', () => {
          161 |       // Test invalid prefixes
        > 162 |       expect(() => generateSecureId()).toThrow('Prefix must be a non-empty string'); // undefined prefix
              |                    ^
          163 |       expect(() => generateSecureId(null)).toThrow('Prefix must be a non-empty string'); // null prefix
          164 |       expect(() => generateSecureId('')).toThrow('Prefix cannot be empty or whitespace only'); // empty prefix
          165 |       expect(() => generateSecureId('   ')).toThrow('Prefix cannot be empty or whitespace only'); // whitespace prefix

      at generateSecureId (lib/utilities/id-generation/id-generation.test.js:162:20)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:162:40)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:162:40)

  ● Secure ID Generation Utilities › generateSecureId › should accept valid prefixes

    expect(received).not.toThrow()

    Error name:    "TypeError"
    Error message: "generateSecureId is not a function"

          182 |       
          183 |       validPrefixes.forEach(prefix => {
        > 184 |         expect(() => generateSecureId(prefix)).not.toThrow(); // valid prefix accepted
              |                      ^
          185 |         const id = generateSecureId(prefix);
          186 |         expect(id.startsWith(prefix + '_')).toBe(true); // correct prefix used
          187 |       });

      at generateSecureId (lib/utilities/id-generation/id-generation.test.js:184:22)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at toThrow (lib/utilities/id-generation/id-generation.test.js:184:52)
                at Array.forEach (<anonymous>)
      at Object.forEach (lib/utilities/id-generation/id-generation.test.js:183:21)
      at toThrow (lib/utilities/id-generation/id-generation.test.js:184:52)
          at Array.forEach (<anonymous>)
      at Object.forEach (lib/utilities/id-generation/id-generation.test.js:183:21)

  ● Secure ID Generation Utilities › generateSecureId › should generate IDs with different prefixes correctly

    TypeError: generateSecureId is not a function

      190 |     // verifies should generate IDs with different prefixes correctly
      191 |     test('should generate IDs with different prefixes correctly', () => {
    > 192 |       const sessionId = generateSecureId('session');
          |                         ^
      193 |       const requestId = generateSecureId('req');
      194 |       const batchId = generateSecureId('batch');
      195 |       

      at Object.generateSecureId (lib/utilities/id-generation/id-generation.test.js:192:25)

  ● Secure ID Generation Utilities › generateSecureId › should maintain timestamp ordering across different prefixes

    TypeError: generateSecureId is not a function

      205 |     // verifies should maintain timestamp ordering across different prefixes
      206 |     test('should maintain timestamp ordering across different prefixes', () => {
    > 207 |       const id1 = generateSecureId('type1');
          |                   ^
      208 |       const delay = new Promise(resolve => setTimeout(resolve, 1));
      209 |       
      210 |       return delay.then(() => {

      at Object.generateSecureId (lib/utilities/id-generation/id-generation.test.js:207:19)

  ● Secure ID Generation Utilities › generateSecureId › should handle edge case prefixes

    TypeError: generateSecureId is not a function

      219 |     // verifies should handle edge case prefixes
      220 |     test('should handle edge case prefixes', () => {
    > 221 |       const singleChar = generateSecureId('a');
          |                          ^
      222 |       const numbers = generateSecureId('123');
      223 |       const underscores = generateSecureId('_test_');
      224 |       const maxLength = generateSecureId('a'.repeat(20));

      at Object.generateSecureId (lib/utilities/id-generation/id-generation.test.js:221:26)

  ● Secure ID Generation Utilities › generateSimpleId › should generate simple ID with default length

    TypeError: generateSimpleId is not a function

      235 |     // verifies should generate simple ID with default length
      236 |     test('should generate simple ID with default length', () => {
    > 237 |       const simpleId = generateSimpleId('user');
          |                        ^
      238 |       
      239 |       expect(typeof simpleId).toBe('string'); // returns string
      240 |       expect(simpleId).toMatch(/^user_[a-zA-Z0-9_-]{8}$/); // matches expected format with default length

      at Object.generateSimpleId (lib/utilities/id-generation/id-generation.test.js:237:24)

  ● Secure ID Generation Utilities › generateSimpleId › should generate simple ID with custom length

    TypeError: generateSimpleId is not a function

      249 |     // verifies should generate simple ID with custom length
      250 |     test('should generate simple ID with custom length', () => {
    > 251 |       const shortId = generateSimpleId('key', 6);
          |                       ^
      252 |       const longId = generateSimpleId('token', 16);
      253 |       
      254 |       expect(shortId).toMatch(/^key_[a-zA-Z0-9_-]{6}$/); // 6 character random

      at Object.generateSimpleId (lib/utilities/id-generation/id-generation.test.js:251:23)

  ● Secure ID Generation Utilities › generateSimpleId › should validate length parameter

    expect(received).toThrow(expected)

    Expected substring: "Length must be a positive integer"
    Received message:   "generateSimpleId is not a function"

          264 |     test('should validate length parameter', () => {
          265 |       // Test invalid lengths
        > 266 |       expect(() => generateSimpleId('test', 0)).toThrow('Length must be a positive integer'); // zero length
              |                    ^
          267 |       expect(() => generateSimpleId('test', -1)).toThrow('Length must be a positive integer'); // negative length
          268 |       expect(() => generateSimpleId('test', 1.5)).toThrow('Length must be a positive integer'); // decimal length
          269 |       expect(() => generateSimpleId('test', '8')).toThrow('Length must be a positive integer'); // string length

      at generateSimpleId (lib/utilities/id-generation/id-generation.test.js:266:20)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:266:49)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:266:49)

  ● Secure ID Generation Utilities › generateSimpleId › should accept valid lengths

    expect(received).not.toThrow()

    Error name:    "TypeError"
    Error message: "generateSimpleId is not a function"

          280 |       
          281 |       validLengths.forEach(length => {
        > 282 |         expect(() => generateSimpleId('test', length)).not.toThrow(); // valid length accepted
              |                      ^
          283 |         const id = generateSimpleId('test', length);
          284 |         const randomPart = id.split('_')[1];
          285 |         expect(randomPart).toHaveLength(length); // correct length generated

      at generateSimpleId (lib/utilities/id-generation/id-generation.test.js:282:22)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at toThrow (lib/utilities/id-generation/id-generation.test.js:282:60)
                at Array.forEach (<anonymous>)
      at Object.forEach (lib/utilities/id-generation/id-generation.test.js:281:20)
      at toThrow (lib/utilities/id-generation/id-generation.test.js:282:60)
          at Array.forEach (<anonymous>)
      at Object.forEach (lib/utilities/id-generation/id-generation.test.js:281:20)

  ● Secure ID Generation Utilities › generateSimpleId › should validate prefix like generateSecureId

    expect(received).toThrow(expected)

    Expected substring: "Prefix must be a non-empty string"
    Received message:   "generateSimpleId is not a function"

          290 |     test('should validate prefix like generateSecureId', () => {
          291 |       // Test invalid prefixes (same validation as generateSecureId)
        > 292 |       expect(() => generateSimpleId()).toThrow('Prefix must be a non-empty string'); // undefined prefix
              |                    ^
          293 |       expect(() => generateSimpleId(null)).toThrow('Prefix must be a non-empty string'); // null prefix
          294 |       expect(() => generateSimpleId('')).toThrow('Prefix cannot be empty or whitespace only'); // empty prefix
          295 |       expect(() => generateSimpleId('invalid-prefix')).toThrow('Prefix must contain only alphanumeric characters and underscores'); // invalid characters

      at generateSimpleId (lib/utilities/id-generation/id-generation.test.js:292:20)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:292:40)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:292:40)

  ● Secure ID Generation Utilities › generateSimpleId › should generate unique simple IDs

    TypeError: generateSimpleId is not a function

      302 |       
      303 |       for (let i = 0; i < numTests; i++) {
    > 304 |         const id = generateSimpleId('test');
          |                    ^
      305 |         expect(ids.has(id)).toBe(false); // no duplicates
      306 |         ids.add(id);
      307 |       }

      at Object.generateSimpleId (lib/utilities/id-generation/id-generation.test.js:304:20)

  ● Secure ID Generation Utilities › generateSimpleId › should not include timestamp

    TypeError: generateSimpleId is not a function

      312 |     // verifies should not include timestamp
      313 |     test('should not include timestamp', () => {
    > 314 |       const simpleId = generateSimpleId('user');
          |                        ^
      315 |       const parts = simpleId.split('_');
      316 |       
      317 |       expect(parts).toHaveLength(2); // only prefix and random parts

      at Object.generateSimpleId (lib/utilities/id-generation/id-generation.test.js:314:24)

  ● Secure ID Generation Utilities › generateSimpleId › should work with different use cases

    TypeError: generateSimpleId is not a function

      321 |     // verifies should work with different use cases
      322 |     test('should work with different use cases', () => {
    > 323 |       const userId = generateSimpleId('user'); // default 8 chars
          |                      ^
      324 |       const apiKey = generateSimpleId('key', 16); // longer for security
      325 |       const configId = generateSimpleId('cfg', 6); // shorter for brevity
      326 |       const sessionToken = generateSimpleId('sess', 12); // medium length

      at Object.generateSimpleId (lib/utilities/id-generation/id-generation.test.js:323:22)

  ● Secure ID Generation Utilities › ID Format and Security › should use nanoid character set

    TypeError: generateTaskId is not a function

      339 |       const ids = [
      340 |         generateExecutionId(),
    > 341 |         generateTaskId(),
          |         ^
      342 |         generateSecureId('test'),
      343 |         generateSimpleId('simple')
      344 |       ];

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:341:9)

  ● Secure ID Generation Utilities › ID Format and Security › should generate IDs safe for URLs and databases

    TypeError: generateTaskId is not a function

      354 |       const ids = [
      355 |         generateExecutionId(),
    > 356 |         generateTaskId(),
          |         ^
      357 |         generateSecureId('test'),
      358 |         generateSimpleId('simple')
      359 |       ];

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:356:9)

  ● Secure ID Generation Utilities › ID Format and Security › should provide collision resistance

    TypeError: generateTaskId is not a function

      375 |       for (let i = 0; i < numTests; i++) {
      376 |         largeSet.add(generateExecutionId());
    > 377 |         largeSet.add(generateTaskId());
          |                      ^
      378 |         largeSet.add(generateSecureId('test'));
      379 |         largeSet.add(generateSimpleId('simple'));
      380 |       }

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:377:22)

  ● Secure ID Generation Utilities › ID Format and Security › should handle concurrent generation

    TypeError: generateTaskId is not a function

      391 |       for (let i = 0; i < numConcurrent; i++) {
      392 |         promises.push(Promise.resolve(generateExecutionId()));
    > 393 |         promises.push(Promise.resolve(generateTaskId()));
          |                                       ^
      394 |         promises.push(Promise.resolve(generateSecureId('concurrent')));
      395 |         promises.push(Promise.resolve(generateSimpleId('simple')));
      396 |       }

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:393:39)

  ● Secure ID Generation Utilities › ID Format and Security › should maintain performance under load

    TypeError: generateTaskId is not a function

      409 |       for (let i = 0; i < numIterations; i++) {
      410 |         generateExecutionId();
    > 411 |         generateTaskId();
          |         ^
      412 |         generateSecureId('perf');
      413 |         generateSimpleId('simple');
      414 |       }

      at Object.generateTaskId (lib/utilities/id-generation/id-generation.test.js:411:9)

  ● Secure ID Generation Utilities › Error Handling › should handle errors gracefully

    expect(received).not.toThrow()

    Error name:    "TypeError"
    Error message: "generateTaskId is not a function"

          428 |       // Test with valid inputs to ensure no unexpected errors
          429 |       expect(() => generateExecutionId()).not.toThrow(); // execution ID generation
        > 430 |       expect(() => generateTaskId()).not.toThrow(); // task ID generation
              |                    ^
          431 |       expect(() => generateSecureId('valid')).not.toThrow(); // secure ID generation
          432 |       expect(() => generateSimpleId('valid')).not.toThrow(); // simple ID generation
          433 |     });

      at generateTaskId (lib/utilities/id-generation/id-generation.test.js:430:20)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:430:42)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:430:42)

  ● Secure ID Generation Utilities › Error Handling › should provide descriptive error messages

    expect(received).toContain(expected) // indexOf

    Expected substring: "alphanumeric characters and underscores"
    Received string:    "generateSecureId is not a function"

      439 |         fail('Should have thrown an error');
      440 |       } catch (error) {
    > 441 |         expect(error.message).toContain('alphanumeric characters and underscores'); // descriptive message
          |                               ^
      442 |       }
      443 |       
      444 |       try {

      at Object.toContain (lib/utilities/id-generation/id-generation.test.js:441:31)

  ● Secure ID Generation Utilities › Error Handling › should handle boundary values correctly

    expect(received).not.toThrow()

    Error name:    "TypeError"
    Error message: "generateSimpleId is not a function"

          463 |     test('should handle boundary values correctly', () => {
          464 |       // Test boundary lengths for simple IDs
        > 465 |       expect(() => generateSimpleId('test', 1)).not.toThrow(); // minimum length
              |                    ^
          466 |       expect(() => generateSimpleId('test', 50)).not.toThrow(); // maximum length
          467 |       
          468 |       // Test boundary prefix lengths

      at generateSimpleId (lib/utilities/id-generation/id-generation.test.js:465:20)
      at Object.<anonymous> (node_modules/expect/build/toThrowMatchers.js:74:11)
      at Object.throwingMatcher [as toThrow] (node_modules/expect/build/index.js:320:21)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:465:53)
      at Object.toThrow (lib/utilities/id-generation/id-generation.test.js:465:53)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/id-generation/id-generation.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/id-generation/id-generation.test.js.

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

### Duration: 36561ms

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
Time:        9.141 s
Ran all test suites matching /lib\/utilities\/string\/string-utils.test.js/i.

```

### Duration: 18841ms

---

## Failed Test 12: lib/utilities/url/url.test.js

### Output:
```
FAIL lib/utilities/url/url.test.js (24.804 s)
  URL Utilities
    ensureProtocol
      ✓ should add https to URL without protocol (74 ms)
      ✓ should preserve existing https protocol (13 ms)
      ✓ should preserve existing http protocol (14 ms)
      ✕ should handle case-insensitive protocols (33 ms)
      ✕ should return null for empty string (32 ms)
      ✕ should return null for null input (21 ms)
      ✕ should return null for non-string input (24 ms)
      ✓ should handle URLs with paths (35 ms)
      ✓ should handle URLs with query parameters (7 ms)
      ✓ should trim whitespace and add https (7 ms)
    normalizeUrlOrigin
      ✓ should normalize URL to lowercase origin (14 ms)
      ✕ should handle URL without protocol (44 ms)
      ✓ should preserve port numbers (8 ms)
      ✓ should return null for invalid URLs (2 ms)
      ✓ should handle complex URLs
    stripProtocol
      ✓ should remove https protocol (1 ms)
      ✓ should remove http protocol (1 ms)
      ✓ should remove trailing slash (1 ms)
      ✓ should handle case-insensitive protocols (2 ms)
      ✓ should preserve paths and query parameters (2 ms)
      ✓ should handle URLs without protocol (3 ms)
      ✓ should handle error cases gracefully (1 ms)
    parseUrlParts
      ✓ should parse URL into base and endpoint (36 ms)
      ✓ should handle URL with existing protocol (1 ms)
      ✓ should handle root path (10 ms)
      ✓ should handle URL without path (2 ms)
      ✓ should return null for invalid URLs (21 ms)
      ✕ should handle URLs with ports (25 ms)
      ✓ should handle complex query parameters (27 ms)

  ● URL Utilities › ensureProtocol › should handle case-insensitive protocols

    expect(received).toBe(expected) // Object.is equality

    Expected: "HTTP://example.com"
    Received: "http://example.com"

      24 |     // verifies should handle case-insensitive protocols
      25 |     test('should handle case-insensitive protocols', () => {
    > 26 |       expect(ensureProtocol('HTTP://example.com')).toBe('HTTP://example.com'); // should not alter case
         |                                                    ^
      27 |       expect(ensureProtocol('HTTPS://example.com')).toBe('HTTPS://example.com'); // protocol preserved
      28 |     });
      29 |

      at Object.toBe (lib/utilities/url/url.test.js:26:52)

  ● URL Utilities › ensureProtocol › should return null for empty string

    expect(received).toBeNull()

    Received: "https://"

      30 |     // verifies should return null for empty string
      31 |     test('should return null for empty string', () => {
    > 32 |       expect(ensureProtocol('')).toBeNull(); // invalid string results in null
         |                                  ^
      33 |     });
      34 |
      35 |     // verifies should return null for null input

      at Object.toBeNull (lib/utilities/url/url.test.js:32:34)

  ● URL Utilities › ensureProtocol › should return null for null input

    expect(received).toBeNull()

    Received: "https://"

      35 |     // verifies should return null for null input
      36 |     test('should return null for null input', () => {
    > 37 |       expect(ensureProtocol(null)).toBeNull(); // null returns null
         |                                    ^
      38 |     });
      39 |
      40 |     // verifies should return null for non-string input

      at Object.toBeNull (lib/utilities/url/url.test.js:37:36)

  ● URL Utilities › ensureProtocol › should return null for non-string input

    expect(received).toBeNull()

    Received: "https://"

      40 |     // verifies should return null for non-string input
      41 |     test('should return null for non-string input', () => {
    > 42 |       expect(ensureProtocol(123)).toBeNull(); // non-string input returns null
         |                                   ^
      43 |       expect(ensureProtocol({})).toBeNull(); // object input returns null
      44 |     });
      45 |

      at Object.toBeNull (lib/utilities/url/url.test.js:42:35)

  ● URL Utilities › normalizeUrlOrigin › should handle URL without protocol

    expect(received).toBe(expected) // Object.is equality

    Expected: "https://example.com"
    Received: null

      68 |     // verifies should handle URL without protocol
      69 |     test('should handle URL without protocol', () => {
    > 70 |       expect(normalizeUrlOrigin('Example.Com/path')).toBe('https://example.com'); // protocol added when missing
         |                                                      ^
      71 |     });
      72 |
      73 |     // verifies should preserve port numbers

      at Object.toBe (lib/utilities/url/url.test.js:70:54)

  ● URL Utilities › parseUrlParts › should handle URLs with ports

    expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Object {
    -   "baseUrl": "https://example.com:8080",
    +   "baseUrl": "https://0.0.31.144",
        "endpoint": "/api",
      }

      173 |     test('should handle URLs with ports', () => {
      174 |       const result = parseUrlParts('example.com:8080/api');
    > 175 |       expect(result).toEqual({ // port support
          |                      ^
      176 |         baseUrl: 'https://example.com:8080',
      177 |         endpoint: '/api'
      178 |       });

      at Object.toEqual (lib/utilities/url/url.test.js:175:22)


ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/url/url.test.js.

      at buildLogger (node_modules/qerrors/lib/logger.js:152:33)

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down. From lib/utilities/url/url.test.js.

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

### Duration: 62646ms

---

## Failed Test 13: lib/validation/advanced-validation.test.js

### Output:
```
FAIL lib/validation/advanced-validation.test.js (16.131 s)
  Advanced Validation Utilities
    validateEmail
      ✓ should validate correct email formats (516 ms)
      ✓ should reject invalid email formats (68 ms)
      ✓ should handle empty or invalid input types (188 ms)
      ✓ should sanitize input before validation (245 ms)
    validateRequired
      ✓ should validate non-empty required fields (144 ms)
      ✓ should reject empty or whitespace-only fields (60 ms)
      ✓ should validate minimum length requirements (410 ms)
      ✓ should handle invalid input types (50 ms)
      ✕ should use singular/plural correctly in error messages (55 ms)
    validateMaxLength
      ✕ should validate fields within length limits (27 ms)
      ✕ should reject fields exceeding length limits
      ✕ should handle null/undefined gracefully
      ✕ should sanitize input before length check
    validateSelection
      ✕ should validate non-empty selections
      ✕ should reject empty or whitespace selections
      ✕ should handle invalid input types (1 ms)
      ✕ should use lowercase field names in error messages
    combineValidations
      ✕ should return empty string when all validators pass
      ✕ should return first error encountered
      ✕ should handle validators that throw exceptions
      ✕ should validate that all arguments are functions
      ✕ should handle empty validator list
      ✕ should work with real validation functions
    validateObjectId
      ✕ should validate correct MongoDB ObjectId formats
      ✕ should sanitize input before validation (1 ms)
      ✕ should throw error for invalid input types (258 ms)
      ✕ should throw error for empty input (36 ms)
      ✕ should throw error for invalid ObjectId formats (171 ms)
      ✕ should use custom field names in error messages (49 ms)

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

### Duration: 41377ms

---

## Failed Test 14: lib/validation/github-validation.test.js

### Output:
```
FAIL lib/validation/github-validation.test.js (19.628 s)
  GitHub Validation Utilities
    validateGitHubUrl
      ✓ should validate correct GitHub repository URLs (515 ms)
      ✓ should reject empty or invalid URLs (31 ms)
      ✓ should reject non-GitHub URLs (168 ms)
      ✓ should reject HTTP URLs (require HTTPS) (4 ms)
      ✓ should reject URLs with additional paths (32 ms)
      ✓ should handle malformed input safely (32 ms)
    extractGitHubInfo
      ✕ should extract owner and repository from valid URLs (1 ms)
      ✕ should handle URLs with special characters in names
      ✕ should return null for invalid URLs
      ✕ should return null for URLs with insufficient path parts (16 ms)
    validateGitHubRepo
      ✕ should validate correct repository formats
      ✕ should apply string sanitization
      ✕ should throw error for invalid input types (275 ms)
      ✕ should throw error for empty or invalid formats (593 ms)
    validateGitHubUrlDetailed
      ✕ should return valid result for correct URLs
      ✕ should categorize empty URL errors
      ✕ should categorize format errors
      ✕ should categorize protocol errors
      ✕ should categorize domain errors
      ✕ should categorize path errors
      ✕ should categorize invalid name errors
      ✕ should include original URL in all results (5 ms)

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

### Duration: 50769ms

---

## Failed Test 15: lib/validation/validation.test.js

### Output:
```
FAIL lib/validation/validation.test.js (13.692 s)
  Validation Utilities
    requireFields
      ✓ should return true when all required fields are present (22 ms)
      ✕ should return false and send error for missing fields (108 ms)
      ✕ should return false for multiple missing fields (4 ms)
      ✕ should treat falsy values as missing (42 ms)
      ✓ should handle empty object (7 ms)
      ✓ should handle empty required fields array (6 ms)
      ✕ should handle undefined object gracefully (8 ms)
      ✕ should handle null object gracefully (7 ms)
      ✓ should accept truthy values (8 ms)
      ✕ should handle invalid requiredFields parameter (4 ms)
      ✕ should handle non-array requiredFields parameter (5 ms)
      ✕ should handle invalid obj parameter (10 ms)

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

### Duration: 32205ms

---

## Failed Test 16: tests/integration/error-handling.test.js

### Output:
```
FAIL tests/integration/error-handling.test.js (14.134 s)
  Error Handling Integration Tests
    Cascading Error Scenarios
      ✕ should handle multiple module failures gracefully (36 ms)
      ✕ should handle error propagation in API workflow (15 ms)
    View Rendering Error Recovery
      ✕ should handle template rendering failures across multiple views (4 ms)
      ✕ should handle route registration with missing global app (77 ms)
    Authentication Error Scenarios
      ✓ should handle passport strategy detection with broken global state (170 ms)
      ✓ should handle authentication with various request object states (98 ms)
    URL Processing Error Recovery
      ✓ should handle malformed URLs throughout processing pipeline (32 ms)
      ✓ should handle URL processing with partial failures (434 ms)
    Data Validation Error Recovery
      ✕ should handle validation with various malformed objects (8 ms)

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

### Duration: 31864ms

---

## Summary

- Total failed tests: 16
- Failed test files: index.exports.test.js, lib/additional-edge-cases.test.js, lib/system/env/env.test.js, lib/system/realtime/realtime.test.js, lib/system/shutdown/shutdown-utils.test.js, lib/system/worker-pool/worker-pool.test.js, lib/utilities/datetime/datetime-enhanced.test.js, lib/utilities/datetime/datetime.test.js, lib/utilities/file/file-utils.test.js, lib/utilities/id-generation/id-generation.test.js, lib/utilities/string/string-utils.test.js, lib/utilities/url/url.test.js, lib/validation/advanced-validation.test.js, lib/validation/github-validation.test.js, lib/validation/validation.test.js, tests/integration/error-handling.test.js
- Generated: 2025-08-19T10:46:31.520Z

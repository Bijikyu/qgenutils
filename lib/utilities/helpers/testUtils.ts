/**
 * Test Utilities for Common Testing Patterns
 * 
 * PURPOSE: Provides standardized test helpers to eliminate duplicate test code
 * and ensure consistent testing patterns across the utility modules.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Create reusable test setup and teardown utilities
 * - Standardize assertion patterns for common function types
 * - Provide mock utilities for consistent testing environments
 * - Enable performance testing utilities
 * - Support both unit and integration testing patterns
 */

/**
 * Test configuration options
 */
export interface TestConfig {
  timeout?: number;
  retries?: number;
  verbose?: boolean;
  mockConsole?: boolean;
}

/**
 * Test result interface
 */
export interface TestResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
  input?: any;
  output?: any;
}

/**
 * Performance test result
 */
export interface PerformanceTestResult {
  averageTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  totalTime: number;
  operationsPerSecond: number;
}

/**
 * Creates a test harness for utility functions
 * 
 * @param config - Test configuration options
 * @returns Test harness with standardized methods
 */
export function createTestHarness(config: TestConfig = {}) {
  const { timeout = 5000, retries = 0, verbose = false, mockConsole = false } = config;
  
  return {
    /**
     * Tests a function with input and expected output
     * 
     * @param fn - Function to test
     * @param input - Input to provide to function
     * @param expected - Expected output or validation function
     * @returns Test result with timing and validation
     */
    test: async <T, U>(
      fn: (input: T) => U,
      input: T,
      expected: U | ((result: U) => boolean)
    ): Promise<TestResult<U>> => {
      const startTime = performance.now();
      
      try {
        const result = await Promise.race([
          Promise.resolve(fn(input)),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), timeout)
          )
        ]);
        
        const duration = performance.now() - startTime;
        const success = typeof expected === 'function' 
          ? (expected as (result: U) => boolean)(result)
          : result === expected;
        
        if (verbose) {
          console.log(`Test ${success ? 'PASSED' : 'FAILED'}:`, {
            input,
            output: result,
            expected,
            duration: `${duration.toFixed(2)}ms`
          });
        }
        
        return {
          success,
          data: success ? result : undefined,
          error: success ? undefined : new Error(`Expected ${expected}, got ${result}`),
          duration,
          input,
          output: result
        };
        
      } catch (error) {
        const duration = performance.now() - startTime;
        
        if (verbose) {
          console.log(`Test FAILED:`, {
            input,
            error: error instanceof Error ? error.message : String(error),
            duration: `${duration.toFixed(2)}ms`
          });
        }
        
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          duration,
          input
        };
      }
    },

    /**
     * Tests multiple inputs against a function
     * 
     * @param fn - Function to test
     * @param testCases - Array of test cases with input and expected output
     * @returns Array of test results
     */
    batchTest: async <T, U>(
      fn: (input: T) => U,
      testCases: Array<{ input: T; expected: U | ((result: U) => boolean); description?: string }>
    ): Promise<TestResult<U>[]> => {
      const results: TestResult<U>[] = [];
      const testFn = createTestHarness(config).test;
      
      for (const testCase of testCases) {
        const result = await testFn(fn, testCase.input, testCase.expected);
        results.push(result);
        
        if (!result.success && verbose && testCase.description) {
          console.log(`Failed case: ${testCase.description}`);
        }
      }
      
      return results;
    },

    /**
     * Performance test for utility functions
     * 
     * @param fn - Function to benchmark
     * @param input - Input for the function
     * @param iterations - Number of iterations to run
     * @returns Performance metrics
     */
    performanceTest: async <T, U>(
      fn: (input: T) => U,
      input: T,
      iterations = 1000
    ): Promise<PerformanceTestResult> => {
      const times: number[] = [];
      
      // Warm up
      for (let i = 0; i < 10; i++) {
        fn(input);
      }
      
      // Actual test
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        fn(input);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const averageTime = totalTime / iterations;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const operationsPerSecond = 1000 / averageTime;
      
      return {
        averageTime,
        minTime,
        maxTime,
        iterations,
        totalTime,
        operationsPerSecond
      };
    }
  };
}

/**
 * Creates validation test utilities
 * 
 * @returns Validation test helper functions
 */
export function createValidationTester() {
  return {
    /**
     * Tests validation function with various inputs
     * 
     * @param validateFn - Validation function to test
     * @param validInputs - Array of inputs that should pass validation
     * @param invalidInputs - Array of inputs that should fail validation
     * @returns Test results summary
     */
    testValidation: <T>(
      validateFn: (input: T, fieldName?: string) => string | null,
      validInputs: T[],
      invalidInputs: T[]
    ) => {
      const results = {
        valid: { passed: 0, failed: 0 },
        invalid: { passed: 0, failed: 0 },
        details: [] as Array<{
          input: T;
          expected: boolean;
          actual: boolean;
          result: string | null;
        }>
      };
      
      // Test valid inputs
      for (const input of validInputs) {
        const result = validateFn(input, 'testField');
        const isValid = result === null;
        
        if (isValid) {
          results.valid.passed++;
        } else {
          results.valid.failed++;
        }
        
        results.details.push({
          input,
          expected: true,
          actual: isValid,
          result
        });
      }
      
      // Test invalid inputs
      for (const input of invalidInputs) {
        const result = validateFn(input, 'testField');
        const isInvalid = result !== null;
        
        if (isInvalid) {
          results.invalid.passed++;
        } else {
          results.invalid.failed++;
        }
        
        results.details.push({
          input,
          expected: false,
          actual: isInvalid,
          result
        });
      }
      
      return results;
    },

    /**
     * Tests error message formatting
     * 
     * @param validateFn - Validation function to test
     * @param testCases - Test cases with input and expected error message
     * @returns Test results for error messages
     */
    testErrorMessages: <T>(
      validateFn: (input: T, fieldName?: string) => string | null,
      testCases: Array<{
        input: T;
        fieldName: string;
        expectedMessage?: string;
        shouldContain?: string;
      }>
    ) => {
      const results = testCases.map(testCase => {
        const result = validateFn(testCase.input, testCase.fieldName);
        const passed = testCase.expectedMessage 
          ? result === testCase.expectedMessage
          : testCase.shouldContain
          ? result?.includes(testCase.shouldContain) ?? false
          : result !== null;
        
        return {
          input: testCase.input,
          fieldName: testCase.fieldName,
          result,
          expectedMessage: testCase.expectedMessage,
          shouldContain: testCase.shouldContain,
          passed
        };
      });
      
      return {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        details: results
      };
    }
  };
}

/**
 * Creates mock utilities for testing
 * 
 * @returns Mock utility functions
 */
export function createMockUtils() {
  return {
    /**
     * Creates a mock logger for testing
     * 
     * @returns Mock logger with captured calls
     */
    mockLogger: () => {
      const calls: Array<{
        level: string;
        message: string;
        context?: any;
      }> = [];
      
      return {
        debug: (message: string, context?: any) => 
          calls.push({ level: 'debug', message, context }),
        info: (message: string, context?: any) => 
          calls.push({ level: 'info', message, context }),
        warn: (message: string, context?: any) => 
          calls.push({ level: 'warn', message, context }),
        error: (message: string, context?: any) => 
          calls.push({ level: 'error', message, context }),
        getCalls: () => calls,
        getLevelCalls: (level: string) => calls.filter(c => c.level === level),
        reset: () => calls.length = 0
      };
    },

    /**
     * Creates a mock performance API for testing
     * 
     * @returns Mock performance API
     */
    mockPerformance: () => {
      let currentTime = 0;
      
      return {
        now: () => currentTime,
        advance: (ms: number) => currentTime += ms,
        reset: () => currentTime = 0
      };
    }
  };
}

/**
 * Standard test cases for common validation scenarios
 */
export const standardTestCases = {
  string: {
    valid: ['hello', 'world', 'test-string', '123', 'true', ''],
    invalid: [null, undefined, {}, [], 123, true, false]
  },
  
  number: {
    valid: [0, 1, -1, 123.456, -456.789],
    invalid: [null, undefined, {}, [], '123', 'abc', true, false, NaN, Infinity]
  },
  
  boolean: {
    valid: [true, false],
    invalid: [null, undefined, {}, [], 1, 0, 'true', 'false']
  },
  
  array: {
    valid: [[], [1, 2, 3], ['a', 'b', 'c'], [null, undefined]],
    invalid: [null, undefined, {}, 'array', 123, true, false]
  },
  
  object: {
    valid: [{}, { key: 'value' }, { nested: { prop: 1 } }],
    invalid: [null, undefined, [], 'object', 123, true, false]
  }
};
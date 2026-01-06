/**
 * SHARED TEST HELPERS
 * 
 * PURPOSE: Provides common test setup patterns and mock creation utilities.
 * This utility eliminates duplication in test infrastructure across the codebase.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized test mock creation
 * - Consistent test setup/teardown patterns
 * - Performance testing helpers
 * - Jest-compatible utilities
 * - Reusable test scenarios
 */

import { jest } from '@jest/globals';

/**
 * Mock request object with default values and overrides.
 */
export const createMockRequest = (overrides = {}) => ({
  method: 'GET',
  url: '/',
  headers: {},
  query: {},
  params: {},
  body: {},
  ip: '127.0.0.1',
  user: null,
  id: 'test-request-id',
  ...overrides
});

/**
 * Mock response object with jest methods.
 */
export const createMockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    locals: {},
    _headers: {},
    _status: null,
    _data: null
  };

  // Add method chaining
  res.status.mockImplementation((code: any) => {
    res._status = code;
    return res;
  });

  res.json.mockImplementation((data: any) => {
    res._data = data;
    return res;
  });

  return res;
};

/**
 * Mock next function for middleware testing.
 */
export const createMockNext = () => jest.fn();

/**
 * Test environment setup for timer-based tests.
 */
export const setupTimerTests = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });
};

/**
 * Test environment setup for cleanup-based tests.
 */
export const setupCleanupTests = (cleanupFn: () => void) => {
  let cleanupMonitor: { cleanup: () => void } | null = null;

  beforeEach(() => {
    cleanupMonitor = { cleanup: cleanupFn };
  });

  afterEach(() => {
    if (cleanupMonitor?.cleanup) {
      cleanupMonitor.cleanup();
    }
  });
};

/**
 * Performance test helper with metrics collection.
 */
export const createPerformanceTest = (testFn: () => Promise<any>, options: { iterations?: number; warmup?: boolean } = {}) => {
  const { iterations = 100, warmup = true } = options;
  
  return async () => {
    // Warmup
    if (warmup) {
      for (let i = 0; i < Math.min(10, iterations / 10); i++) {
        await testFn();
      }
    }

    // Main test
    const startTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      await testFn();
    }
    const endTime = Date.now();

    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    const opsPerSecond = 1000 / avgTime;

    return {
      totalTime,
      avgTime,
      opsPerSecond,
      iterations
    };
  };
};

/**
 * Async test helper with timeout.
 */
export const withTimeout = (promise, timeoutMs = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Test timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

/**
 * Batch test runner for multiple test cases.
 */
export const runBatchTests = (testCases, testFn) => {
  testCases.forEach((testCase, index) => {
    const testName = typeof testCase === 'string' 
      ? testCase 
      : testCase.name || `Test case ${index + 1}`;
    
    test(testName, async () => {
      const testCaseData = typeof testCase === 'string' ? testCase : testCase;
      await testFn(testCaseData, index);
    });
  });
};

/**
 * Error assertion helper.
 */
export const expectError = async (fn, expectedMessage) => {
  try {
    await fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage);
    }
  }
};

/**
 * Spy creation with method tracking.
 */
export const createSpy = (obj: any, method: string) => {
  const originalMethod = obj[method];
  const calls: { args: unknown[]; timestamp: number }[] = [];
  
  const spy = jest.fn((...args) => {
    calls.push({
      args,
      timestamp: Date.now()
    });
    return originalMethod.apply(obj, args);
  }) as any;
  
  obj[method] = spy;
  spy.calls = calls;
  spy.restore = () => {
    obj[method] = originalMethod;
  };
  
  return spy;
};

// Export all test helpers
export const TestHelpers = {
  createMockRequest,
  createMockResponse,
  createMockNext,
  setupTimerTests,
  setupCleanupTests,
  createPerformanceTest,
  withTimeout,
  runBatchTests,
  expectError,
  createSpy
};

export default TestHelpers;
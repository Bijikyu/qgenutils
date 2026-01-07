/**
 * Common Testing Utilities
 * 
 * Centralized testing utilities to eliminate code duplication across
 * test suites. These utilities handle common testing patterns including
 * mocking Express req/res, Jest helpers, and test environment setup.
 */

import type { Request, Response } from 'express';

/**
 * Mock Express Request object
 */
export interface MockRequest {
  method?: string;
  url?: string;
  path?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  ip?: string;
}

/**
 * Mock Express Response object
 */
export interface MockResponse {
  statusCode?: number;
  headers?: Record<string, string>;
  data?: any;
  status?: jest.Mock<number, [number?]>;
  json?: jest.Mock<void, [any?]>;
  setHeader?: jest.Mock<void, [string, string]>;
}

/**
 * Mock Logger interface
 */
export interface MockLogger {
  log: jest.Mock<any, any>;
  info: jest.Mock<any, any>;
  warn: jest.Mock<any, any>;
  error: jest.Mock<any, any>;
}

/**
 * Creates a mock Express Request object
 * @param overrides - Request property overrides
 * @returns Mock request object
 */
export function createMockRequest(overrides: Partial<MockRequest> = {}): MockRequest {
  return {
    method: 'GET',
    url: '/',
    path: '/',
    query: {},
    params: {},
    body: {},
    headers: {
      'content-type': 'application/json',
      'user-agent': 'test-agent'
    },
    ip: '127.0.0.1',
    ...overrides
  };
}

/**
 * Creates a mock Express Response object
 * @param overrides - Response property overrides
 * @returns Mock response object
 */
export function createMockResponse(overrides: Partial<MockResponse> = {}): MockResponse {
  const mockResponse = {
    statusCode: 200,
    headers: {},
    data: null,
    ...overrides
  };

  // Add Express-like methods
  (mockResponse as any).status = jest.fn(function(this: any, code: number) {
    this.statusCode = code;
    return this;
  });
  
  (mockResponse as any).json = jest.fn(function(this: any, data: any) {
    this.data = data;
    this.headers = this.headers || {};
    this.headers['content-type'] = 'application/json';
    return this;
  });

  (mockResponse as any).setHeader = jest.fn(function(this: any, name: string, value: string) {
    this.headers = this.headers || {};
    this.headers[name] = value;
    return this;
  });

  (mockResponse as any).getHeader = jest.fn(function(this: any, name: string) {
    const headers = this.headers || {};
    return headers[name];
  });

  return mockResponse;
}

/**
 * Creates mock middleware test harness
 * @param middleware - Middleware function to test
 * @returns Test harness with setup and assertion helpers
 */
export function createMiddlewareTestHarness(
  middleware: (req: any, res: any, next: any) => void,
  reqOverrides: Partial<MockRequest> = {},
  resOverrides: Partial<MockResponse> = {}
) {
  const mockReq = createMockRequest(reqOverrides);
  const mockRes = createMockResponse(resOverrides);
  const mockNext = jest.fn();

  const callMiddleware = () => {
    middleware(mockReq, mockRes, mockNext);
  };

  const expectNextCalled = () => {
    expect(mockNext).toHaveBeenCalled();
  };

  const expectNextNotCalled = () => {
    expect(mockNext).not.toHaveBeenCalled();
  };

  const expectNextCalledWith = (...args: any[]) => {
    expect(mockNext).toHaveBeenCalledWith(...args);
  };

  const expectStatus = (statusCode: number) => {
    expect(mockRes.status).toHaveBeenCalledWith(statusCode);
  };

  const expectJsonCalled = (data?: any) => {
    if (data !== undefined) {
      expect(mockRes.json).toHaveBeenCalledWith(data);
    } else {
      expect(mockRes.json).toHaveBeenCalled();
    }
  };

  const expectHeader = (name: string, value: string) => {
    expect(mockRes.setHeader).toHaveBeenCalledWith(name, value);
  };

  return {
    req: mockReq,
    res: mockRes,
    next: mockNext,
    call: callMiddleware,
    expect: {
      nextCalled: expectNextCalled,
      nextNotCalled: expectNextNotCalled,
      nextCalledWith: expectNextCalledWith,
      status: expectStatus,
      jsonCalled: expectJsonCalled,
      header: expectHeader
    }
  };
}

/**
 * Creates a mock logger for testing
 * @param options - Logger configuration options
 * @returns Mock logger object
 */
export function createMockLogger(options: {
  methods?: Array<'log' | 'info' | 'warn' | 'error'>;
} = {}): MockLogger {
  const { methods = ['log', 'info', 'warn', 'error'] } = options;

  const logger: MockLogger = {} as MockLogger;
  
  methods.forEach(method => {
    logger[method] = jest.fn();
  });

  return logger;
}

/**
 * Mock factory utilities
 */
export const MockFactory = {
  /**
   * Creates a mock that resolves with a value
   */
  resolve: <T = any>(value: T) => 
    jest.fn().mockResolvedValue(value),

  /**
   * Creates a mock that rejects with an error
   */
  reject: (error: Error) => 
    jest.fn().mockRejectedValue(error),

  /**
   * Creates a mock with sequential return values
   */
  sequence: <T = any>(...values: T[]) => {
    const mock = jest.fn();
    values.forEach((value, index) => {
      if (index === values.length - 1) {
        mock.mockReturnValue(value);
      } else {
        mock.mockReturnValueOnce(value);
      }
    });
    return mock;
  },

  /**
   * Creates a mock with conditional return values
   */
  conditional: (condition: () => boolean, trueValue: any, falseValue: any) => {
    const mock = jest.fn();
    mock.mockImplementation(() => condition() ? trueValue : falseValue);
    return mock;
  }
};

/**
 * Test environment utilities
 */
export const TestEnvironment = {
  /**
   * Sets up fake timers for testing
   */
  setupFakeTimers: () => {
    jest.useFakeTimers();
  },

  /**
   * Restores real timers
   */
  restoreRealTimers: () => {
    jest.useRealTimers();
  },

  /**
   * Advances fake timers
   */
  advanceTimers: (ms: number) => {
    jest.advanceTimersByTime(ms);
  },

  /**
   * Runs all pending timers
   */
  runAllTimers: () => {
    jest.runAllTimers();
  },

  /**
   * Clears all mocks
   */
  clearAllMocks: () => {
    jest.clearAllMocks();
  },

  /**
   * Resets all mocks
   */
  resetAllMocks: () => {
    jest.resetAllMocks();
  },

  /**
   * Restores all mocks
   */
  restoreAllMocks: () => {
    jest.restoreAllMocks();
  }
};

/**
 * Timer testing utilities
 */
export const TimerUtils = {
  /**
   * Creates a timer mock
   */
  createTimer: () => {
    let startTime = 0;
    
    return {
      start: () => {
        startTime = Date.now();
      },
      stop: () => {
        return Date.now() - startTime;
      },
      getElapsed: () => startTime > 0 ? Date.now() - startTime : 0
    };
  },

  /**
   * Creates a promise that resolves after delay
   */
  delay: (ms: number, value?: any) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(value), ms);
    });
  }
};

/**
 * Async testing utilities
 */
export const AsyncUtils = {
  /**
   * Waits for a condition to become true
   */
  waitFor: (condition: () => boolean, timeout = 5000) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCondition = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition not met within timeout'));
        } else {
          setTimeout(checkCondition, 10);
        }
      };
      
      checkCondition();
    });
  },

  /**
   * Creates an async test wrapper
   */
  testAsync: (asyncFn: () => Promise<any>, expectedError?: string) => {
    if (expectedError) {
      return expect(asyncFn()).rejects.toThrow(expectedError);
    } else {
      return expect(asyncFn()).resolves.toBeDefined();
    }
  }
};

/**
 * Error simulation utilities
 */
export const ErrorSimulation = {
  /**
   * Creates a function that throws a specific error
   */
  createThrowingFn: (error: Error) => () => {
    throw error;
  },

  /**
   * Creates a function that throws on condition
   */
  createConditionalThrowingFn: (condition: (input: any) => boolean, error: Error) => (input: any) => {
    if (condition(input)) {
      throw error;
    }
    return input;
  },

  /**
   * Creates an async function that rejects
   */
  createRejectingFn: (error: Error) => async () => {
    throw error;
  }
};

/**
 * Performance testing utilities
 */
export const PerformanceUtils = {
  /**
   * Measures execution time of a function
   */
  measureTime: <T = any>(fn: () => T) => {
    const start = Date.now();
    const result = fn();
    const time = Date.now() - start;
    return { result, time };
  },

  /**
   * Asserts execution time is within bounds
   */
  expectTimeWithin: (fn: () => void, minMs: number, maxMs: number) => {
    const { time } = PerformanceUtils.measureTime(fn);
    expect(time).toBeGreaterThanOrEqual(minMs);
    expect(time).toBeLessThanOrEqual(maxMs);
  }
};

/**
 * Data creation utilities for testing
 */
export const TestDataFactory = {
  /**
   * Creates a user object for testing
   */
  user: (overrides: any = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Creates an API response for testing
   */
  apiResponse: <T = any>(data: T, overrides: any = {}) => ({
    success: true,
    data,
    message: 'Success',
    timestamp: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Creates an error response for testing
   */
  errorResponse: (message: string, type = 'ERROR', overrides: any = {}) => ({
    success: false,
    error: { type, message },
    timestamp: new Date().toISOString(),
    ...overrides
  })
};

/**
 * Assertion helpers
 */
export const Assertions = {
  /**
   * Asserts object has required properties
   */
  hasProperties: (obj: any, properties: string[]) => {
    properties.forEach(prop => {
      expect(obj).toHaveProperty(prop);
    });
  },

  /**
   * Asserts array contains items with properties
   */
  containsItemsWithProperties: <T = any>(array: T[], properties: string[], propertyValues?: Record<string, any>) => {
    array.forEach(item => {
      expect(item).toBeDefined();
      properties.forEach(prop => {
        expect(item).toHaveProperty(prop);
        if (propertyValues && propertyValues[prop] !== undefined) {
          expect(item[prop]).toEqual(propertyValues[prop]);
        }
      });
    });
  },

  /**
   * Asserts response has expected structure
   */
  responseStructure: (response: any, expectedData?: any, expectedStatus?: number) => {
    expect(response).toBeDefined();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    
    if (expectedData !== undefined) {
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual(expectedData);
    }
    
    if (expectedStatus !== undefined) {
      expect(response).toHaveProperty('status');
      expect(response.status).toBe(expectedStatus);
    }
  }
};
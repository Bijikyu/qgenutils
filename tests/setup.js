
// Test setup and global configuration
const { jest } = require('@jest/globals');

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock qerrors to prevent actual error logging during tests
jest.mock('qerrors', () => ({
  qerrors: jest.fn()
}));

// Global test helpers
global.createMockRequest = (overrides = {}) => ({
  headers: {},
  body: {},
  query: {},
  params: {},
  user: null,
  isAuthenticated: jest.fn().mockReturnValue(false),
  ...overrides
});

global.createMockResponse = (overrides = {}) => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  render: jest.fn(),
  redirect: jest.fn(),
  ...overrides
});

// Set up global test timeout
jest.setTimeout(10000);

// Clean up global state after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset console mocks
  global.console.log.mockClear();
  global.console.error.mockClear();
  global.console.warn.mockClear();
});

// Set up test environment
beforeAll(() => {
  // Ensure clean state for global variables
  if (typeof global.passport !== 'undefined') {
    delete global.passport;
  }
  if (typeof global.app !== 'undefined') {
    delete global.app;
  }
});

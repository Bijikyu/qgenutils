// Global test setup for Jest. The utilities defined here mock console and
// qerrors so unit tests remain clean and deterministic while exercising the
// library code.

// Mock console methods to prevent test output pollution
global.console = {
  ...console,
  // Keep error and warn for debugging failed tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Mock qerrors to prevent actual error logging during tests
jest.mock('qerrors', () => ({
  qerrors: jest.fn((error, context, data) => {
    // Log the mock call for debugging if needed
    // console.error(`Mock qerrors called: ${error.message || error}`);
  })
}));

// Set up global test environment
global.mockConsole = global.console;

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

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
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
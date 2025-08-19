// Test setup file to handle qerrors dependency issues during testing
// This file provides fallbacks for problematic dependencies

// Mock qerrors if it causes Winston transport issues
jest.mock('qerrors', () => ({
  qerrors: jest.fn(() => {}),
  default: jest.fn(() => {})
}));

// Mock winston transports if needed
jest.mock('winston', () => ({
  transports: {
    File: class MockFile {},
    Console: class MockConsole {}
  },
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn()
  },
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

// Set test timeout
jest.setTimeout(10000);
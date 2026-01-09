// Test setup file to handle qerrors dependency issues during testing
// This file provides fallbacks for problematic dependencies

// Mock qerrors if it causes Winston transport issues
jest.mock('qerrors', () => ({
  qerrors: jest.fn(() => {}),
  default: jest.fn(() => {})
}));

// Mock winston transports and format issues
jest.mock('winston', () => ({
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
    DailyRotateFile: jest.fn()
  },
  format: {
    combine: jest.fn(() => ({})),
    timestamp: jest.fn(() => ({})),
    errors: jest.fn(() => ({})),
    json: jest.fn(() => ({})),
    printf: jest.fn(() => ({})),
    splat: jest.fn(() => ({})),
    simple: jest.fn(() => ({})),
    colorize: jest.fn(() => ({}))
  },
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
  }))
}));

// Mock winston-daily-rotate-file
jest.mock('winston-daily-rotate-file', () => jest.fn());

// Set test timeout
jest.setTimeout(10000);

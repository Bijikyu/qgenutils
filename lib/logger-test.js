/**
 * Test-friendly logger that avoids Winston transport issues
 * Used during testing to prevent qerrors dependency problems
 */

const testLogger = {
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'test') {
      // Silent during tests unless DEBUG=true
      if (process.env.DEBUG) {
        console.log('INFO:', message, meta);
      }
    }
  },
  error: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'test') {
      if (process.env.DEBUG) {
        console.error('ERROR:', message, meta);
      }
    }
  },
  warn: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'test') {
      if (process.env.DEBUG) {
        console.warn('WARN:', message, meta);
      }
    }
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'test') {
      if (process.env.DEBUG) {
        console.log('DEBUG:', message, meta);
      }
    }
  }
};

module.exports = testLogger;
require('qtests/setup'); // use stubs for winston
const qtests = require('qtests'); // stubbing utility
const fs = require('fs'); // fs for directory check
const winston = require('winston'); // stubbed winston
const DailyRotateFile = require('winston-daily-rotate-file'); // rotate transport

// Helper reloads the logger module so each test starts with a fresh instance.
function reload() {
  delete require.cache[require.resolve('./logger')]; // remove previous module from cache
  return require('./logger'); // load new instance to capture config
}

describe('Logger Utility', () => { // ensures log rotation stays configured
  test('verifies should configure DailyRotateFile transport', () => {
    let captured; // store config
    const restore = qtests.stubMethod(winston, 'createLogger', cfg => { captured = cfg; return { transports: cfg.transports, debug(){}, info(){}, error(){} }; });
    reload();
    restore();
    const hasRotate = captured.transports.some(t => t instanceof DailyRotateFile);
    expect(hasRotate).toBe(true);
  });

});

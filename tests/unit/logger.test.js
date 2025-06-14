require('qtests/setup'); // use stubs for winston
const qtests = require('qtests'); // stubbing utility
const fs = require('fs'); // fs for directory check
const winston = require('winston'); // stubbed winston
const DailyRotateFile = require('winston-daily-rotate-file'); // rotate transport

function reload() {
  delete require.cache[require.resolve('../../lib/logger')];
  return require('../../lib/logger');
}

describe('Logger Utility', () => {
  test('verifies should configure DailyRotateFile transport', () => {
    let captured; // store config
    const restore = qtests.stubMethod(winston, 'createLogger', cfg => { captured = cfg; return { transports: cfg.transports, debug(){}, info(){}, error(){} }; });
    reload();
    restore();
    const hasRotate = captured.transports.some(t => t instanceof DailyRotateFile);
    expect(hasRotate).toBe(true);
  });

});

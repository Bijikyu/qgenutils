const { logFunctionStart, logFunctionResult, logFunctionError } = require('../../lib/logging-utils');
const { qerrors } = require('qerrors');

describe('Logging Utilities', () => {
  describe('logFunctionStart', () => {
    test('should log string input', () => {
      logFunctionStart('testStart', 'value');
      expect(mockConsole.log).toHaveBeenCalledWith('testStart is running with value');
    });

    test('should log null input', () => {
      logFunctionStart('testStart', null);
      expect(mockConsole.log).toHaveBeenCalledWith('testStart is running with null');
    });

    test('should log object input', () => {
      const obj = { a: 1 };
      logFunctionStart('testStart', obj);
      expect(mockConsole.log).toHaveBeenCalledWith(`testStart is running with ${JSON.stringify(obj)}`);
    });
  });

  describe('logFunctionResult', () => {
    test('should log undefined result', () => {
      logFunctionResult('testResult', undefined);
      expect(mockConsole.log).toHaveBeenCalledWith('testResult is returning undefined');
    });

    test('should log object result', () => {
      const obj = { b: 2 };
      logFunctionResult('testResult', obj);
      expect(mockConsole.log).toHaveBeenCalledWith(`testResult is returning ${JSON.stringify(obj)}`);
    });
  });

  describe('logFunctionError', () => {
    test('should log error and return false by default', () => {
      const err = new Error('fail');
      const result = logFunctionError(err, 'testError', { ctx: true });
      expect(qerrors).toHaveBeenCalledWith(err, 'testError', { ctx: true });
      expect(mockConsole.log).toHaveBeenCalledWith('testError has run resulting in a final value of failure');
      expect(result).toBe(false);
    });

    test('should support custom default return', () => {
      const err = new Error('oops');
      const result = logFunctionError(err, 'testError', {}, 'fallback');
      expect(result).toBe('fallback');
    });
  });
});

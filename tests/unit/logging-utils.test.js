/*
 * Unit tests targeting the logging helper functions. These tests verify that
 * logFunctionStart, logFunctionResult, and logFunctionError handle typical and
 * edge case values without unexpected crashes. By exercising circular objects
 * and undefined results we ensure qerrors is called and console output remains
 * consistent when developers log complex data.
 */
const { logFunctionStart, logFunctionResult, logFunctionError } = require('../../lib/logging-utils');
const { qerrors } = require('qerrors');

describe('Logging Utilities', () => {
  describe('logFunctionStart', () => {
    test('should log string input', () => {
      logFunctionStart('testStart', 'value');
      expect(mockConsole.log).toHaveBeenCalledWith('testStart is running with value'); // string parameter logged as expected
    });

    test('should log null input', () => {
      logFunctionStart('testStart', null);
      expect(mockConsole.log).toHaveBeenCalledWith('testStart is running with null'); // null parameter logged explicitly
    });

    test('should log object input', () => {
      const obj = { a: 1 };
      logFunctionStart('testStart', obj);
      expect(mockConsole.log).toHaveBeenCalledWith(`testStart is running with ${JSON.stringify(obj)}`); // object converted to JSON
    });

    test('should handle circular reference input', () => {
      const circ = {}; circ.self = circ; // create circular object for test
      logFunctionStart('testStart', circ); // call with circular object
      expect(mockConsole.log).toHaveBeenCalledWith('testStart is running with [unserializable]'); // fallback message for circular objects
      expect(qerrors).toHaveBeenCalledWith(expect.any(Error), 'logFunctionStart', { input: circ }); // logged via qerrors
    });
  });

  describe('logFunctionResult', () => {
    test('should log undefined result', () => {
      logFunctionResult('testResult', undefined);
      expect(mockConsole.log).toHaveBeenCalledWith('testResult is returning undefined'); // explicit undefined logged
    });

    test('should log object result', () => {
      const obj = { b: 2 };
      logFunctionResult('testResult', obj);
      expect(mockConsole.log).toHaveBeenCalledWith(`testResult is returning ${JSON.stringify(obj)}`); // object serialized correctly
    });

    test('should handle circular reference result', () => {
      const circ = {}; circ.self = circ; // create circular object result
      logFunctionResult('testResult', circ); // call with circular object
      expect(mockConsole.log).toHaveBeenCalledWith('testResult is returning [unserializable]'); // fallback for circular
      expect(qerrors).toHaveBeenCalledWith(expect.any(Error), 'logFunctionResult', { result: circ }); // error logged
    });
  });

  describe('logFunctionError', () => {
    test('should log error and return false by default', () => {
      const err = new Error('fail');
      const result = logFunctionError(err, 'testError', { ctx: true });
      expect(qerrors).toHaveBeenCalledWith(err, 'testError', { ctx: true }); // qerrors logs context
      expect(mockConsole.log).toHaveBeenCalledWith('testError has run resulting in a final value of failure'); // console output matches pattern
      expect(result).toBe(false); // default return value is false
    });

    test('should support custom default return', () => {
      const err = new Error('oops');
      const result = logFunctionError(err, 'testError', {}, 'fallback');
      expect(result).toBe('fallback'); // custom default value returned
    });
  });
});

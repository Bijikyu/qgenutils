/*
 * Additional edge case tests for lower-level utilities. These scenarios cover
 * unusual or malformed inputs that might appear in real usage. The goal is to
 * confirm each utility remains resilient and logs errors through qerrors rather
 * than throwing, ensuring the rest of the application can continue running.
 */
const httpUtils = require('../../lib/http');
const urlUtils = require('../../lib/url');
const { qerrors } = require('qerrors');

describe('Additional Edge Cases', () => {
  describe('calculateContentLength', () => {
    test('should return 0 for boolean body', () => {
      expect(httpUtils.calculateContentLength(true)).toBe('0'); // boolean coerces to empty payload length
    });
  });

  describe('buildCleanHeaders', () => {
    test('should return empty object when headers not object', () => {
      const result = httpUtils.buildCleanHeaders('bad', 'GET', null);
      expect(result).toEqual({}); // invalid headers should yield empty object
    });

    test('should return original headers on error', () => {
      const circular = {};
      circular.self = circular; // create JSON.stringify failure case
      const headers = { 'content-type': 'application/json' };
      const result = httpUtils.buildCleanHeaders(headers, 'POST', circular);
      expect(qerrors).toHaveBeenCalled(); // ensure error logged for circular reference
      expect(result).toBe(headers); // original headers returned when error occurs
    });
  });

  describe('stripProtocol', () => {
    test('should return input when not string and log error', () => {
      const result = urlUtils.stripProtocol(null);
      expect(qerrors).toHaveBeenCalled(); // confirm error logged for bad input
      expect(result).toBeNull(); // invalid input returns null
    });
  });

  describe('parseUrlParts', () => {
    test('should return null for malformed url with protocol only', () => {
      const result = urlUtils.parseUrlParts('http://');
      expect(qerrors).toHaveBeenCalled(); // invalid url should trigger logging
      expect(result).toBeNull(); // result should be null on failure
    });
  });
});

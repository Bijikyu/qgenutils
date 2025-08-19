/*
 * Additional edge case tests for lower-level utilities. These scenarios cover
 * unusual or malformed inputs that might appear in real usage. The goal is to
 * confirm each utility remains resilient and logs errors through qerrors rather
 * than throwing, ensuring the rest of the application can continue running.
 */

const ensureProtocol = require('./utilities/url/ensureProtocol');
const normalizeUrlOrigin = require('./utilities/url/normalizeUrlOrigin');
const stripProtocol = require('./utilities/url/stripProtocol');
const parseUrlParts = require('./utilities/url/parseUrlParts');
// Import qerrors for mocking in tests
const qerrors = require('qerrors');

describe('Additional Edge Cases', () => { // ensures resilience for uncommon inputs


  describe('stripProtocol', () => { // confirms protocol removal handles errors
    test('should return input when not string and log error', () => {
      const mockQerrors = jest.spyOn(qerrors, 'qerrors').mockImplementation(() => {});
      const result = stripProtocol(null);
      expect(mockQerrors).toHaveBeenCalled(); // confirm error logged for bad input
      expect(result).toBeNull(); // invalid input returns null
      mockQerrors.mockRestore();
    });
  });

  describe('parseUrlParts', () => { // verifies parsing fails safely on bad URLs
    test('should return null for malformed url with protocol only', () => {
      const mockQerrors = jest.spyOn(qerrors, 'qerrors').mockImplementation(() => {});
      const result = parseUrlParts('http://');
      expect(mockQerrors).toHaveBeenCalled(); // invalid url should trigger logging
      expect(result).toBeNull(); // result should be null on failure
      mockQerrors.mockRestore();
    });
  });
});

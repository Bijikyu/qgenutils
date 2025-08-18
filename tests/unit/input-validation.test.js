// Unit tests ensuring core input validation helpers return accurate boolean
// results for a variety of argument types. These tests guard against regressions
// in basic sanity checks used throughout the library.
const isValidObject = require('../../lib/validation/input/isValidObject');
const isValidString = require('../../lib/validation/input/isValidString');
const hasMethod = require('../../lib/validation/input/hasMethod');


describe('Input Validation Utilities', () => { // ensures sanity checks remain strict
  describe('isValidObject', () => { // verifies plain objects are recognized
    test('should return true for plain object', () => {
      expect(isValidObject({ a: 1 })).toBe(true); //verify true for normal object
    });

    test('should return false for array', () => {
      expect(isValidObject([])).toBe(false); //verify array is invalid object
    });

    test('should return false for null', () => {
      expect(isValidObject(null)).toBe(false); //verify null is invalid object
    });

    test('should return false for string', () => {
      expect(isValidObject('str')).toBe(false); //verify string is invalid object
    });

    test('should return false for undefined', () => {
      expect(isValidObject(undefined)).toBe(false); //verify undefined is invalid object
    });
  });

  describe('isValidString', () => { // prevents empty or non-string values
    test('should return true for typical string', () => {
      expect(isValidString('hello')).toBe(true); //verify typical string works
    });

    test('should return false for empty string', () => {
      expect(isValidString('')).toBe(false); //verify empty string rejected
    });

    test('should return false for whitespace string', () => {
      expect(isValidString('   ')).toBe(false); //verify spaces only rejected
    });

    test('should return false for null', () => {
      expect(isValidString(null)).toBe(false); //verify null rejected
    });

    test('should return false for object', () => {
      expect(isValidString({})).toBe(false); //verify object rejected
    });
  });

  describe('hasMethod', () => { // confirms method detection reliability
    test('should return true when method exists', () => {
      const obj = { run: () => {} };
      expect(hasMethod(obj, 'run')).toBe(true); //verify detection of method
    });

    test('should return false when method missing', () => {
      const obj = {};
      expect(hasMethod(obj, 'fly')).toBe(false); //verify missing method returns false
    });

    test('should return false when property is not function', () => {
      const obj = { val: 1 };
      expect(hasMethod(obj, 'val')).toBe(false); //verify non-function property rejected
    });

    test('should handle getter throwing error', () => {
      const obj = Object.create(null, {
        bad: { get: () => { throw new Error('fail'); } }
      });
      expect(hasMethod(obj, 'bad')).toBe(false); //verify error handled gracefully
    });
  });


});

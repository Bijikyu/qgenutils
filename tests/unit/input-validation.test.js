const { isValidObject, isValidString, hasMethod, isValidExpressResponse } = require('../../lib/input-validation');

describe('Input Validation Utilities', () => {
  describe('isValidObject', () => {
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

  describe('isValidString', () => {
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

  describe('hasMethod', () => {
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

  describe('isValidExpressResponse', () => {
    test('should return true for object with status and json', () => {
      const res = { status: function(){ return this; }, json: function(){ return this; } };
      expect(isValidExpressResponse(res)).toBe(true); //verify proper response accepted
    });

    test('should return false when json missing', () => {
      const res = { status: function(){ return this; } };
      expect(isValidExpressResponse(res)).toBe(false); //verify missing method rejected
    });

    test('should return null for null input', () => {
      expect(isValidExpressResponse(null)).toBeNull(); //verify null result
    });

    test('should return false when methods not functions', () => {
      const res = { status: 'ok', json: {} };
      expect(isValidExpressResponse(res)).toBe(false); //verify properties must be functions
    });
  });
});

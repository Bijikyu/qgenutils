
const { requireFields } = require('../../lib/validation');

describe('Validation Utilities', () => {
  describe('requireFields', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    // verifies should return true when all required fields are present
    test('should return true when all required fields are present', () => {
      const obj = { name: 'John', email: 'john@example.com', age: 30 }; // valid object
      const result = requireFields(mockRes, obj, ['name', 'email', 'age']); // check all present
      
      expect(result).toBe(true); // validation passes
      expect(mockRes.status).not.toHaveBeenCalled(); // no error responses
    });

    // verifies should return false and send error for missing fields
    test('should return false and send error for missing fields', () => {
      const obj = { name: 'John', age: 30 }; // missing email
      const result = requireFields(mockRes, obj, ['name', 'email', 'age']); // run validator
      
      expect(result).toBe(false); // should fail
      expect(mockRes.status).toHaveBeenCalledWith(400); // 400 returned
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: email'
      });
    });

    // verifies should return false for multiple missing fields
    test('should return false for multiple missing fields', () => {
      const obj = { name: 'John' }; // only one field present
      const result = requireFields(mockRes, obj, ['name', 'email', 'age']);
      
      expect(result).toBe(false); // validation fails
      expect(mockRes.status).toHaveBeenCalledWith(400); // error status
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: email, age'
      }); // details returned
    });

    // verifies should treat falsy values as missing
    test('should treat falsy values as missing', () => {
      const obj = { name: '', email: null, age: 0, active: false }; // falsy values present
      const result = requireFields(mockRes, obj, ['name', 'email', 'age', 'active']);
      
      expect(result).toBe(false); // should fail due to falsy values
      expect(mockRes.status).toHaveBeenCalledWith(400); // 400 error
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: name, email, age, active'
      });
    });

    // verifies should handle empty object
    test('should handle empty object', () => {
      const obj = {}; // empty object
      const result = requireFields(mockRes, obj, ['name']);
      
      expect(result).toBe(false); // fails because field missing
      expect(mockRes.status).toHaveBeenCalledWith(400); // send bad request
    });

    // verifies should handle empty required fields array
    test('should handle empty required fields array', () => {
      const obj = { name: 'John' }; // single valid field
      const result = requireFields(mockRes, obj, []);
      
      expect(result).toBe(true); // passes with no required fields
      expect(mockRes.status).not.toHaveBeenCalled(); // no error
    });

    // verifies should handle undefined object gracefully
    test('should handle undefined object gracefully', () => {
      const result = requireFields(mockRes, undefined, ['name']); // undefined object
      
      expect(result).toBe(false); // should fail
      expect(mockRes.status).toHaveBeenCalledWith(500); // internal server error
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal validation error'
      });
    });

    // verifies should handle null object gracefully
    test('should handle null object gracefully', () => {
      const result = requireFields(mockRes, null, ['name']); // null object
      
      expect(result).toBe(false); // fails
      expect(mockRes.status).toHaveBeenCalledWith(500); // 500 status
    });

    // verifies should accept truthy values
    test('should accept truthy values', () => {
      const obj = {
        name: 'John',
        count: 1,
        active: true,
        data: ['item'],
        config: { setting: 'value' }
      }; // all truthy values
      const result = requireFields(mockRes, obj, ['name', 'count', 'active', 'data', 'config']);

      expect(result).toBe(true); // validator passes
      expect(mockRes.status).not.toHaveBeenCalled(); // no error
    });
  });
});

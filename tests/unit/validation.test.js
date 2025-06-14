
// Unit tests for field presence validation helper. These checks ensure the
// function correctly identifies missing fields and generates standardized error
// responses via the mocked Express response object.
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
      const obj = { name: 'John', email: 'john@example.com', age: 30 };
      const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
      
      expect(result).toBe(true); // all fields present
      expect(mockRes.status).not.toHaveBeenCalled(); // no error sent
    });

    // verifies should return false and send error for missing fields
    test('should return false and send error for missing fields', () => {
      const obj = { name: 'John', age: 30 };
      const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
      
      expect(result).toBe(false); // missing email triggers failure
      expect(mockRes.status).toHaveBeenCalledWith(400); // returns bad request
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        missing: ['email']
      });
    });

    // verifies should return false for multiple missing fields
    test('should return false for multiple missing fields', () => {
      const obj = { name: 'John' };
      const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
      
      expect(result).toBe(false); // multiple fields missing
      expect(mockRes.status).toHaveBeenCalledWith(400); // status set once
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        missing: ['email', 'age']
      });
    });

    // verifies should treat falsy values as missing
    test('should treat falsy values as missing', () => {
      const obj = { name: '', email: null, age: 0, active: false };
      const result = requireFields(obj, ['name', 'email', 'age', 'active'], mockRes);
      
      expect(result).toBe(false); // falsy values considered missing
      expect(mockRes.status).toHaveBeenCalledWith(400); // still 400 response
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        missing: ['name', 'email', 'age', 'active']
      });
    });

    // verifies should handle empty object
    test('should handle empty object', () => {
      const obj = {};
      const result = requireFields(obj, ['name'], mockRes);
      
      expect(result).toBe(false); // empty object fails validation
      expect(mockRes.status).toHaveBeenCalledWith(400); // should send 400
    });

    // verifies should handle empty required fields array
    test('should handle empty required fields array', () => {
      const obj = { name: 'John' };
      const result = requireFields(obj, [], mockRes);
      
      expect(result).toBe(true); // no required fields means success
      expect(mockRes.status).not.toHaveBeenCalled(); // no error when none required
    });

    // verifies should handle undefined object gracefully
    test('should handle undefined object gracefully', () => {
      const result = requireFields(undefined, ['name'], mockRes);
      
      expect(result).toBe(false); // invalid obj returns false
      expect(mockRes.status).toHaveBeenCalledWith(500); // internal error status
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal validation error'
      });
    });

    // verifies should handle null object gracefully
    test('should handle null object gracefully', () => {
      const result = requireFields(null, ['name'], mockRes);
      
      expect(result).toBe(false); // null object also invalid
      expect(mockRes.status).toHaveBeenCalledWith(500); // internal error status
    });

    // verifies should accept truthy values
    test('should accept truthy values', () => {
      const obj = { 
        name: 'John', 
        count: 1, 
        active: true, 
        data: ['item'], 
        config: { setting: 'value' } 
      };
      const result = requireFields(obj, ['name', 'count', 'active', 'data', 'config'], mockRes);
      
      expect(result).toBe(true); // valid fields accepted
      expect(mockRes.status).not.toHaveBeenCalled(); // no error
    });

    // verifies should handle invalid requiredFields parameter
    test('should handle invalid requiredFields parameter', () => {
      const obj = { name: 'John' };
      const result = requireFields(obj, null, mockRes);
      
      expect(result).toBe(false); // invalid requiredFields parameter
      expect(mockRes.status).toHaveBeenCalledWith(500); // internal error for invalid param
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal validation error' }); // send generic message
    });

    // verifies should handle non-array requiredFields parameter
    test('should handle non-array requiredFields parameter', () => {
      const obj = { name: 'John' };
      const result = requireFields(obj, 'name', mockRes);
      
      expect(result).toBe(false); // non-array requiredFields not allowed
      expect(mockRes.status).toHaveBeenCalledWith(500); // internal error
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal validation error' }); // error message
    });

    // verifies should handle invalid obj parameter
    test('should handle invalid obj parameter', () => {
      const result = requireFields(null, ['name'], mockRes);
      
      expect(result).toBe(false); // null object again invalid
      expect(mockRes.status).toHaveBeenCalledWith(500); // internal error
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal validation error' }); // respond with generic
    });
  });
});

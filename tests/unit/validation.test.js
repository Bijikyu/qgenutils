
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
      
      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    // verifies should return false and send error for missing fields
    test('should return false and send error for missing fields', () => {
      const obj = { name: 'John', age: 30 };
      const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        missing: ['email']
      });
    });

    // verifies should return false for multiple missing fields
    test('should return false for multiple missing fields', () => {
      const obj = { name: 'John' };
      const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        missing: ['email', 'age']
      });
    });

    // verifies should treat falsy values as missing
    test('should treat falsy values as missing', () => {
      const obj = { name: '', email: null, age: 0, active: false };
      const result = requireFields(obj, ['name', 'email', 'age', 'active'], mockRes);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        missing: ['name', 'email', 'age', 'active']
      });
    });

    // verifies should handle empty object
    test('should handle empty object', () => {
      const obj = {};
      const result = requireFields(obj, ['name'], mockRes);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // verifies should handle empty required fields array
    test('should handle empty required fields array', () => {
      const obj = { name: 'John' };
      const result = requireFields(obj, [], mockRes);
      
      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    // verifies should handle undefined object gracefully
    test('should handle undefined object gracefully', () => {
      const result = requireFields(undefined, ['name'], mockRes);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal validation error'
      });
    });

    // verifies should handle null object gracefully
    test('should handle null object gracefully', () => {
      const result = requireFields(null, ['name'], mockRes);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(500);
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
      
      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});

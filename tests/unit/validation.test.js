
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

    test('should return true when all required fields are present', () => {
      const obj = { name: 'John', email: 'john@example.com', age: 30 };
      const result = requireFields(mockRes, obj, ['name', 'email', 'age']);
      
      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should return false and send error for missing fields', () => {
      const obj = { name: 'John', age: 30 };
      const result = requireFields(mockRes, obj, ['name', 'email', 'age']);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: email'
      });
    });

    test('should return false for multiple missing fields', () => {
      const obj = { name: 'John' };
      const result = requireFields(mockRes, obj, ['name', 'email', 'age']);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: email, age'
      });
    });

    test('should treat falsy values as missing', () => {
      const obj = { name: '', email: null, age: 0, active: false };
      const result = requireFields(mockRes, obj, ['name', 'email', 'age', 'active']);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: name, email, age, active'
      });
    });

    test('should handle empty object', () => {
      const obj = {};
      const result = requireFields(mockRes, obj, ['name']);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should handle empty required fields array', () => {
      const obj = { name: 'John' };
      const result = requireFields(mockRes, obj, []);
      
      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should handle undefined object gracefully', () => {
      const result = requireFields(mockRes, undefined, ['name']);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal validation error'
      });
    });

    test('should handle null object gracefully', () => {
      const result = requireFields(mockRes, null, ['name']);
      
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test('should accept truthy values', () => {
      const obj = { 
        name: 'John', 
        count: 1, 
        active: true, 
        data: ['item'], 
        config: { setting: 'value' } 
      };
      const result = requireFields(mockRes, obj, ['name', 'count', 'active', 'data', 'config']);
      
      expect(result).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});

const requireFields = require('./requireFields');

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
    const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
    
    expect(result).toBe(true);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test('should return false and send error for missing fields', () => {
    const obj = { name: 'John', age: 30 };
    const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
    
    expect(result).toBe(false);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      message: 'Missing required fields: email',
      missingFields: ['email']
    });
  });

  test('should handle multiple missing fields', () => {
    const obj = { name: 'John' };
    const result = requireFields(obj, ['name', 'email', 'age'], mockRes);
    
    expect(result).toBe(false);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      message: 'Missing required fields: email, age',
      missingFields: ['email', 'age']
    });
  });

  test('should handle empty object', () => {
    const result = requireFields({}, ['name'], mockRes);
    expect(result).toBe(false);
  });

  test('should handle invalid parameters gracefully', () => {
    expect(requireFields(null, ['name'], mockRes)).toBe(false);
    expect(requireFields({}, null, mockRes)).toBe(false);
    expect(requireFields({}, [], mockRes)).toBe(true);
  });
});

// Unit tests for HTTP helpers covering header sanitization, content-length
// calculations, and generic response handling to guarantee consistent behavior
// for API proxying scenarios.
const { calculateContentLength, buildCleanHeaders, getRequiredHeader } = require('../../lib/http');
const { sendJsonResponse } = require('../../lib/response-utils');

describe('HTTP Utilities', () => {
  describe('calculateContentLength', () => {
    // verifies should calculate length for string body
    test('should calculate length for string body', () => {
      expect(calculateContentLength('Hello World')).toBe('11');
    });

    // verifies should calculate length for object body
    test('should calculate length for object body', () => {
      const obj = { name: 'John', age: 30 };
      const expected = Buffer.byteLength(JSON.stringify(obj), 'utf8').toString();
      expect(calculateContentLength(obj)).toBe(expected);
    });

    // verifies should return "0" for empty string
    test('should return "0" for empty string', () => {
      expect(calculateContentLength('')).toBe('0');
    });

    // verifies should return "0" for empty object
    test('should return "0" for empty object', () => {
      expect(calculateContentLength({})).toBe('0');
    });

    // verifies should return "0" for null body
    test('should return "0" for null body', () => {
      expect(calculateContentLength(null)).toBe('0');
    });

    // verifies should throw error for undefined body
    test('should throw error for undefined body', () => {
      expect(() => calculateContentLength(undefined)).toThrow('Body is undefined');
    });

    // verifies should handle UTF-8 characters correctly
    test('should handle UTF-8 characters correctly', () => {
      const utf8String = 'café';
      const expected = Buffer.byteLength(utf8String, 'utf8').toString();
      expect(calculateContentLength(utf8String)).toBe(expected);
    });

    // verifies should handle complex nested objects
    test('should handle complex nested objects', () => {
      const complexObj = {
        user: { name: 'John', settings: { theme: 'dark' } },
        data: [1, 2, 3]
      };
      const expected = Buffer.byteLength(JSON.stringify(complexObj), 'utf8').toString();
      expect(calculateContentLength(complexObj)).toBe(expected);
    });

    // verifies should calculate length for Buffer body
    test('should calculate length for Buffer body', () => {
      const buf = Buffer.from('abc');
      expect(calculateContentLength(buf)).toBe(buf.length.toString());
    });
  });

  describe('buildCleanHeaders', () => {
    const originalHeaders = {
      'authorization': 'Bearer token123',
      'content-type': 'application/json',
      'host': 'example.com',
      'x-target-url': 'https://api.example.com',
      'cf-ray': '12345',
      'user-agent': 'MyApp/1.0'
    };

    // verifies should remove dangerous headers for GET request
    test('should remove dangerous headers for GET request', () => {
      const result = buildCleanHeaders(originalHeaders, 'GET', null);
      
      expect(result['authorization']).toBe('Bearer token123');
      expect(result['content-type']).toBe('application/json');
      expect(result['user-agent']).toBe('MyApp/1.0');
      
      expect(result['host']).toBeUndefined();
      expect(result['x-target-url']).toBeUndefined();
      expect(result['cf-ray']).toBeUndefined();
      expect(result['content-length']).toBeUndefined();
    });

    // verifies should remove dangerous headers and set content-length for POST with body
    test('should remove dangerous headers and set content-length for POST with body', () => {
      const body = { name: 'test' };
      const result = buildCleanHeaders(originalHeaders, 'POST', body);
      
      expect(result['authorization']).toBe('Bearer token123');
      expect(result['content-type']).toBe('application/json');
      expect(result['content-length']).toBe(calculateContentLength(body));
      
      expect(result['host']).toBeUndefined();
      expect(result['x-target-url']).toBeUndefined();
      expect(result['cf-ray']).toBeUndefined();
    });

    // verifies should not set content-length for POST without body
    test('should not set content-length for POST without body', () => {
      const result = buildCleanHeaders(originalHeaders, 'POST', null);
      expect(result['content-length']).toBeUndefined();
    });

    // verifies should remove content-length when body is empty object
    test('should remove content-length when body is empty object', () => {
      const input = { 'content-length': '10' };
      const result = buildCleanHeaders(input, 'POST', {});
      expect(result['content-length']).toBeUndefined();
    });

    // verifies should remove content-length when body is empty buffer
    test('should remove content-length when body is empty buffer', () => {
      const input = { 'content-length': '5' };
      const result = buildCleanHeaders(input, 'POST', Buffer.alloc(0));
      expect(result['content-length']).toBeUndefined();
    });

    // verifies should handle empty headers object
    test('should handle empty headers object', () => {
      const result = buildCleanHeaders({}, 'GET', null);
      expect(Object.keys(result)).toHaveLength(0);
    });

    // verifies should not mutate original headers
    test('should not mutate original headers', () => {
      const original = { ...originalHeaders };
      buildCleanHeaders(originalHeaders, 'GET', null);
      expect(originalHeaders).toEqual(original);
    });

    // verifies should default to GET when method is invalid
    test('should default to GET when method is invalid', () => {
      const result = buildCleanHeaders(originalHeaders, 123, null);
      expect(result['content-length']).toBeUndefined();
      expect(result['host']).toBeUndefined();
    });
  });

  describe('sendJsonResponse', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    // verifies should send JSON response with correct status
    test('should send JSON response with correct status', () => {
      const data = { message: 'Success' };
      sendJsonResponse(mockRes, 200, data);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(data);
    });

    // verifies should handle error responses
    test('should handle error responses', () => {
      const errorData = { error: 'Not found' };
      sendJsonResponse(mockRes, 404, errorData);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(errorData);
    });
  });

  describe('getRequiredHeader', () => {
    let mockReq, mockRes;

    beforeEach(() => {
      mockReq = {
        headers: {
          'authorization': 'Bearer token123',
          'content-type': 'application/json'
        }
      };
      
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    // verifies should return header value when present
    test('should return header value when present', () => {
      const result = getRequiredHeader(mockReq, mockRes, 'authorization', 401, 'Missing auth');
      expect(result).toBe('Bearer token123');
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    // verifies should send error response when header is missing
    test('should send error response when header is missing', () => {
      const result = getRequiredHeader(mockReq, mockRes, 'x-api-key', 401, 'Missing API key');
      
      expect(result).toBeNull();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing API key' });
    });

    // verifies should handle malformed request object
    test('should handle malformed request object', () => {
      const malformedReq = {};
      const result = getRequiredHeader(malformedReq, mockRes, 'authorization', 401, 'Missing auth');
      
      expect(result).toBeNull();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    // verifies should handle undefined headers
    test('should handle undefined headers', () => {
      const reqWithoutHeaders = { headers: undefined };
      const result = getRequiredHeader(reqWithoutHeaders, mockRes, 'authorization', 401, 'Missing auth');

      expect(result).toBeNull();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    // verifies should retrieve header regardless of case
    test('should retrieve header regardless of case', () => {
      const result = getRequiredHeader(mockReq, mockRes, 'Authorization', 401, 'Missing auth');
      expect(result).toBe('Bearer token123');
    });

    // verifies should handle errors during header processing
    test('should handle errors during header processing', () => {
      const req = { 
        get headers() { 
          throw new Error('Header access error'); 
        } 
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      const result = getRequiredHeader(req, res, 'authorization', 401, 'Missing auth');
      
      expect(result).toBeNull();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});

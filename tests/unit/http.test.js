
const { calculateContentLength, buildCleanHeaders, sendJsonResponse, getRequiredHeader } = require('../../lib/http');

describe('HTTP Utilities', () => {
  describe('calculateContentLength', () => {
    // verifies should calculate length for string body
    test('should calculate length for string body', () => {
      expect(calculateContentLength('Hello World')).toBe('11'); // length in bytes
    });

    // verifies should calculate length for object body
    test('should calculate length for object body', () => {
      const obj = { name: 'John', age: 30 }; // body object
      const expected = Buffer.byteLength(JSON.stringify(obj), 'utf8').toString(); // manual calc
      expect(calculateContentLength(obj)).toBe(expected); // compare with utility
    });

    // verifies should return "0" for empty string
    test('should return "0" for empty string', () => {
      expect(calculateContentLength('')).toBe('0'); // empty string
    });

    // verifies should return "0" for empty object
    test('should return "0" for empty object', () => {
      expect(calculateContentLength({})).toBe('0'); // empty object
    });

    // verifies should return "0" for null body
    test('should return "0" for null body', () => {
      expect(calculateContentLength(null)).toBe('0'); // null treated as zero
    });

    // verifies should throw error for undefined body
    test('should throw error for undefined body', () => {
      expect(() => calculateContentLength(undefined)).toThrow('Body is undefined'); // undefined triggers error
    });

    // verifies should handle UTF-8 characters correctly
    test('should handle UTF-8 characters correctly', () => {
      const utf8String = 'café'; // multibyte characters
      const expected = Buffer.byteLength(utf8String, 'utf8').toString(); // manual length
      expect(calculateContentLength(utf8String)).toBe(expected); // verify count
    });

    // verifies should handle complex nested objects
    test('should handle complex nested objects', () => {
      const complexObj = {
        user: { name: 'John', settings: { theme: 'dark' } },
        data: [1, 2, 3]
      };
      const expected = Buffer.byteLength(JSON.stringify(complexObj), 'utf8').toString(); // compute manual size
      expect(calculateContentLength(complexObj)).toBe(expected); // compare
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
      const result = buildCleanHeaders(originalHeaders, 'GET', null); // no body GET request
      
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
      const body = { name: 'test' }; // payload for POST
      const result = buildCleanHeaders(originalHeaders, 'POST', body); // should add length
      
      expect(result['authorization']).toBe('Bearer token123');
      expect(result['content-type']).toBe('application/json');
      expect(result['content-length']).toBe(calculateContentLength(body));
      
      expect(result['host']).toBeUndefined();
      expect(result['x-target-url']).toBeUndefined();
      expect(result['cf-ray']).toBeUndefined();
    });

    // verifies should not set content-length for POST without body
    test('should not set content-length for POST without body', () => {
      const result = buildCleanHeaders(originalHeaders, 'POST', null); // POST without body
      expect(result['content-length']).toBeUndefined();
    });

    // verifies should handle empty headers object
    test('should handle empty headers object', () => {
      const result = buildCleanHeaders({}, 'GET', null); // no headers provided
      expect(Object.keys(result)).toHaveLength(0); // should remain empty
    });

    // verifies should not mutate original headers
    test('should not mutate original headers', () => {
      const original = { ...originalHeaders }; // snapshot
      buildCleanHeaders(originalHeaders, 'GET', null); // call function
      expect(originalHeaders).toEqual(original); // ensure no mutation
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
      const data = { message: 'Success' }; // payload to send
      sendJsonResponse(mockRes, 200, data); // call helper
      
      expect(mockRes.status).toHaveBeenCalledWith(200); // status code set
      expect(mockRes.json).toHaveBeenCalledWith(data); // json body sent
    });

    // verifies should handle error responses
    test('should handle error responses', () => {
      const errorData = { error: 'Not found' }; // simulate error response
      sendJsonResponse(mockRes, 404, errorData); // send 404
      
      expect(mockRes.status).toHaveBeenCalledWith(404); // 404 code
      expect(mockRes.json).toHaveBeenCalledWith(errorData); // error payload
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
      const result = getRequiredHeader(mockReq, mockRes, 'authorization', 401, 'Missing auth'); // header exists
      expect(result).toBe('Bearer token123'); // value returned
      expect(mockRes.status).not.toHaveBeenCalled(); // no error sent
    });

    // verifies should send error response when header is missing
    test('should send error response when header is missing', () => {
      const result = getRequiredHeader(mockReq, mockRes, 'x-api-key', 401, 'Missing API key'); // missing header
      
      expect(result).toBeNull(); // function returns null when missing
      expect(mockRes.status).toHaveBeenCalledWith(401); // 401 set
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing API key' }); // error body
    });

    // verifies should handle malformed request object
    test('should handle malformed request object', () => {
      const malformedReq = {}; // no headers object
      const result = getRequiredHeader(malformedReq, mockRes, 'authorization', 401, 'Missing auth');
      
      expect(result).toBeNull(); // return null for missing header
      expect(mockRes.status).toHaveBeenCalledWith(401); // unauthorized
    });

    // verifies should handle undefined headers
    test('should handle undefined headers', () => {
      const reqWithoutHeaders = { headers: undefined }; // explicit undefined
      const result = getRequiredHeader(reqWithoutHeaders, mockRes, 'authorization', 401, 'Missing auth');
      
      expect(result).toBeNull(); // null return when headers undefined
      expect(mockRes.status).toHaveBeenCalledWith(401); // error response triggered
    });
  });
});

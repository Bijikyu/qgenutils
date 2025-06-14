
// Unit tests for HTTP helpers covering header sanitization, content-length
// calculations, and generic response handling to guarantee consistent behavior
// for API proxying scenarios.
const { calculateContentLength, buildCleanHeaders, getRequiredHeader, HEADERS_TO_REMOVE } = require('../../lib/http'); // include constant for immutability tests
const { sendJsonResponse } = require('../../lib/response-utils');

describe('HTTP Utilities', () => {
  describe('calculateContentLength', () => {
    // verifies should calculate length for string body
    test('should calculate length for string body', () => {
      expect(calculateContentLength('Hello World')).toBe('11'); // bytes count for string body
    });

    // verifies should calculate length for object body
    test('should calculate length for object body', () => {
      const obj = { name: 'John', age: 30 };
      const expected = Buffer.byteLength(JSON.stringify(obj), 'utf8').toString();
      expect(calculateContentLength(obj)).toBe(expected); // verifies object size calculation
    });

    // verifies should return "0" for empty string
    test('should return "0" for empty string', () => {
      expect(calculateContentLength('')).toBe('0'); // no content should return zero
    });

    // verifies should return "0" for empty object
    test('should return "0" for empty object', () => {
      expect(calculateContentLength({})).toBe('0'); // empty object yields zero bytes
    });

    // verifies should return "0" for null body
    test('should return "0" for null body', () => {
      expect(calculateContentLength(null)).toBe('0'); // null body produces zero
    });

    // verifies should throw error for undefined body
    test('should throw error for undefined body', () => {
      expect(() => calculateContentLength(undefined)).toThrow('Body is undefined'); // undefined body should throw
    });

    // verifies should handle UTF-8 characters correctly
    test('should handle UTF-8 characters correctly', () => {
      const utf8String = 'café';
      const expected = Buffer.byteLength(utf8String, 'utf8').toString();
      expect(calculateContentLength(utf8String)).toBe(expected); // verify multibyte chars counted correctly
    });

    // verifies should handle complex nested objects
    test('should handle complex nested objects', () => {
      const complexObj = {
        user: { name: 'John', settings: { theme: 'dark' } },
        data: [1, 2, 3]
      };
      const expected = Buffer.byteLength(JSON.stringify(complexObj), 'utf8').toString();
      expect(calculateContentLength(complexObj)).toBe(expected); // nested object should serialize consistently
    });

    // verifies should calculate length for Buffer body
    test('should calculate length for Buffer body', () => {
      const buf = Buffer.from('abc');
      expect(calculateContentLength(buf)).toBe(buf.length.toString()); // buffer length returned as string
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
      
      expect(result['authorization']).toBe('Bearer token123'); // auth header preserved
      expect(result['content-type']).toBe('application/json'); // content-type kept
      expect(result['user-agent']).toBe('MyApp/1.0'); // user-agent kept
      
      expect(result['host']).toBeUndefined(); // host removed for security
      expect(result['x-target-url']).toBeUndefined(); // upstream url stripped
      expect(result['cf-ray']).toBeUndefined(); // cf specific header removed
      expect(result['content-length']).toBeUndefined(); // not added for GET
    });

    // verifies should remove dangerous headers and set content-length for POST with body
    test('should remove dangerous headers and set content-length for POST with body', () => {
      const body = { name: 'test' };
      const result = buildCleanHeaders(originalHeaders, 'POST', body);
      
      expect(result['authorization']).toBe('Bearer token123'); // auth header preserved for POST
      expect(result['content-type']).toBe('application/json'); // content-type kept
      expect(result['content-length']).toBe(calculateContentLength(body)); // length header set from body
      
      expect(result['host']).toBeUndefined(); // host stripped
      expect(result['x-target-url']).toBeUndefined(); // remove forwarding header
      expect(result['cf-ray']).toBeUndefined(); // remove cf data
    });

    // verifies should not set content-length for POST without body
    test('should not set content-length for POST without body', () => {
      const result = buildCleanHeaders(originalHeaders, 'POST', null);
      expect(result['content-length']).toBeUndefined(); // no body means no length header
    });

    // verifies should remove content-length when body is empty object
    test('should remove content-length when body is empty object', () => {
      const input = { 'content-length': '10' };
      const result = buildCleanHeaders(input, 'POST', {});
      expect(result['content-length']).toBeUndefined(); // empty object should remove length
    });

    // verifies should remove content-length when body is empty buffer
    test('should remove content-length when body is empty buffer', () => {
      const input = { 'content-length': '5' };
      const result = buildCleanHeaders(input, 'POST', Buffer.alloc(0));
      expect(result['content-length']).toBeUndefined(); // empty buffer should remove length
    });

    // verifies should handle empty headers object
    test('should handle empty headers object', () => {
      const result = buildCleanHeaders({}, 'GET', null);
      expect(Object.keys(result)).toHaveLength(0); // result should stay empty
    });

    // verifies should not mutate original headers
    test('should not mutate original headers', () => {
      const original = { ...originalHeaders };
      buildCleanHeaders(originalHeaders, 'GET', null);
      expect(originalHeaders).toEqual(original); // verify immutability
    });

    // verifies should default to GET when method is invalid
    test('should default to GET when method is invalid', () => {
      const result = buildCleanHeaders(originalHeaders, 123, null);
      expect(result['content-length']).toBeUndefined(); // invalid method defaults to GET
      expect(result['host']).toBeUndefined(); // host still removed
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
      
      expect(mockRes.status).toHaveBeenCalledWith(200); // status should match provided code
      expect(mockRes.json).toHaveBeenCalledWith(data); // response payload should be sent
    });

    // verifies should handle error responses
    test('should handle error responses', () => {
      const errorData = { error: 'Not found' };
      sendJsonResponse(mockRes, 404, errorData);
      
      expect(mockRes.status).toHaveBeenCalledWith(404); // error status is set
      expect(mockRes.json).toHaveBeenCalledWith(errorData); // error payload returned
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
      expect(result).toBe('Bearer token123'); // header retrieved in case-insensitive manner
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    // verifies should send error response when header is missing
    test('should send error response when header is missing', () => {
      const result = getRequiredHeader(mockReq, mockRes, 'x-api-key', 401, 'Missing API key');

      expect(result).toBeNull(); // missing header returns null
      expect(mockRes.status).toHaveBeenCalledWith(401); // sends unauthorized code
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing API key' }); // payload explains missing key
    });

    // verifies should handle malformed request object
    test('should handle malformed request object', () => {
      const malformedReq = {};
      const result = getRequiredHeader(malformedReq, mockRes, 'authorization', 401, 'Missing auth');

      expect(result).toBeNull(); // missing headers should cause null return
      expect(mockRes.status).toHaveBeenCalledWith(401); // unauthorized status used for missing header
    });

    // verifies should handle undefined headers
    test('should handle undefined headers', () => {
      const reqWithoutHeaders = { headers: undefined };
      const result = getRequiredHeader(reqWithoutHeaders, mockRes, 'authorization', 401, 'Missing auth');

      expect(result).toBeNull(); // undefined headers result in null
      expect(mockRes.status).toHaveBeenCalledWith(401); // still unauthorized
    });

    // verifies should retrieve header regardless of case
    test('should retrieve header regardless of case', () => {
      const result = getRequiredHeader(mockReq, mockRes, 'Authorization', 401, 'Missing auth');
      expect(result).toBe('Bearer token123'); // case-insensitive header check
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
      
      expect(result).toBeNull(); // failure should return null
      expect(res.status).toHaveBeenCalledWith(500); // error status for processing issue
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' }); // generic error body
    });
  });

  describe('HEADERS_TO_REMOVE', () => {
    // verifies should not change when modification is attempted
    test('should not change when modification is attempted', () => {
      const original = [...HEADERS_TO_REMOVE]; // capture original list for comparison
      expect(() => { HEADERS_TO_REMOVE.push('new-header'); }).toThrow(TypeError); // frozen array should throw on push
      expect(HEADERS_TO_REMOVE).toEqual(original); // array should remain unchanged
    });
  });
});

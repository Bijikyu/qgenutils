require('qtests/setup'); // ensure stub modules during tests
const { sendJsonResponse, sendValidationError, sendAuthError, sendServerError } = require('../../lib/response-utils');
const { qerrors } = require('qerrors');

describe('Response Utilities', () => {
  describe('sendJsonResponse', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(), // spy status method for chaining
        json: jest.fn().mockReturnThis()    // spy json method for payload capture
      };
    });

    // verifies should send JSON response with given status and data
    test('should send JSON response with given status and data', () => {
      const payload = { success: true };
      sendJsonResponse(mockRes, 201, payload);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(payload);
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      const badRes = {}; // missing status/json
      sendJsonResponse(badRes, 200, { ok: true });

      expect(qerrors).toHaveBeenCalled();
    });
  });

  describe('sendValidationError', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    // verifies should send validation error with default 400 code
    test('should send validation error with default 400 code', () => {
      sendValidationError(mockRes, 'Invalid field', { field: 'name' });

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid field', field: 'name' });
    });

    // verifies should allow custom status code
    test('should allow custom status code', () => {
      sendValidationError(mockRes, 'Too many', {}, 429);

      expect(mockRes.status).toHaveBeenCalledWith(429);
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      sendValidationError({}, 'bad');
      expect(qerrors).toHaveBeenCalled();
    });
  });

  describe('sendAuthError', () => {
    // verifies should send 401 auth error with default message
    test('should send 401 auth error with default message', () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      sendAuthError(res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      sendAuthError(undefined, 'nope');
      expect(qerrors).toHaveBeenCalled();
    });
  });

  describe('sendServerError', () => {
    // verifies should send 500 error and log original error
    test('should send 500 error and log original error', () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      const err = new Error('fail');
      sendServerError(res, 'Oops', err, 'context');

      expect(qerrors).toHaveBeenCalledWith(err, 'sendServerError', { message: 'Oops', context: 'context' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Oops' });
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      sendServerError(null, 'bad');
      expect(qerrors).toHaveBeenCalled();
    });

    // verifies should handle JSON serialization failures
    test('should handle JSON serialization failures', () => {
      const res = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn()
          .mockImplementationOnce(() => { throw new Error('JSON error'); })
          .mockImplementationOnce(() => { throw new Error('Fallback error'); })
      };
      
      sendJsonResponse(res, 200, { circular: {} });
      
      // Should attempt fallback after first failure
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(qerrors).toHaveBeenCalled(); // Verify error logging occurred
    });

    // verifies should handle successful JSON serialization after retry
    test('should handle successful JSON serialization after retry', () => {
      const res = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn()
          .mockImplementationOnce(() => { throw new Error('JSON error'); })
          .mockImplementationOnce(() => 'success')
      };
      
      sendJsonResponse(res, 200, { data: 'test' });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Response serialization failed' });
    });
  });
});

// Unit tests for standardized response helpers. These tests mock Express
// responses to verify that each helper produces consistent output and logs
// errors through qerrors when appropriate.
require('qtests/setup'); // ensure stub modules during tests
const { sendJsonResponse, sendValidationError, sendAuthError, sendServerError } = require('../../lib/response-utils');
const { qerrors } = require('qerrors');

describe('Response Utilities', () => { // ensures standard responses remain uniform
  describe('sendJsonResponse', () => { // verifies JSON helper reliability
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

      expect(mockRes.status).toHaveBeenCalledWith(201); // status should match argument
      expect(mockRes.json).toHaveBeenCalledWith(payload); // json payload returned
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      const badRes = {}; // missing status/json
      sendJsonResponse(badRes, 200, { ok: true });

      expect(qerrors).toHaveBeenCalled(); // error logged for bad response object
    });

    // verifies should work when status does not chain
    test('should send JSON even if status does not return this', () => {
      const nonChainRes = { status: jest.fn(), json: jest.fn().mockReturnThis() };
      sendJsonResponse(nonChainRes, 202, { done: true });

      expect(nonChainRes.status).toHaveBeenCalledWith(202); // still sets status
      expect(nonChainRes.json).toHaveBeenCalledWith({ done: true }); // response data
    });
  });

  describe('sendValidationError', () => { // checks validation error structure
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

      expect(mockRes.status).toHaveBeenCalledWith(400); // default status
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid field', field: 'name' }); // payload includes field data
    });

    // verifies should allow custom status code
    test('should allow custom status code', () => {
      sendValidationError(mockRes, 'Too many', {}, 429);

      expect(mockRes.status).toHaveBeenCalledWith(429); // custom code respected
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      sendValidationError({}, 'bad');
      expect(qerrors).toHaveBeenCalled(); // invalid res triggers logging
    });
  });

  describe('sendAuthError', () => { // confirms default auth error behavior
    // verifies should send 401 auth error with default message
    test('should send 401 auth error with default message', () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      sendAuthError(res);

      expect(res.status).toHaveBeenCalledWith(401); // 401 for auth error
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' }); // default message output
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      sendAuthError(undefined, 'nope');
      expect(qerrors).toHaveBeenCalled(); // invalid response object logged
    });
  });

  describe('sendServerError', () => { // ensures server error reporting stays consistent
    // verifies should send 500 error and log original error
    test('should send 500 error and log original error', () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      const err = new Error('fail');
      sendServerError(res, 'Oops', err, 'context');

      expect(qerrors).toHaveBeenCalledWith(err, 'sendServerError', { message: 'Oops', context: 'context' }); // original error forwarded
      expect(res.status).toHaveBeenCalledWith(500); // sets status code to 500
      expect(res.json).toHaveBeenCalledWith({ error: 'Oops' }); // send sanitized message
    });

    // verifies should handle invalid response objects gracefully
    test('should handle invalid response objects gracefully', () => {
      sendServerError(null, 'bad');
      expect(qerrors).toHaveBeenCalled(); // invalid res logged
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
      expect(res.status).toHaveBeenCalledWith(200); // first attempt uses requested status
      expect(res.status).toHaveBeenCalledWith(500); // retry uses error status
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
      
      expect(res.status).toHaveBeenCalledWith(200); // normal response status first
      expect(res.status).toHaveBeenCalledWith(500); // fallback on serialization error
      expect(res.json).toHaveBeenCalledWith({ error: 'Response serialization failed' }); // send generic error JSON
    });
  });
});

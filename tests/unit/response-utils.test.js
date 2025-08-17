// Unit tests for standardized response helpers. These tests mock Express
// responses to verify that each helper produces consistent output and logs
// errors through qerrors when appropriate.
require('qtests/setup'); // ensure stub modules during tests
const sendJsonResponse = require('../../lib/response/sendJsonResponse');
const sendValidationError = require('../../lib/response/sendValidationError');
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


});

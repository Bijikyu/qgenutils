
const utils = require('../../index');
const { 
  formatDateTime, 
  formatDuration, 
  calculateContentLength, 
  buildCleanHeaders,
  ensureProtocol,
  normalizeUrlOrigin,
  requireFields,
  checkPassportAuth
} = utils;

describe('Module Integration Tests', () => {
  describe('HTTP and URL Integration', () => {
    // verifies should process URL and calculate content length for API request
    test('should process URL and calculate content length for API request', () => {
      const url = 'api.example.com/users';
      const body = { name: 'John', email: 'john@example.com' };
      
      // Process URL
      const processedUrl = ensureProtocol(url);
      expect(processedUrl).toBe('https://api.example.com/users');
      
      // Calculate content length for request body
      const contentLength = calculateContentLength(body);
      expect(contentLength).toBe(Buffer.byteLength(JSON.stringify(body), 'utf8').toString());
      
      // Build clean headers
      const headers = buildCleanHeaders({
        'content-type': 'application/json',
        'host': 'evil.com'
      }, 'POST', body);
      
      expect(headers['content-length']).toBe(contentLength);
      expect(headers['host']).toBeUndefined();
    });

    // verifies should normalize URLs and build appropriate headers
    test('should normalize URLs and build appropriate headers', () => {
      const urls = [
        'HTTPS://API.Example.com/v1',
        'api.example.com/v1',
        'HTTP://api.example.com/v1'
      ];
      
      const normalizedOrigins = urls.map(normalizeUrlOrigin);
      
      // All should normalize to the same origin
      expect(normalizedOrigins[0]).toBe('https://api.example.com');
      expect(normalizedOrigins[1]).toBe('https://api.example.com');
      expect(normalizedOrigins[2]).toBe('http://api.example.com');
      
      // Headers should be clean for any method
      const headers = buildCleanHeaders({
        'authorization': 'Bearer token',
        'x-target-url': normalizedOrigins[0]
      }, 'GET', null);
      
      expect(headers['authorization']).toBe('Bearer token');
      expect(headers['x-target-url']).toBeUndefined();
    });
  });

  describe('Validation and Authentication Integration', () => {
    // verifies should validate required fields and check authentication together
    test('should validate required fields and check authentication together', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Mock authenticated request
      const mockAuthReq = {
        user: { id: 1, name: 'John' },
        isAuthenticated: jest.fn().mockReturnValue(true),
        body: { title: 'Test Post', content: 'Content here' }
      };
      
      // Check authentication first
      const isAuth = checkPassportAuth(mockAuthReq);
      expect(isAuth).toBe(true);
      
      // Then validate required fields
      const isValid = requireFields(mockAuthReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(isValid).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    // verifies should handle unauthenticated user with valid fields
    test('should handle unauthenticated user with valid fields', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const mockUnauthReq = {
        isAuthenticated: jest.fn().mockReturnValue(false),
        body: { title: 'Test Post', content: 'Content here' }
      };
      
      // Authentication fails
      const isAuth = checkPassportAuth(mockUnauthReq);
      expect(isAuth).toBe(false);
      
      // Fields are valid but auth failed
      const isValid = requireFields(mockUnauthReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(isValid).toBe(true);
    });
  });

  describe('DateTime and HTTP Integration', () => {
    // verifies should format timestamps and include in HTTP responses
    test('should format timestamps and include in HTTP responses', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const startTime = '2023-12-25T10:00:00.000Z';
      const endTime = '2023-12-25T11:30:45.000Z';
      
      // Format timestamps
      const formattedStart = formatDateTime(startTime);
      const duration = formatDuration(startTime, endTime);
      
      // Create response data
      const responseData = {
        started_at: formattedStart,
        duration: duration,
        status: 'completed'
      };
      
      // Calculate content length for response
      const contentLength = calculateContentLength(responseData);
      
      // Send response
      utils.sendJsonResponse(mockRes, 200, responseData);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(responseData);
      expect(formattedStart).not.toBe('N/A');
      expect(duration).toBe('01:30:45');
    });

    // verifies should handle malformed dates in HTTP context
    test('should handle malformed dates in HTTP context', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const invalidDate = 'not-a-date';
      
      // Format should return N/A for invalid date
      const formatted = formatDateTime(invalidDate);
      expect(formatted).toBe('N/A');
      
      // Should still be able to create valid response
      const responseData = { timestamp: formatted, error: 'Invalid date provided' };
      utils.sendJsonResponse(mockRes, 400, responseData);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(responseData);
    });
  });

  describe('Complete Request Processing Workflow', () => {
    // verifies should simulate complete API request processing
    test('should simulate complete API request processing', () => {
      const mockReq = {
        headers: {
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
          'host': 'proxy.example.com',
          'x-target-url': 'api.service.com/posts'
        },
        body: {
          title: 'New Post',
          content: 'Post content here',
          published_at: '2023-12-25T10:30:00.000Z'
        },
        user: { id: 1, name: 'John' },
        isAuthenticated: jest.fn().mockReturnValue(true)
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Step 1: Check authentication
      const isAuthenticated = checkPassportAuth(mockReq);
      expect(isAuthenticated).toBe(true);
      
      // Step 2: Validate required fields
      const fieldsValid = requireFields(mockReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(fieldsValid).toBe(true);
      
      // Step 3: Extract and validate required headers
      const authHeader = utils.getRequiredHeader(mockReq, mockRes, 'authorization', 401, 'Missing auth');
      expect(authHeader).toBe('Bearer valid-token');
      
      // Step 4: Process target URL
      const targetUrl = mockReq.headers['x-target-url'];
      const processedUrl = ensureProtocol(targetUrl);
      expect(processedUrl).toBe('https://api.service.com/posts');
      
      // Step 5: Build clean headers for proxying
      const cleanHeaders = buildCleanHeaders(mockReq.headers, 'POST', mockReq.body);
      expect(cleanHeaders['authorization']).toBe('Bearer valid-token');
      expect(cleanHeaders['host']).toBeUndefined();
      expect(cleanHeaders['x-target-url']).toBeUndefined();
      
      // Step 6: Format timestamps in response
      const formattedDate = formatDateTime(mockReq.body.published_at);
      
      // Step 7: Send successful response
      const responseData = {
        id: 123,
        title: mockReq.body.title,
        published_at: formattedDate,
        status: 'created'
      };
      
      utils.sendJsonResponse(mockRes, 201, responseData);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(responseData);
    });

    // verifies should handle complete workflow with validation failure
    test('should handle complete workflow with validation failure', () => {
      const mockReq = {
        headers: { 'authorization': 'Bearer token' },
        body: { title: 'Post without content' }, // Missing required content
        user: { id: 1 },
        isAuthenticated: jest.fn().mockReturnValue(true)
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Authentication passes
      expect(checkPassportAuth(mockReq)).toBe(true);
      
      // Validation fails
      const fieldsValid = requireFields(mockReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(fieldsValid).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: content'
      });
    });

    // verifies should handle complete workflow with authentication failure
    test('should handle complete workflow with authentication failure', () => {
      const mockReq = {
        headers: { 'content-type': 'application/json' },
        body: { title: 'Post', content: 'Content' },
        isAuthenticated: jest.fn().mockReturnValue(false)
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Authentication fails early
      expect(checkPassportAuth(mockReq)).toBe(false);
      
      // Even though fields are valid, auth failed
      const fieldsValid = requireFields(mockReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(fieldsValid).toBe(true);
      
      // In a real app, we'd return 401 for auth failure before validating fields
    });
  });
});


// Integration tests covering how individual utilities interact when combined in
// typical request workflows. The focus here is cross-module cooperation rather
// than isolated unit behavior.
const utils = require('../../index');
const { 
  formatDateTime, 
  formatDuration, 
  calculateContentLength, 
  buildCleanHeaders,
  ensureProtocol,
  normalizeUrlOrigin,
  requireFields,
  checkPassportAuth,
  requireEnvVars,
  hasEnvVar,
  getEnvVar
} = utils;

describe('Module Integration Tests', () => { // verifies utilities work together
  describe('HTTP and URL Integration', () => { // checks proxy flow from URL to headers
    // verifies should process URL and calculate content length for API request
    test('should process URL and calculate content length for API request', () => {
      const url = 'api.example.com/users';
      const body = { name: 'John', email: 'john@example.com' };
      
      // Process URL
      const processedUrl = ensureProtocol(url);
      expect(processedUrl).toBe('https://api.example.com/users'); // ensure protocol added
      
      // Calculate content length for request body
      const contentLength = calculateContentLength(body);
      expect(contentLength).toBe(Buffer.byteLength(JSON.stringify(body), 'utf8').toString()); // compare calculated length
      
      // Build clean headers
      const headers = buildCleanHeaders({
        'content-type': 'application/json',
        'host': 'evil.com'
      }, 'POST', body);
      
      expect(headers['content-length']).toBe(contentLength); // header set correctly
      expect(headers['host']).toBeUndefined(); // host stripped
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
      expect(normalizedOrigins[0]).toBe('https://api.example.com'); // https url normalized
      expect(normalizedOrigins[1]).toBe('https://api.example.com'); // missing protocol normalized
      expect(normalizedOrigins[2]).toBe('http://api.example.com'); // http kept
      
      // Headers should be clean for any method
      const headers = buildCleanHeaders({
        'authorization': 'Bearer token',
        'x-target-url': normalizedOrigins[0]
      }, 'GET', null);
      
      expect(headers['authorization']).toBe('Bearer token'); // auth header kept
      expect(headers['x-target-url']).toBeUndefined(); // target url stripped
    });
  });

  describe('Validation and Authentication Integration', () => { // confirms auth and validation interplay
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
      expect(isAuth).toBe(true); // authentication succeeded
      
      // Then validate required fields
      const isValid = requireFields(mockAuthReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(isValid).toBe(true); // fields valid
      expect(mockRes.status).not.toHaveBeenCalled(); // no error status
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
      expect(isAuth).toBe(false); // authentication fails
      
      // Fields are valid but auth failed
      const isValid = requireFields(mockUnauthReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(isValid).toBe(true); // fields still valid
    });
  });

  describe('DateTime and HTTP Integration', () => { // ensures date helpers feed HTTP responses
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
      
      expect(mockRes.status).toHaveBeenCalledWith(200); // success status returned
      expect(mockRes.json).toHaveBeenCalledWith(responseData); // response payload returned
      expect(formattedStart).not.toBe('N/A'); // date formatted
      expect(duration).toBe('01:30:45'); // duration calculation
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

  describe('Complete Request Processing Workflow', () => { // simulates real API request lifecycle
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
      expect(cleanHeaders['authorization']).toBe('Bearer valid-token'); // auth header kept
      expect(cleanHeaders['host']).toBeUndefined(); // host removed for proxying
      expect(cleanHeaders['x-target-url']).toBeUndefined(); // internal header removed
      
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
      
      expect(mockRes.status).toHaveBeenCalledWith(201); // return created status
      expect(mockRes.json).toHaveBeenCalledWith(responseData); // send data
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
      expect(checkPassportAuth(mockReq)).toBe(true); // auth check passes
      
      // Validation fails
      const fieldsValid = requireFields(mockReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(fieldsValid).toBe(false); // validation fails
      expect(mockRes.status).toHaveBeenCalledWith(400); // 400 returned
      expect(mockRes.json).toHaveBeenCalledWith({ // error payload returned
        error: 'Missing required fields',
        missing: ['content']
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
      expect(checkPassportAuth(mockReq)).toBe(false); // authentication failure
      
      // Even though fields are valid, auth failed
      const fieldsValid = requireFields(mockReq.body, ['title', 'content'], mockRes); // (reordered parameters to match obj, fields, res)
      expect(fieldsValid).toBe(true); // fields still valid despite auth failure
      
      // In a real app, we'd return 401 for auth failure before validating fields
    });
  });

  describe('Environment and Configuration Integration', () => { // checks env utilities with other modules
    let originalEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      delete process.env.TEST_API_URL;
      delete process.env.TEST_TIMEOUT;
      delete process.env.FEATURE_ENABLED;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    // verifies should integrate environment validation with URL processing
    test('should integrate environment validation with URL processing', () => {
      process.env.TEST_API_URL = 'api.example.com/v1';
      process.env.TEST_TIMEOUT = '5000';
      
      // Check required environment variables
      const missing = requireEnvVars(['TEST_API_URL', 'TEST_TIMEOUT', 'MISSING_VAR']);
      expect(missing).toEqual(['MISSING_VAR']); // only one missing
      
      // Process environment URL with URL utilities
      const apiUrl = getEnvVar('TEST_API_URL', 'localhost:3000');
      const processedUrl = ensureProtocol(apiUrl);
      const normalizedUrl = normalizeUrlOrigin(processedUrl);
      
      expect(processedUrl).toBe('https://api.example.com/v1'); // protocol added
      expect(normalizedUrl).toBe('https://api.example.com'); // normalized origin
    });

    // verifies should use environment variables for HTTP configuration
    test('should use environment variables for HTTP configuration', () => {
      process.env.API_TIMEOUT = '10000';
      process.env.MAX_RETRIES = '3';
      
      const timeout = getEnvVar('API_TIMEOUT', '5000');
      const retries = getEnvVar('MAX_RETRIES', '1');
      const debugMode = hasEnvVar('DEBUG_MODE'); // not set
      
      expect(timeout).toBe('10000'); // environment value used
      expect(retries).toBe('3'); // environment value used
      expect(debugMode).toBe(false); // feature disabled
      
      // Use configuration values in HTTP context
      const headers = buildCleanHeaders({
        'x-timeout': timeout,
        'x-max-retries': retries,
        'x-debug': debugMode.toString()
      }, 'GET');
      
      expect(headers['x-timeout']).toBe('10000');
      expect(headers['x-max-retries']).toBe('3');
      expect(headers['x-debug']).toBe('false');
    });

    // verifies should handle startup validation with response utilities
    test('should handle startup validation with response utilities', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Simulate startup validation
      const requiredVars = ['DATABASE_URL', 'API_KEY', 'SECRET_KEY'];
      const missing = requireEnvVars(requiredVars);
      
      expect(missing).toEqual(requiredVars); // all missing in test
      
      // Send startup error using response utilities
      if (missing.length > 0) {
        utils.sendServerError(mockRes, 'Configuration error: missing environment variables', 
          new Error(`Missing: ${missing.join(', ')}`), 'startup-validation');
      }
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Configuration error: missing environment variables'
      });
    });

    // verifies should support feature flags with conditional logic
    test('should support feature flags with conditional logic', () => {
      process.env.FEATURE_ANALYTICS = 'enabled';
      process.env.FEATURE_CACHE = ''; // empty string = disabled
      
      const analyticsEnabled = hasEnvVar('FEATURE_ANALYTICS');
      const cacheEnabled = hasEnvVar('FEATURE_CACHE');
      const debugEnabled = hasEnvVar('FEATURE_DEBUG'); // missing
      
      expect(analyticsEnabled).toBe(true); // feature enabled
      expect(cacheEnabled).toBe(false); // empty string disabled
      expect(debugEnabled).toBe(false); // missing disabled
      
      // Use feature flags in request processing
      const mockReq = {
        headers: { 'user-agent': 'test-client' },
        body: { action: 'track-event' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Conditional processing based on feature flags
      let responseData = { success: true };
      
      if (analyticsEnabled) {
        responseData.analytics = { event: 'tracked', timestamp: formatDateTime(new Date().toISOString()) };
      }
      
      if (cacheEnabled) {
        responseData.cached = true;
      }
      
      if (debugEnabled) {
        responseData.debug = { headers: mockReq.headers };
      }
      
      utils.sendJsonResponse(mockRes, 200, responseData);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        analytics: expect.objectContaining({
          event: 'tracked',
          timestamp: expect.any(String)
        })
        // cached and debug should not be present
      });
    });
  });
});

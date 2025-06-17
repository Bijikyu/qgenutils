
// Integration tests covering how individual utilities interact when combined in
// typical request workflows. The focus here is cross-module cooperation rather
// than isolated unit behavior.
const utils = require('../../index');
const { 
  formatDateTime, 
  formatDuration,
  addDays,
  calculateContentLength, 
  buildCleanHeaders,
  ensureProtocol,
  normalizeUrlOrigin,
  requireFields,
  checkPassportAuth,
  requireEnvVars,
  hasEnvVar,
  getEnvVar,
  makeCopyFn,
  isClipboardSupported,
  isBrowser,
  createBroadcastRegistry,
  createPaymentBroadcastRegistry,
  createSocketBroadcastRegistry,
  validateBroadcastData
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
      
      // Step 6: Format timestamps and calculate expiration
      const formattedDate = formatDateTime(mockReq.body.published_at);
      const expirationDate = addDays(90); // Calculate 90-day expiration
      
      // Step 7: Send successful response
      const responseData = {
        id: 123,
        title: mockReq.body.title,
        published_at: formattedDate,
        expires_at: formatDateTime(expirationDate.toISOString()),
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

  describe('Browser and Environment Integration', () => { // checks browser utilities with other modules
    let originalWindow, originalNavigator, originalDocument, originalEnv;

    beforeEach(() => {
      originalWindow = global.window;
      originalNavigator = global.navigator;
      originalDocument = global.document;
      originalEnv = { ...process.env };
      
      // Clear test environment variables
      delete process.env.ENABLE_CLIPBOARD;
      delete process.env.CLIENT_FEATURES;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.navigator = originalNavigator;
      global.document = originalDocument;
      process.env = originalEnv;
    });

    // verifies should integrate environment variables with browser feature detection
    test('should integrate environment variables with browser feature detection', () => {
      process.env.ENABLE_CLIPBOARD = 'true';
      process.env.CLIENT_FEATURES = 'copy,paste,share';
      
      // Check environment configuration
      const clipboardEnabled = hasEnvVar('ENABLE_CLIPBOARD');
      const clientFeatures = getEnvVar('CLIENT_FEATURES', '');
      
      expect(clipboardEnabled).toBe(true); // clipboard enabled via env
      expect(clientFeatures).toBe('copy,paste,share'); // features configured
      
      // Setup browser environment
      global.window = { isSecureContext: true };
      global.document = {};
      global.navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue()
        }
      };
      
      // Check browser capabilities
      const browserDetected = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      expect(browserDetected).toBe(true); // browser environment
      expect(clipboardSupported).toBe(true); // clipboard API available
      
      // Enable features based on both environment config and browser support
      const enableClipboardFeature = clipboardEnabled && browserDetected && clipboardSupported;
      expect(enableClipboardFeature).toBe(true); // all conditions met
    });

    // verifies should handle browser utilities in server environment with env config
    test('should handle browser utilities in server environment with env config', () => {
      process.env.CLIENT_FEATURES = 'clipboard,notifications';
      
      // Server environment (no browser globals)
      global.window = undefined;
      global.document = undefined;
      global.navigator = undefined;
      
      const clientFeatures = getEnvVar('CLIENT_FEATURES', '');
      const browserDetected = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      expect(clientFeatures).toBe('clipboard,notifications'); // env config available
      expect(browserDetected).toBe(false); // server environment
      expect(clipboardSupported).toBe(false); // no browser APIs
      
      // Should still be able to create copy function for potential client use
      const mockSetMsg = jest.fn();
      const mockSetCode = jest.fn();
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      expect(typeof copyFn).toBe('function'); // function created
      
      // But it would fail gracefully when called in server context
      // This enables code that works in both environments
    });

    // verifies should integrate browser detection with response utilities
    test('should integrate browser detection with response utilities', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Simulate API endpoint that returns client capabilities
      const browserDetected = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      const clientCapabilities = {
        environment: browserDetected ? 'browser' : 'server',
        clipboard: clipboardSupported,
        features: {
          copy: clipboardSupported,
          environmentVariables: hasEnvVar('NODE_ENV')
        }
      };
      
      utils.sendJsonResponse(mockRes, 200, {
        capabilities: clientCapabilities,
        timestamp: formatDateTime(new Date().toISOString())
      });
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        capabilities: expect.objectContaining({
          environment: expect.any(String),
          clipboard: expect.any(Boolean),
          features: expect.any(Object)
        }),
        timestamp: expect.any(String)
      });
    });

    // verifies should handle clipboard operations with validation and logging
    test('should handle clipboard operations with validation and logging', async () => {
      // Setup browser environment
      global.window = { isSecureContext: true };
      global.document = {};
      global.navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue()
        }
      };
      
      const mockReq = {
        body: {
          text: 'Hello, World!',
          target: 'button-1'
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Validate required fields
      const fieldsValid = requireFields(mockReq.body, ['text', 'target'], mockRes);
      expect(fieldsValid).toBe(true); // validation passes
      
      // Check browser and clipboard support
      const browserSupported = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      if (browserSupported && clipboardSupported) {
        // Create copy function and simulate usage
        const messages = [];
        const codes = [];
        
        const copyFn = makeCopyFn(
          (msg) => messages.push(msg),
          (code) => codes.push(code)
        );
        
        await copyFn(mockReq.body.text, mockReq.body.target);
        
        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('Hello, World!');
        expect(messages).toContain('Copied to clipboard');
        expect(codes).toContain('button-1');
        
        // Send success response
        utils.sendJsonResponse(mockRes, 200, {
          success: true,
          operation: 'clipboard-copy',
          timestamp: formatDateTime(new Date().toISOString())
        });
      } else {
        // Send error response for unsupported environment
        utils.sendValidationError(mockRes, 'Clipboard not supported in this environment');
      }
      
      expect(mockRes.status).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
    });

    // verifies should handle environment-based feature configuration
    test('should handle environment-based feature configuration', () => {
      process.env.BROWSER_FEATURES = 'clipboard,geolocation,notifications';
      process.env.SECURE_CONTEXT_REQUIRED = 'true';
      
      const configuredFeatures = getEnvVar('BROWSER_FEATURES', '').split(',');
      const secureRequired = getEnvVar('SECURE_CONTEXT_REQUIRED', 'false') === 'true';
      
      expect(configuredFeatures).toContain('clipboard'); // clipboard configured
      expect(secureRequired).toBe(true); // security requirement set
      
      // Setup browser environment based on configuration
      global.window = { isSecureContext: secureRequired };
      global.document = {};
      global.navigator = configuredFeatures.includes('clipboard') ? {
        clipboard: { writeText: jest.fn() }
      } : {};
      
      const browserDetected = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      expect(browserDetected).toBe(true); // browser environment
      expect(clipboardSupported).toBe(secureRequired); // clipboard support matches security requirement
      
      // Feature availability should match configuration and environment
      const availableFeatures = {
        clipboard: configuredFeatures.includes('clipboard') && clipboardSupported,
        browser: browserDetected
      };
      
      expect(availableFeatures.clipboard).toBe(true); // clipboard available
      expect(availableFeatures.browser).toBe(true); // browser available
    });
  });

  describe('Real-time and Environment Integration', () => { // checks real-time utilities with other modules
    let originalEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      delete process.env.SOCKET_ENABLED;
      delete process.env.BROADCAST_VALIDATION;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    // verifies should integrate environment config with broadcast registry
    test('should integrate environment config with broadcast registry', () => {
      process.env.SOCKET_ENABLED = 'true';
      process.env.BROADCAST_VALIDATION = 'strict';
      
      const socketEnabled = hasEnvVar('SOCKET_ENABLED');
      const validationLevel = getEnvVar('BROADCAST_VALIDATION', 'basic');
      
      expect(socketEnabled).toBe(true); // socket feature enabled
      expect(validationLevel).toBe('strict'); // strict validation configured
      
      // Create registry based on environment configuration
      if (socketEnabled) {
        const registry = createPaymentBroadcastRegistry();
        
        expect(registry.broadcastOutcome).toBeNull(); // registry created
        expect(registry.broadcastUsageUpdate).toBeNull(); // standard functions available
        expect(registry.allFunctionsReady()).toBe(false); // not yet initialized
        
        // Simulate configuration-aware broadcast function
        registry.broadcastOutcome = (data) => {
          if (validationLevel === 'strict') {
            const validation = validateBroadcastData(data, { maxSize: 32768 }); // smaller limit for strict
            if (!validation.isValid) {
              throw new Error(`Strict validation failed: ${validation.errors.join(', ')}`);
            }
          }
          return { broadcast: 'sent', data };
        };
        
        // Test strict validation
        expect(() => {
          registry.broadcastOutcome({ content: 'x'.repeat(40000) }); // exceeds strict limit
        }).toThrow('Strict validation failed');
        
        // Test valid data
        const result = registry.broadcastOutcome({ status: 'success' });
        expect(result.broadcast).toBe('sent');
      }
    });

    // verifies should integrate broadcast validation with response utilities
    test('should integrate broadcast validation with response utilities', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      const mockReq = {
        body: {
          eventType: 'payment_success',
          data: { amount: 100, currency: 'USD' }
        }
      };
      
      // Validate required fields for broadcast request
      const fieldsValid = requireFields(mockReq.body, ['eventType', 'data'], mockRes);
      expect(fieldsValid).toBe(true); // validation passes
      
      // Validate broadcast data
      const broadcastValidation = validateBroadcastData(mockReq.body.data);
      expect(broadcastValidation.isValid).toBe(true); // broadcast data valid
      
      // Create registry and simulate broadcast
      const registry = createBroadcastRegistry({
        functions: ['broadcastEvent']
      });
      
      let broadcastResult = null;
      registry.broadcastEvent = (data) => {
        broadcastResult = { timestamp: formatDateTime(new Date().toISOString()), ...data };
        return broadcastResult;
      };
      
      if (registry.broadcastEvent && broadcastValidation.isValid) {
        const result = registry.broadcastEvent(mockReq.body.data);
        
        utils.sendJsonResponse(mockRes, 200, {
          success: true,
          broadcast: result,
          validation: 'passed'
        });
      } else {
        utils.sendValidationError(mockRes, 'Broadcast validation failed', {
          errors: broadcastValidation.errors
        });
      }
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        broadcast: expect.objectContaining({
          amount: 100,
          currency: 'USD',
          timestamp: expect.any(String)
        }),
        validation: 'passed'
      });
    });

    // verifies should handle URL-based broadcast targets
    test('should handle URL-based broadcast targets', () => {
      const rawUrls = [
        'websocket.example.com/events',
        'https://socket.service.com/broadcast',
        'wss://realtime.app.com:8080/live'
      ];
      
      // Process URLs for broadcast targets
      const processedTargets = rawUrls.map(url => {
        const withProtocol = ensureProtocol(url);
        const normalized = normalizeUrlOrigin(withProtocol);
        return {
          original: url,
          processed: withProtocol,
          origin: normalized
        };
      });
      
      expect(processedTargets[0].processed).toBe('https://websocket.example.com/events');
      expect(processedTargets[1].processed).toBe('https://socket.service.com/broadcast');
      expect(processedTargets[2].processed).toBe('wss://realtime.app.com:8080/live');
      
      // Create registry with URL-aware broadcast functions
      const registry = createBroadcastRegistry({
        functions: ['broadcastToTarget']
      });
      
      const broadcastHistory = [];
      registry.broadcastToTarget = (data, targetUrl) => {
        const validation = validateBroadcastData(data);
        if (validation.isValid) {
          const target = processedTargets.find(t => t.processed === targetUrl);
          broadcastHistory.push({
            data,
            target: target ? target.origin : targetUrl,
            timestamp: formatDateTime(new Date().toISOString())
          });
        }
      };
      
      // Test broadcasts to different targets
      registry.broadcastToTarget(
        { event: 'update' }, 
        'https://websocket.example.com/events'
      );
      
      expect(broadcastHistory).toHaveLength(1);
      expect(broadcastHistory[0].target).toBe('https://websocket.example.com');
    });

    // verifies should support authentication-aware broadcasts
    test('should support authentication-aware broadcasts', () => {
      const mockReq = {
        user: { id: '123', role: 'user' },
        isAuthenticated: jest.fn().mockReturnValue(true),
        body: { message: 'Hello World', channel: 'general' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Check authentication
      const isAuthenticated = checkPassportAuth(mockReq);
      expect(isAuthenticated).toBe(true); // user authenticated
      
      if (isAuthenticated) {
        // Validate message fields
        const fieldsValid = requireFields(mockReq.body, ['message', 'channel'], mockRes);
        expect(fieldsValid).toBe(true);
        
        // Create authenticated broadcast data
        const broadcastData = {
          ...mockReq.body,
          userId: mockReq.user.id,
          userRole: mockReq.user.role,
          timestamp: formatDateTime(new Date().toISOString())
        };
        
        // Validate broadcast data
        const validation = validateBroadcastData(broadcastData);
        expect(validation.isValid).toBe(true);
        
        // Create registry and broadcast
        const registry = createBroadcastRegistry({
          functions: ['broadcastMessage']
        });
        
        const messageHistory = [];
        registry.broadcastMessage = (data) => {
          messageHistory.push(data);
        };
        
        if (registry.broadcastMessage && validation.isValid) {
          registry.broadcastMessage(broadcastData);
          
          utils.sendJsonResponse(mockRes, 200, {
            success: true,
            messageId: Date.now(),
            broadcast: 'sent'
          });
        }
        
        expect(messageHistory).toHaveLength(1);
        expect(messageHistory[0]).toEqual(expect.objectContaining({
          message: 'Hello World',
          channel: 'general',
          userId: '123',
          userRole: 'user'
        }));
      }
    });

    // verifies should handle broadcast errors gracefully
    test('should handle broadcast errors gracefully', () => {
      const registry = createPaymentBroadcastRegistry();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      // Simulate failing broadcast function
      registry.broadcastOutcome = (data) => {
        throw new Error('Socket connection lost');
      };
      
      const paymentData = { status: 'success', amount: 100 };
      
      try {
        registry.broadcastOutcome(paymentData);
      } catch (error) {
        // Handle broadcast failure gracefully
        utils.sendServerError(mockRes, 'Broadcast failed', error, 'payment-broadcast');
      }
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Broadcast failed'
      });
    });
  });
});

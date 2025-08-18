// Simplified integration tests focusing only on functions that actually exist
const utils = require('../../index');
const { 
  formatDateTime, 
  formatDuration,
  addDays,
  ensureProtocol,
  normalizeUrlOrigin,
  requireFields,
  checkPassportAuth,
  requireEnvVars,
  hasEnvVar,
  getEnvVar,
  makeCopyFn,
  createBroadcastRegistry,
  generateExecutionId
} = utils;

describe('Clean Module Integration Tests', () => { 
  describe('URL Processing Integration', () => { 
    test('should process URL with different protocols', () => {
      const url = 'api.example.com/users';
      
      // Process URL
      const processedUrl = ensureProtocol(url);
      expect(processedUrl).toBe('https://api.example.com/users');
    });

    test('should normalize URLs consistently', () => {
      const url1 = 'HTTPS://API.Example.com/v1';
      const url3 = 'HTTP://api.example.com/v1';
      
      const normalized1 = normalizeUrlOrigin(url1);
      const normalized3 = normalizeUrlOrigin(url3);
      
      expect(normalized1).toBe('https://api.example.com');
      expect(normalized3).toBe('http://api.example.com');
    });
  });

  describe('DateTime Integration', () => {
    test('should integrate datetime formatting with validation', () => {
      const testData = { 
        event: 'user-login',
        timestamp: '2023-12-25T10:00:00.000Z'
      };
      
      // Validate required fields
      const validation = requireFields(testData, ['event', 'timestamp']);
      expect(validation).toBe(true);
      
      // Format timestamp
      const formattedTime = formatDateTime(testData.timestamp);
      expect(formattedTime).toBe('12/25/2023, 10:00:00 AM');
      
      // Generate execution ID
      const processingId = generateExecutionId();
      expect(processingId).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });

  describe('Environment and Configuration Integration', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('should integrate environment validation', () => {
      // Set test environment variables
      process.env.NODE_ENV = 'test';
      process.env.API_TIMEOUT = '30000';
      
      // Check environment variables
      const nodeEnv = getEnvVar('NODE_ENV', 'development');
      const timeout = getEnvVar('API_TIMEOUT', '5000');
      
      expect(nodeEnv).toBe('test');
      expect(timeout).toBe('30000');
      
      // Test environment checking
      const hasNodeEnv = hasEnvVar('NODE_ENV');
      expect(hasNodeEnv).toBe(true);
    });
  });

  describe('ID Generation Integration', () => {
    test('should generate unique execution IDs', () => {
      const id1 = generateExecutionId();
      const id2 = generateExecutionId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-zA-Z0-9_-]+$/);
      expect(id2).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });
});
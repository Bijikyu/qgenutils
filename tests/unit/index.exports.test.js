// Unit tests verifying top-level exports from index.js are accessible. Keeping
// this coverage ensures that when new utilities are added they remain exposed
// via the main entry point so external consumers do not break.
const indexExports = require('../../index');

describe('Index Exports', () => { // guards against accidental export removal
  // verifies should include response utility exports


  // verifies should include environment utility exports
  test('should include environment utility exports', () => {
    expect(indexExports.requireEnvVars).toBeDefined(); // verify export exists
    expect(indexExports.hasEnvVar).toBeDefined(); // verify export exists
    expect(indexExports.getEnvVar).toBeDefined(); // verify export exists
  });

  // verifies all expected utility categories are exported
  test('should include all expected utility categories', () => {
    // DateTime utilities (existing and enhanced)
    expect(indexExports.formatDateTime).toBeDefined();
    expect(indexExports.formatDuration).toBeDefined();
    expect(indexExports.addDays).toBeDefined();
    expect(indexExports.formatDate).toBeDefined();
    expect(indexExports.formatDateWithPrefix).toBeDefined();

    

    
    // URL utilities
    expect(indexExports.ensureProtocol).toBeDefined();
    expect(indexExports.normalizeUrlOrigin).toBeDefined();
    expect(indexExports.stripProtocol).toBeDefined();
    expect(indexExports.parseUrlParts).toBeDefined();
    
    // Validation utilities
    expect(indexExports.requireFields).toBeDefined();
    
    // Authentication utilities
    expect(indexExports.checkPassportAuth).toBeDefined();
    expect(indexExports.hasGithubStrategy).toBeDefined();
    
    // View utilities
    expect(indexExports.renderView).toBeDefined();
    
    // Environment utilities
    expect(indexExports.requireEnvVars).toBeDefined();
    expect(indexExports.hasEnvVar).toBeDefined();
    expect(indexExports.getEnvVar).toBeDefined();
    
    // Browser utilities
    expect(indexExports.makeCopyFn).toBeDefined();

    
    // Real-time communication utilities
    expect(indexExports.createBroadcastRegistry).toBeDefined();

    
    // ID generation utilities
    expect(indexExports.generateExecutionId).toBeDefined();
    
    // String sanitization utilities
    expect(indexExports.sanitizeString).toBeDefined();
    
    // GitHub validation utilities
    expect(indexExports.validateGitHubUrl).toBeDefined();
    
    // Advanced validation utilities
    expect(indexExports.validateEmail).toBeDefined();
    expect(indexExports.validateRequired).toBeDefined();
    
    // File utilities
    expect(indexExports.formatFileSize).toBeDefined();
    
    // Worker pool utilities
    expect(indexExports.createWorkerPool).toBeDefined();
    
    // Shutdown utilities
    expect(indexExports.createShutdownManager).toBeDefined();
    expect(indexExports.gracefulShutdown).toBeDefined();
    
    // Input validation utilities
    expect(indexExports.isValidObject).toBeDefined();
    expect(indexExports.isValidString).toBeDefined();
    expect(indexExports.hasMethod).toBeDefined();

    
    // Logger
    expect(indexExports.logger).toBeDefined();
  });

  // verifies environment utilities have correct function signatures
  test('should have correct function signatures for environment utilities', () => {
    expect(typeof indexExports.requireEnvVars).toBe('function');
    expect(typeof indexExports.hasEnvVar).toBe('function'); 
    expect(typeof indexExports.getEnvVar).toBe('function');
  });

  // verifies browser utilities have correct function signatures
  test('should have correct function signatures for browser utilities', () => {
    expect(typeof indexExports.makeCopyFn).toBe('function');

  });

  // verifies real-time utilities have correct function signatures
  test('should have correct function signatures for real-time utilities', () => {
    expect(typeof indexExports.createBroadcastRegistry).toBe('function');

  });

  // verifies ID generation utilities have correct function signatures
  test('should have correct function signatures for ID generation utilities', () => {
    expect(typeof indexExports.generateExecutionId).toBe('function');
  });

  // verifies enhanced datetime utilities have correct function signatures
  test('should have correct function signatures for enhanced datetime utilities', () => {
    expect(typeof indexExports.formatDate).toBe('function');
    expect(typeof indexExports.formatDateWithPrefix).toBe('function');

  });

  // verifies string sanitization utilities have correct function signatures
  test('should have correct function signatures for string utilities', () => {
    expect(typeof indexExports.sanitizeString).toBe('function');
  });

  // verifies GitHub validation utilities have correct function signatures
  test('should have correct function signatures for GitHub validation utilities', () => {
    expect(typeof indexExports.validateGitHubUrl).toBe('function');
  });

  // verifies advanced validation utilities have correct function signatures
  test('should have correct function signatures for advanced validation utilities', () => {
    expect(typeof indexExports.validateEmail).toBe('function');
    expect(typeof indexExports.validateRequired).toBe('function');
  });

  // verifies file utilities have correct function signatures
  test('should have correct function signatures for file utilities', () => {
    expect(typeof indexExports.formatFileSize).toBe('function');
  });

  // verifies worker pool utilities have correct function signatures
  test('should have correct function signatures for worker pool utilities', () => {
    expect(typeof indexExports.createWorkerPool).toBe('function');
  });

  // verifies shutdown utilities have correct function signatures
  test('should have correct function signatures for shutdown utilities', () => {
    expect(typeof indexExports.createShutdownManager).toBe('function');
    expect(typeof indexExports.gracefulShutdown).toBe('function');
  });
});

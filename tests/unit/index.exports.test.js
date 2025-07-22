// Unit tests verifying top-level exports from index.js are accessible. Keeping
// this coverage ensures that when new utilities are added they remain exposed
// via the main entry point so external consumers do not break.
const indexExports = require('../../index');

describe('Index Exports', () => { // guards against accidental export removal
  // verifies should include response utility exports
  test('should include response utility exports', () => {
    expect(indexExports.sendValidationError).toBeDefined(); // verify export exists
    expect(indexExports.sendAuthError).toBeDefined(); // verify export exists
    expect(indexExports.sendServerError).toBeDefined(); // verify export exists
  });

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
    expect(indexExports.formatTimestamp).toBeDefined();
    expect(indexExports.formatRelativeTime).toBeDefined();
    expect(indexExports.formatExecutionDuration).toBeDefined();
    expect(indexExports.formatCompletionDate).toBeDefined();
    
    // HTTP utilities
    expect(indexExports.calculateContentLength).toBeDefined();
    expect(indexExports.buildCleanHeaders).toBeDefined();
    expect(indexExports.getRequiredHeader).toBeDefined();
    
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
    expect(indexExports.registerViewRoute).toBeDefined();
    
    // Environment utilities
    expect(indexExports.requireEnvVars).toBeDefined();
    expect(indexExports.hasEnvVar).toBeDefined();
    expect(indexExports.getEnvVar).toBeDefined();
    
    // Browser utilities
    expect(indexExports.makeCopyFn).toBeDefined();
    expect(indexExports.isClipboardSupported).toBeDefined();
    expect(indexExports.isBrowser).toBeDefined();
    
    // Real-time communication utilities
    expect(indexExports.createBroadcastRegistry).toBeDefined();
    expect(indexExports.createPaymentBroadcastRegistry).toBeDefined();
    expect(indexExports.createSocketBroadcastRegistry).toBeDefined();
    expect(indexExports.validateBroadcastData).toBeDefined();
    
    // ID generation utilities
    expect(indexExports.generateExecutionId).toBeDefined();
    expect(indexExports.generateTaskId).toBeDefined();
    expect(indexExports.generateSecureId).toBeDefined();
    expect(indexExports.generateSimpleId).toBeDefined();
    
    // String sanitization utilities
    expect(indexExports.sanitizeString).toBeDefined();
    expect(indexExports.sanitizeErrorMessage).toBeDefined();
    expect(indexExports.sanitizeForHtml).toBeDefined();
    expect(indexExports.validatePagination).toBeDefined();
    
    // GitHub validation utilities
    expect(indexExports.validateGitHubUrl).toBeDefined();
    expect(indexExports.extractGitHubInfo).toBeDefined();
    expect(indexExports.validateGitHubRepo).toBeDefined();
    expect(indexExports.validateGitHubUrlDetailed).toBeDefined();
    
    // Advanced validation utilities
    expect(indexExports.validateEmail).toBeDefined();
    expect(indexExports.validateRequired).toBeDefined();
    expect(indexExports.validateMaxLength).toBeDefined();
    expect(indexExports.validateSelection).toBeDefined();
    expect(indexExports.combineValidations).toBeDefined();
    expect(indexExports.validateObjectId).toBeDefined();
    
    // File utilities
    expect(indexExports.formatFileSize).toBeDefined();
    
    // Worker pool utilities
    expect(indexExports.createWorkerPool).toBeDefined();
    
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
    expect(typeof indexExports.isClipboardSupported).toBe('function');
    expect(typeof indexExports.isBrowser).toBe('function');
  });

  // verifies real-time utilities have correct function signatures
  test('should have correct function signatures for real-time utilities', () => {
    expect(typeof indexExports.createBroadcastRegistry).toBe('function');
    expect(typeof indexExports.createPaymentBroadcastRegistry).toBe('function');
    expect(typeof indexExports.createSocketBroadcastRegistry).toBe('function');
    expect(typeof indexExports.validateBroadcastData).toBe('function');
  });

  // verifies ID generation utilities have correct function signatures
  test('should have correct function signatures for ID generation utilities', () => {
    expect(typeof indexExports.generateExecutionId).toBe('function');
    expect(typeof indexExports.generateTaskId).toBe('function');
    expect(typeof indexExports.generateSecureId).toBe('function');
    expect(typeof indexExports.generateSimpleId).toBe('function');
  });

  // verifies enhanced datetime utilities have correct function signatures
  test('should have correct function signatures for enhanced datetime utilities', () => {
    expect(typeof indexExports.formatDate).toBe('function');
    expect(typeof indexExports.formatDateWithPrefix).toBe('function');
    expect(typeof indexExports.formatTimestamp).toBe('function');
    expect(typeof indexExports.formatRelativeTime).toBe('function');
    expect(typeof indexExports.formatExecutionDuration).toBe('function');
    expect(typeof indexExports.formatCompletionDate).toBe('function');
  });

  // verifies string sanitization utilities have correct function signatures
  test('should have correct function signatures for string utilities', () => {
    expect(typeof indexExports.sanitizeString).toBe('function');
    expect(typeof indexExports.sanitizeErrorMessage).toBe('function');
    expect(typeof indexExports.sanitizeForHtml).toBe('function');
    expect(typeof indexExports.validatePagination).toBe('function');
  });

  // verifies GitHub validation utilities have correct function signatures
  test('should have correct function signatures for GitHub validation utilities', () => {
    expect(typeof indexExports.validateGitHubUrl).toBe('function');
    expect(typeof indexExports.extractGitHubInfo).toBe('function');
    expect(typeof indexExports.validateGitHubRepo).toBe('function');
    expect(typeof indexExports.validateGitHubUrlDetailed).toBe('function');
  });

  // verifies advanced validation utilities have correct function signatures
  test('should have correct function signatures for advanced validation utilities', () => {
    expect(typeof indexExports.validateEmail).toBe('function');
    expect(typeof indexExports.validateRequired).toBe('function');
    expect(typeof indexExports.validateMaxLength).toBe('function');
    expect(typeof indexExports.validateSelection).toBe('function');
    expect(typeof indexExports.combineValidations).toBe('function');
    expect(typeof indexExports.validateObjectId).toBe('function');
  });

  // verifies file utilities have correct function signatures
  test('should have correct function signatures for file utilities', () => {
    expect(typeof indexExports.formatFileSize).toBe('function');
  });

  // verifies worker pool utilities have correct function signatures
  test('should have correct function signatures for worker pool utilities', () => {
    expect(typeof indexExports.createWorkerPool).toBe('function');
  });
});

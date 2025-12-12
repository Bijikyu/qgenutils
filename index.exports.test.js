// Unit tests verifying top-level exports from index.js are accessible. Keeping
// this coverage ensures that when new utilities are added they remain exposed
// via the main entry point so external consumers do not break.
const indexExports = require('./index');

describe('Index Exports', () => {
  test('should include all expected utility categories', () => {
    // DateTime utilities
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

    // ID generation utilities
    expect(indexExports.generateExecutionId).toBeDefined();

    // String sanitization utilities
    expect(indexExports.sanitizeString).toBeDefined();

    // File utilities
    expect(indexExports.formatFileSize).toBeDefined();

    // Logger
    expect(indexExports.logger).toBeDefined();
  });

  test('should have correct function signatures for datetime utilities', () => {
    expect(typeof indexExports.formatDate).toBe('function');
    expect(typeof indexExports.formatDateWithPrefix).toBe('function');
  });

  test('should have correct function signatures for string utilities', () => {
    expect(typeof indexExports.sanitizeString).toBe('function');
  });

  test('should have correct function signatures for file utilities', () => {
    expect(typeof indexExports.formatFileSize).toBe('function');
  });

  test('should have correct function signatures for ID generation utilities', () => {
    expect(typeof indexExports.generateExecutionId).toBe('function');
  });
});

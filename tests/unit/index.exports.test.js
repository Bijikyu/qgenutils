// Unit tests verifying top-level exports from index.js are accessible
const indexExports = require('../index');

describe('Index Exports', () => {
  // verifies should include new response utility exports
  test('should include new response utility exports', () => {
    expect(indexExports.sendValidationError).toBeDefined();
    expect(indexExports.sendAuthError).toBeDefined();
    expect(indexExports.sendServerError).toBeDefined();
  });
});

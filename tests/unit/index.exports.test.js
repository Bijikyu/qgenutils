// Unit tests verifying top-level exports from index.js are accessible. Keeping
// this coverage ensures that when new utilities are added they remain exposed
// via the main entry point so external consumers do not break.
const indexExports = require('../index');

describe('Index Exports', () => {
  // verifies should include new response utility exports
  test('should include new response utility exports', () => {
    expect(indexExports.sendValidationError).toBeDefined();
    expect(indexExports.sendAuthError).toBeDefined();
    expect(indexExports.sendServerError).toBeDefined();
  });
});

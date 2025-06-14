// Unit tests verifying top-level exports from index.js are accessible. Keeping
// this coverage ensures that when new utilities are added they remain exposed
// via the main entry point so external consumers do not break.
const indexExports = require('../index');

describe('Index Exports', () => { // guards against accidental export removal
  // verifies should include new response utility exports
  test('should include new response utility exports', () => {
    expect(indexExports.sendValidationError).toBeDefined(); // verify export exists
    expect(indexExports.sendAuthError).toBeDefined(); // verify export exists
    expect(indexExports.sendServerError).toBeDefined(); // verify export exists
  });
});

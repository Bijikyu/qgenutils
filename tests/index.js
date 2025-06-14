// Re-export the library's main entry point for use in tests. This wrapper keeps
// require paths short inside the unit and integration test files.
module.exports = require('../index'); // expose library entry point to unit tests

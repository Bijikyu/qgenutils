
// Jest configuration for QGenUtils test suite. This file defines how tests are
// discovered, the coverage requirements, and other runtime behaviors for Jest.
export default {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns - only test compiled JavaScript files, exclude TypeScript
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    'lib/**/*.test.js',
    'lib/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Transform TypeScript files using babel
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },

  // Ignore node_modules and dist folders from transformation
  transformIgnorePatterns: [
    'node_modules/(?!(qgenutils)/',
    'dist/'
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'lib/**/*.js',
    'index.js',
    'index-core.js',
    'index-tree-shakable.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],

  // Module paths
  modulePathIgnorePatterns: ['<rootDir>/coverage/'],

  // Test timeout
  testTimeout: 10000,

  // Parallel test execution for scalability
  maxWorkers: '50%',

  // Enable test caching for faster subsequent runs
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true
};

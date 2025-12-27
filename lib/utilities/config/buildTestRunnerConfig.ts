/**
 * Build Test Runner Configuration
 * 
 * Creates a test runner configuration with execution, coverage, and file pattern settings.
 * 
 * @param {object} [options] - Test runner configuration options
 * @returns {object} Validated test runner configuration
 */

interface TestRunnerConfigOptions {
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  maxWorkers?: number;
  coverage?: boolean;
  coverageThreshold?: number;
  testMatch?: string[];
  testIgnore?: string[];
  reporters?: string[];
  setupFiles?: string[];
  teardownFiles?: string[];
  environment?: string;
  globals?: Record<string, any>;
  verbose?: boolean;
  bail?: boolean;
  randomize?: boolean;
  coverageReporters?: string[];
  coverageDirectories?: string[];
  coverageExclude?: string[];
  watch?: boolean;
  cache?: boolean;
  collectCoverageOnlyFrom?: string[];
}

function buildTestRunnerConfig(options: TestRunnerConfigOptions = {}) {
  const {
    timeout = 5000,
    retries = 0,
    parallel = true,
    maxWorkers = 4,
    coverage = true,
    coverageThreshold = 80,
    testMatch = ['**/*.test.js', '**/*.spec.js'],
    testIgnore = ['node_modules', 'dist', 'build'],
    reporters = ['spec'],
    setupFiles = [],
    teardownFiles = [],
    environment = 'node',
    globals = {},
    verbose = false
  } = options;

  if (timeout <= 0) { // validate timeout
    throw new Error('Test timeout must be positive');
  }
  if (retries < 0) { // validate retries
    throw new Error('Test retries cannot be negative');
  }
  if (maxWorkers <= 0) { // validate workers
    throw new Error('Max workers must be positive');
  }

  return {
    execution: {
      timeout: Number(timeout),
      retries: Number(retries),
      parallel: Boolean(parallel),
      maxWorkers: Number(maxWorkers),
      bail: options.bail || false,
      randomize: options.randomize || false
    },
    coverage: {
      enabled: Boolean(coverage),
      threshold: Number(coverageThreshold),
      reporters: options.coverageReporters || ['text', 'lcov'],
      directories: options.coverageDirectories || ['src'],
      exclude: options.coverageExclude || ['test/**', 'node_modules/**']
    },
    filePatterns: {
      testMatch: Array.isArray(testMatch) ? [...testMatch] : [String(testMatch)],
      testIgnore: Array.isArray(testIgnore) ? [...testIgnore] : [String(testIgnore)]
    },
    setup: {
      files: Array.isArray(setupFiles) ? [...setupFiles] : [String(setupFiles)],
      teardownFiles: Array.isArray(teardownFiles) ? [...teardownFiles] : [String(teardownFiles)]
    },
    reporters: Array.isArray(reporters) ? [...reporters] : [String(reporters)],
    environment: String(environment),
    globals: { ...globals },
    verbose: Boolean(verbose),
    watch: options.watch || false,
    cache: options.cache !== false
  };
}

export default buildTestRunnerConfig;

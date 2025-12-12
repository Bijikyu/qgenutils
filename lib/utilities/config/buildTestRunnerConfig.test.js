const buildTestRunnerConfig = require('./buildTestRunnerConfig');

describe('buildTestRunnerConfig', () => {
  it('should build config with defaults', () => {
    const config = buildTestRunnerConfig();
    
    expect(config.execution.timeout).toBe(5000);
    expect(config.execution.retries).toBe(0);
    expect(config.execution.parallel).toBe(true);
    expect(config.execution.maxWorkers).toBe(4);
    expect(config.coverage.enabled).toBe(true);
    expect(config.coverage.threshold).toBe(80);
    expect(config.filePatterns.testMatch).toEqual(['**/*.test.js', '**/*.spec.js']);
    expect(config.filePatterns.testIgnore).toEqual(['node_modules', 'dist', 'build']);
    expect(config.environment).toBe('node');
    expect(config.verbose).toBe(false);
    expect(config.cache).toBe(true);
  });

  it('should validate timeout', () => {
    expect(() => buildTestRunnerConfig({ timeout: 0 })).toThrow('Test timeout must be positive');
    expect(() => buildTestRunnerConfig({ timeout: -100 })).toThrow('Test timeout must be positive');
  });

  it('should validate retries', () => {
    expect(() => buildTestRunnerConfig({ retries: -1 })).toThrow('Test retries cannot be negative');
  });

  it('should validate maxWorkers', () => {
    expect(() => buildTestRunnerConfig({ maxWorkers: 0 })).toThrow('Max workers must be positive');
  });

  it('should build config with custom values', () => {
    const config = buildTestRunnerConfig({
      timeout: 10000,
      retries: 3,
      parallel: false,
      maxWorkers: 8,
      coverage: false,
      coverageThreshold: 90,
      testMatch: ['**/*.spec.ts'],
      testIgnore: ['vendor'],
      reporters: ['json'],
      setupFiles: ['./setup.js'],
      teardownFiles: ['./teardown.js'],
      environment: 'jsdom',
      globals: { __DEV__: true },
      verbose: true,
      watch: true,
      cache: false
    });
    
    expect(config.execution.timeout).toBe(10000);
    expect(config.execution.retries).toBe(3);
    expect(config.execution.parallel).toBe(false);
    expect(config.execution.maxWorkers).toBe(8);
    expect(config.coverage.enabled).toBe(false);
    expect(config.coverage.threshold).toBe(90);
    expect(config.filePatterns.testMatch).toEqual(['**/*.spec.ts']);
    expect(config.filePatterns.testIgnore).toEqual(['vendor']);
    expect(config.reporters).toEqual(['json']);
    expect(config.setup.files).toEqual(['./setup.js']);
    expect(config.setup.teardownFiles).toEqual(['./teardown.js']);
    expect(config.environment).toBe('jsdom');
    expect(config.globals).toEqual({ __DEV__: true });
    expect(config.verbose).toBe(true);
    expect(config.watch).toBe(true);
    expect(config.cache).toBe(false);
  });

  it('should handle string patterns as arrays', () => {
    const config = buildTestRunnerConfig({
      testMatch: '**/*.test.ts',
      testIgnore: 'build'
    });
    
    expect(config.filePatterns.testMatch).toEqual(['**/*.test.ts']);
    expect(config.filePatterns.testIgnore).toEqual(['build']);
  });
});

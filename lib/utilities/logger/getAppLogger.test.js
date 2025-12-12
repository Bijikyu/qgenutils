const getAppLogger = require('./getAppLogger');

describe('getAppLogger', () => {
  it('should return logger with info method', () => {
    const logger = getAppLogger();
    expect(typeof logger.info).toBe('function');
  });

  it('should return logger with warn method', () => {
    const logger = getAppLogger();
    expect(typeof logger.warn).toBe('function');
  });

  it('should return logger with error method', () => {
    const logger = getAppLogger();
    expect(typeof logger.error).toBe('function');
  });

  it('should return logger with debug method', () => {
    const logger = getAppLogger();
    expect(typeof logger.debug).toBe('function');
  });

  it('should not throw when calling logger methods', () => {
    const logger = getAppLogger();
    expect(() => logger.info('test')).not.toThrow();
    expect(() => logger.warn('test')).not.toThrow();
    expect(() => logger.error('test')).not.toThrow();
    expect(() => logger.debug('test')).not.toThrow();
  });
});

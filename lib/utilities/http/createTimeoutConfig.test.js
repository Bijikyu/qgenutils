const createTimeoutConfig = require('./createTimeoutConfig');

describe('createTimeoutConfig', () => {
  it('should return config with base timeout for operation', () => {
    const config = createTimeoutConfig('cache-lookup');
    expect(config.timeoutMs).toBe(5000);
    expect(config.operationType).toBe('cache-lookup');
  });

  it('should use custom timeout when provided', () => {
    const config = createTimeoutConfig('http-api', 10000);
    expect(config.timeoutMs).toBe(10000);
    expect(config.operationType).toBe('http-api');
  });

  it('should apply multiplier to base timeout', () => {
    const config = createTimeoutConfig('cache-lookup', undefined, 2);
    expect(config.timeoutMs).toBe(10000);
  });

  it('should prefer custom timeout over multiplier', () => {
    const config = createTimeoutConfig('cache-lookup', 20000, 2);
    expect(config.timeoutMs).toBe(20000);
  });

  it('should round multiplied values', () => {
    const config = createTimeoutConfig('cache-lookup', undefined, 1.5);
    expect(config.timeoutMs).toBe(7500);
  });

  it('should warn for timeouts over 5 minutes', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    createTimeoutConfig('websocket', 400000);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should not warn for timeouts under 5 minutes', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    createTimeoutConfig('http-api');
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

const execHelperWrapper = require('./execHelperWrapper');

describe('execHelperWrapper', () => {
  it('should throw for invalid function', () => {
    expect(() => execHelperWrapper(null)).toThrow('Function to wrap must be a valid function');
    expect(() => execHelperWrapper('fn')).toThrow('Function to wrap must be a valid function');
  });

  it('should wrap and execute function', async () => {
    const fn = jest.fn((a, b) => a + b);
    const wrapped = execHelperWrapper(fn);
    
    const result = await wrapped(2, 3);
    
    expect(result).toBe(5);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });

  it('should handle async functions', async () => {
    const fn = jest.fn(async (x) => x * 2);
    const wrapped = execHelperWrapper(fn);
    
    const result = await wrapped(5);
    
    expect(result).toBe(10);
  });

  it('should log execution when enabled', async () => {
    const logger = { log: jest.fn(), error: jest.fn() };
    const fn = () => 'result';
    const wrapped = execHelperWrapper(fn, {
      context: 'TestService',
      logExecution: true,
      logger
    });
    
    await wrapped();
    
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Starting TestService'));
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Completed TestService'));
  });

  it('should log performance when enabled', async () => {
    const logger = { log: jest.fn(), error: jest.fn() };
    const fn = async () => { await new Promise(r => setTimeout(r, 10)); return 'done'; };
    const wrapped = execHelperWrapper(fn, {
      logPerformance: true,
      logger
    });
    
    await wrapped();
    
    expect(logger.log).toHaveBeenCalledWith(expect.stringMatching(/Performance.*\d+ms/));
  });

  it('should validate input', async () => {
    const validateInput = (x) => x > 0 ? true : 'must be positive';
    const fn = (x) => x * 2;
    const wrapped = execHelperWrapper(fn, { validateInput });
    
    await expect(wrapped(-5)).rejects.toThrow('Input validation failed: must be positive');
    await expect(wrapped(5)).resolves.toBe(10);
  });

  it('should validate output', async () => {
    const validateOutput = (result) => result < 100 ? true : 'too large';
    const fn = (x) => x * 2;
    const wrapped = execHelperWrapper(fn, { validateOutput });
    
    await expect(wrapped(60)).rejects.toThrow('Output validation failed: too large');
    await expect(wrapped(10)).resolves.toBe(20);
  });

  it('should timeout long-running functions', async () => {
    const fn = async () => { await new Promise(r => setTimeout(r, 500)); return 'done'; };
    const wrapped = execHelperWrapper(fn, { timeoutMs: 50, logErrors: false });
    
    await expect(wrapped()).rejects.toThrow('timed out after 50ms');
  });

  it('should retry on failure', async () => {
    let attempts = 0;
    const fn = jest.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Temporary error');
      return 'success';
    });
    const wrapped = execHelperWrapper(fn, { retryCount: 3, retryDelay: 10, logErrors: false });
    
    const result = await wrapped();
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw for invalid retryDelay when retryCount > 0', () => {
    expect(() => execHelperWrapper(() => {}, { retryCount: 3, retryDelay: 0 }))
      .toThrow('retryDelay must be positive when retryCount > 0');
    expect(() => execHelperWrapper(() => {}, { retryCount: 1, retryDelay: -100 }))
      .toThrow('retryDelay must be positive when retryCount > 0');
  });

  it('should not retry client errors', async () => {
    const clientError = new Error('Bad request');
    clientError.statusCode = 400;
    const fn = jest.fn(() => { throw clientError; });
    const wrapped = execHelperWrapper(fn, { retryCount: 3, retryDelay: 10, logErrors: false });
    
    await expect(wrapped()).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should transform errors', async () => {
    const fn = () => { throw new Error('original'); };
    const errorTransform = (err) => new Error(`Transformed: ${err.message}`);
    const wrapped = execHelperWrapper(fn, { errorTransform, logErrors: false });
    
    await expect(wrapped()).rejects.toThrow('Transformed: original');
  });

  it('should log errors when enabled', async () => {
    const logger = { log: jest.fn(), error: jest.fn() };
    const fn = () => { throw new Error('test error'); };
    const wrapped = execHelperWrapper(fn, { logErrors: true, logger });
    
    await expect(wrapped()).rejects.toThrow('test error');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error in'), 'test error');
  });
});

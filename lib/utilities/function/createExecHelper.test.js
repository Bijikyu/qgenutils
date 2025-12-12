const createExecHelper = require('./createExecHelper');

describe('createExecHelper', () => {
  it('should create helper with default options', () => {
    const helper = createExecHelper({ context: 'TestService' });
    
    expect(helper).toHaveProperty('wrap');
    expect(helper).toHaveProperty('getDefaults');
    expect(typeof helper.wrap).toBe('function');
  });

  it('should return defaults', () => {
    const helper = createExecHelper({ context: 'TestService', logErrors: true });
    const defaults = helper.getDefaults();
    
    expect(defaults.context).toBe('TestService');
    expect(defaults.logErrors).toBe(true);
  });

  it('should wrap functions with default options', async () => {
    const logger = { log: jest.fn(), error: jest.fn() };
    const helper = createExecHelper({
      context: 'TestService',
      logExecution: true,
      logger
    });
    
    const fn = (x) => x * 2;
    const wrapped = helper.wrap(fn);
    
    const result = await wrapped(5);
    
    expect(result).toBe(10);
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('TestService'));
  });

  it('should allow overriding defaults', async () => {
    const logger = { log: jest.fn(), error: jest.fn() };
    const helper = createExecHelper({
      context: 'DefaultContext',
      logger
    });
    
    const fn = (x) => x + 1;
    const wrapped = helper.wrap(fn, { context: 'CustomContext', logExecution: true });
    
    await wrapped(5);
    
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('CustomContext'));
  });

  it('should preserve wrapped function behavior', async () => {
    const helper = createExecHelper();
    
    const asyncFn = async (a, b) => {
      await new Promise(r => setTimeout(r, 5));
      return a + b;
    };
    
    const wrapped = helper.wrap(asyncFn);
    const result = await wrapped(10, 20);
    
    expect(result).toBe(30);
  });

  it('should handle errors with default options', async () => {
    const logger = { log: jest.fn(), error: jest.fn() };
    const helper = createExecHelper({
      context: 'ErrorTest',
      logErrors: true,
      logger
    });
    
    const fn = () => { throw new Error('test failure'); };
    const wrapped = helper.wrap(fn);
    
    await expect(wrapped()).rejects.toThrow('test failure');
    expect(logger.error).toHaveBeenCalled();
  });
});

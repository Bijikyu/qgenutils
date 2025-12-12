const scheduleInterval = require('./scheduleInterval');

describe('scheduleInterval', () => {
  it('should throw for invalid callback', () => {
    expect(() => scheduleInterval(null, 1000)).toThrow('Callback must be a function');
    expect(() => scheduleInterval('fn', 1000)).toThrow('Callback must be a function');
  });

  it('should throw for invalid interval', () => {
    expect(() => scheduleInterval(() => {}, 0)).toThrow('Interval must be a positive number');
    expect(() => scheduleInterval(() => {}, -100)).toThrow('Interval must be a positive number');
    expect(() => scheduleInterval(() => {}, 'fast')).toThrow('Interval must be a positive number');
  });

  it('should return job object with expected methods', () => {
    const job = scheduleInterval(() => {}, 10000);
    
    expect(job).toHaveProperty('id');
    expect(typeof job.cancel).toBe('function');
    expect(typeof job.isRunning).toBe('function');
    expect(typeof job.getExecutionCount).toBe('function');
    
    job.cancel();
  });

  it('should execute callback on interval', async () => {
    const callback = jest.fn();
    const job = scheduleInterval(callback, 50);

    await new Promise(r => setTimeout(r, 130));

    expect(callback).toHaveBeenCalledTimes(2);
    expect(job.getExecutionCount()).toBe(2);
    
    job.cancel();
  });

  it('should execute immediately when immediate=true', async () => {
    const callback = jest.fn();
    const job = scheduleInterval(callback, 10000, { immediate: true });

    await new Promise(r => setTimeout(r, 20));

    expect(callback).toHaveBeenCalledTimes(1);
    
    job.cancel();
  });

  it('should stop after maxExecutions', async () => {
    const callback = jest.fn();
    const job = scheduleInterval(callback, 30, { maxExecutions: 2 });

    await new Promise(r => setTimeout(r, 150));

    expect(callback).toHaveBeenCalledTimes(2);
    expect(job.isRunning()).toBe(false);
  });

  it('should call onError for errors', async () => {
    const onError = jest.fn();
    const callback = jest.fn(() => { throw new Error('Test error'); });
    const job = scheduleInterval(callback, 50, { onError });

    await new Promise(r => setTimeout(r, 70));

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toBe('Test error');
    
    job.cancel();
  });

  it('should use custom identifier', () => {
    const job = scheduleInterval(() => {}, 10000, { identifier: 'my-job' });
    expect(job.id).toBe('my-job');
    job.cancel();
  });

  it('should cancel properly', () => {
    const job = scheduleInterval(() => {}, 10000);
    
    expect(job.isRunning()).toBe(true);
    expect(job.cancel()).toBe(true);
    expect(job.isRunning()).toBe(false);
  });
});

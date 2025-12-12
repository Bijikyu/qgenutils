const scheduleOnce = require('./scheduleOnce');

describe('scheduleOnce', () => {
  it('should throw for invalid callback', () => {
    expect(() => scheduleOnce(null, Date.now() + 1000)).toThrow('Callback must be a function');
  });

  it('should throw for invalid when', () => {
    expect(() => scheduleOnce(() => {}, 'tomorrow')).toThrow('When must be a valid Date or timestamp');
    expect(() => scheduleOnce(() => {}, new Date('invalid'))).toThrow('When must be a valid Date or timestamp');
  });

  it('should return job object with expected methods', () => {
    const job = scheduleOnce(() => {}, Date.now() + 60000);
    
    expect(job).toHaveProperty('id');
    expect(typeof job.cancel).toBe('function');
    expect(typeof job.isRunning).toBe('function');
    expect(typeof job.getScheduledFor).toBe('function');
    
    job.cancel();
  });

  it('should accept Date object', () => {
    const futureDate = new Date(Date.now() + 60000);
    const job = scheduleOnce(() => {}, futureDate);
    
    expect(job.getScheduledFor()).toEqual(futureDate);
    job.cancel();
  });

  it('should accept timestamp', () => {
    const timestamp = Date.now() + 60000;
    const job = scheduleOnce(() => {}, timestamp);
    
    expect(job.getScheduledFor().getTime()).toBe(timestamp);
    job.cancel();
  });

  it('should execute callback at scheduled time', async () => {
    const callback = jest.fn();
    const job = scheduleOnce(callback, Date.now() + 50);

    expect(callback).not.toHaveBeenCalled();
    
    await new Promise(r => setTimeout(r, 100));
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(job.isRunning()).toBe(false);
  });

  it('should execute immediately for past dates', async () => {
    const callback = jest.fn();
    const job = scheduleOnce(callback, Date.now() - 1000);

    await new Promise(r => setTimeout(r, 20));
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call onError for errors', async () => {
    const onError = jest.fn();
    const callback = jest.fn(() => { throw new Error('Job failed'); });
    scheduleOnce(callback, Date.now() + 30, { onError });

    await new Promise(r => setTimeout(r, 80));

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toBe('Job failed');
  });

  it('should cancel pending job', async () => {
    const callback = jest.fn();
    const job = scheduleOnce(callback, Date.now() + 100);
    
    expect(job.isRunning()).toBe(true);
    expect(job.cancel()).toBe(true);
    expect(job.isRunning()).toBe(false);
    
    await new Promise(r => setTimeout(r, 150));
    expect(callback).not.toHaveBeenCalled();
  });

  it('should use custom identifier', () => {
    const job = scheduleOnce(() => {}, Date.now() + 60000, { identifier: 'my-one-time-job' });
    expect(job.id).toBe('my-one-time-job');
    job.cancel();
  });
});

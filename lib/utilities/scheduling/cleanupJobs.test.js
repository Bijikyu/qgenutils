const cleanupJobs = require('./cleanupJobs');
const scheduleInterval = require('./scheduleInterval');
const scheduleOnce = require('./scheduleOnce');

describe('cleanupJobs', () => {
  it('should throw for non-array input', () => {
    expect(() => cleanupJobs(null)).toThrow('Jobs must be an array');
    expect(() => cleanupJobs('job')).toThrow('Jobs must be an array');
    expect(() => cleanupJobs({})).toThrow('Jobs must be an array');
  });

  it('should return 0 for empty array', () => {
    expect(cleanupJobs([])).toBe(0);
  });

  it('should cancel interval jobs', () => {
    const job1 = scheduleInterval(() => {}, 10000);
    const job2 = scheduleInterval(() => {}, 10000);
    
    expect(job1.isRunning()).toBe(true);
    expect(job2.isRunning()).toBe(true);
    
    const count = cleanupJobs([job1, job2]);
    
    expect(count).toBe(2);
    expect(job1.isRunning()).toBe(false);
    expect(job2.isRunning()).toBe(false);
  });

  it('should cancel one-time jobs', () => {
    const job1 = scheduleOnce(() => {}, Date.now() + 60000);
    const job2 = scheduleOnce(() => {}, Date.now() + 60000);
    
    const count = cleanupJobs([job1, job2]);
    
    expect(count).toBe(2);
    expect(job1.isRunning()).toBe(false);
    expect(job2.isRunning()).toBe(false);
  });

  it('should handle mixed job types', () => {
    const job1 = scheduleInterval(() => {}, 10000);
    const job2 = scheduleOnce(() => {}, Date.now() + 60000);
    
    const count = cleanupJobs([job1, job2]);
    
    expect(count).toBe(2);
  });

  it('should skip null and invalid entries', () => {
    const job = scheduleInterval(() => {}, 10000);
    
    const count = cleanupJobs([null, undefined, {}, job, 'invalid']);
    
    expect(count).toBe(1);
  });

  it('should not count already cancelled jobs', () => {
    const job = scheduleInterval(() => {}, 10000);
    job.cancel();
    
    const count = cleanupJobs([job]);
    
    expect(count).toBe(0);
  });
});

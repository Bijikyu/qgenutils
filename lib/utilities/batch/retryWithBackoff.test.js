const retryWithBackoff = require('./retryWithBackoff');

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn, { maxRetries: 3 });
    
    expect(result).toEqual({ ok: true, value: 'success', attempts: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');
    
    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });
    
    expect(result).toEqual({ ok: true, value: 'success', attempts: 3 });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('persistent error'));
    
    const result = await retryWithBackoff(fn, { maxRetries: 2, baseDelay: 10 });
    
    expect(result.ok).toBe(false);
    expect(result.error.message).toBe('persistent error');
    expect(result.attempts).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should respect shouldRetry predicate', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('non-retryable'));
    const shouldRetry = error => !error.message.includes('non-retryable');
    
    const result = await retryWithBackoff(fn, { 
      maxRetries: 3, 
      baseDelay: 10, 
      shouldRetry 
    });
    
    expect(result.ok).toBe(false);
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use exponential backoff', async () => {
    const startTime = Date.now();
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 50 });
    
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

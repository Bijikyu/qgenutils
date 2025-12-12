const processBatch = require('./processBatch');

describe('processBatch', () => {
  it('should process all items successfully', async () => {
    const items = [1, 2, 3, 4, 5];
    const processor = jest.fn(async (item) => item * 2);

    const result = await processBatch(items, processor, { concurrency: 2 });

    expect(result.successCount).toBe(5);
    expect(result.failureCount).toBe(0);
    expect(result.total).toBe(5);
    expect(result.successful.map(s => s.result).sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle failures with retries', async () => {
    const items = ['a', 'b', 'c'];
    const processor = jest.fn(async (item) => {
      if (item === 'b') throw new Error('fail b');
      return item.toUpperCase();
    });

    const result = await processBatch(items, processor, { 
      concurrency: 1, 
      retries: 2, 
      retryDelay: 10 
    });

    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(1);
    expect(result.failed[0].item).toBe('b');
  });

  it('should respect concurrency limit', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;
    const items = [1, 2, 3, 4, 5, 6];

    const processor = async (item) => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise(r => setTimeout(r, 20));
      concurrent--;
      return item;
    };

    await processBatch(items, processor, { concurrency: 2, batchSize: 10 });

    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('should call progress callback', async () => {
    const items = [1, 2, 3];
    const progressCalls = [];

    await processBatch(items, async (item) => item, {
      concurrency: 1,
      batchSize: 1,
      onProgress: (p) => progressCalls.push({ ...p })
    });

    expect(progressCalls.length).toBe(3);
    expect(progressCalls[2].percentage).toBe(100);
  });

  it('should stop on error when configured', async () => {
    const items = [1, 2, 3, 4, 5];
    const processor = jest.fn(async (item) => {
      if (item === 2) throw new Error('stop');
      return item;
    });

    const result = await processBatch(items, processor, {
      concurrency: 1,
      batchSize: 1,
      stopOnError: true,
      retries: 0
    });

    expect(result.failureCount).toBe(1);
    expect(result.successCount + result.failureCount).toBeLessThan(5);
  });

  it('should handle timeout', async () => {
    const items = [1];
    const processor = async () => {
      await new Promise(r => setTimeout(r, 200));
      return 'done';
    };

    const result = await processBatch(items, processor, {
      timeout: 50,
      retries: 0
    });

    expect(result.failureCount).toBe(1);
    expect(result.failed[0].error.message).toBe('Timeout');
  });
});

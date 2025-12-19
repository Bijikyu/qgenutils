// 🔗 Tests: createSemaphore.js → Promise-based concurrency control
// Tests semaphore pattern for limiting concurrent operations

const createSemaphore = require('./createSemaphore');

describe('createSemaphore', () => {
  it('should throw for invalid permits', () => {
    expect(() => createSemaphore(0)).toThrow('Semaphore permits must be a positive integer');
    expect(() => createSemaphore(-1)).toThrow('Semaphore permits must be a positive integer');
    expect(() => createSemaphore(1.5)).toThrow('Semaphore permits must be a positive integer');
    expect(() => createSemaphore(null)).toThrow('Semaphore permits must be a positive integer');
  });

  it('should allow acquisition up to permit limit', async () => {
    const sem = createSemaphore(2);
    expect(sem.getAvailablePermits()).toBe(2);
    
    const release1 = await sem.acquire();
    expect(sem.getAvailablePermits()).toBe(1);
    
    const release2 = await sem.acquire();
    expect(sem.getAvailablePermits()).toBe(0);
    
    release1();
    expect(sem.getAvailablePermits()).toBe(1);
    
    release2();
    expect(sem.getAvailablePermits()).toBe(2);
  });

  it('should queue when permits exhausted', async () => {
    const sem = createSemaphore(1);
    const order = [];
    
    const release1 = await sem.acquire();
    order.push('first acquired');
    
    const secondPromise = sem.acquire().then(release => {
      order.push('second acquired');
      return release;
    });
    
    expect(sem.getQueueLength()).toBe(1);
    
    release1();
    const release2 = await secondPromise;
    
    expect(order).toEqual(['first acquired', 'second acquired']);
    release2();
  });

  it('should wait for all permits to be released', async () => {
    const sem = createSemaphore(2);
    const release1 = await sem.acquire();
    const release2 = await sem.acquire();
    
    setTimeout(() => {
      release1();
      release2();
    }, 50);
    
    await sem.waitForAll();
    expect(sem.getAvailablePermits()).toBe(2);
  });
});

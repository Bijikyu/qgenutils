const createRateLimitStore = require('./createRateLimitStore');

describe('createRateLimitStore', () => {
  let store;

  afterEach(() => {
    if (store) store.destroy();
  });

  it('should consume points and track usage', () => {
    store = createRateLimitStore({ cleanupInterval: 0 });
    
    const result1 = store.consume('user:1', 5, 60000);
    expect(result1.consumed).toBe(1);
    expect(result1.remaining).toBe(4);
    expect(result1.exceeded).toBe(false);

    const result2 = store.consume('user:1', 5, 60000);
    expect(result2.consumed).toBe(2);
    expect(result2.remaining).toBe(3);
  });

  it('should indicate when limit is exceeded', () => {
    store = createRateLimitStore({ cleanupInterval: 0 });
    
    for (let i = 0; i < 5; i++) {
      store.consume('user:1', 5, 60000);
    }

    const result = store.consume('user:1', 5, 60000);
    expect(result.exceeded).toBe(true);
    expect(result.remaining).toBe(0);
    expect(result.consumed).toBe(6);
  });

  it('should get usage without consuming', () => {
    store = createRateLimitStore({ cleanupInterval: 0 });
    
    store.consume('user:1', 5, 60000);
    store.consume('user:1', 5, 60000);

    const usage = store.get('user:1');
    expect(usage.consumed).toBe(2);
    expect(usage.resetTime).toBeGreaterThan(Date.now());

    const usage2 = store.get('user:1');
    expect(usage2.consumed).toBe(2);
  });

  it('should return null for unknown key', () => {
    store = createRateLimitStore({ cleanupInterval: 0 });
    expect(store.get('unknown')).toBeNull();
  });

  it('should reset usage for a key', () => {
    store = createRateLimitStore({ cleanupInterval: 0 });
    
    store.consume('user:1', 5, 60000);
    store.reset('user:1');

    expect(store.get('user:1')).toBeNull();
    
    const result = store.consume('user:1', 5, 60000);
    expect(result.consumed).toBe(1);
  });

  it('should reset window after expiry', async () => {
    store = createRateLimitStore({ cleanupInterval: 0 });
    
    store.consume('user:1', 5, 50);
    store.consume('user:1', 5, 50);
    expect(store.get('user:1').consumed).toBe(2);

    await new Promise(r => setTimeout(r, 60));

    const result = store.consume('user:1', 5, 50);
    expect(result.consumed).toBe(1);
  });

  it('should track store size', () => {
    store = createRateLimitStore({ cleanupInterval: 0 });
    
    expect(store.size()).toBe(0);
    store.consume('user:1', 5, 60000);
    expect(store.size()).toBe(1);
    store.consume('user:2', 5, 60000);
    expect(store.size()).toBe(2);
    store.reset('user:1');
    expect(store.size()).toBe(1);
  });

  it('should clean up expired entries', async () => {
    store = createRateLimitStore({ cleanupInterval: 50 });
    
    store.consume('user:1', 5, 30);
    expect(store.size()).toBe(1);

    await new Promise(r => setTimeout(r, 100));

    expect(store.size()).toBe(0);
  });

  it('should destroy store and clear timer', () => {
    store = createRateLimitStore({ cleanupInterval: 100 });
    store.consume('user:1', 5, 60000);
    
    store.destroy();
    expect(store.size()).toBe(0);
  });
});

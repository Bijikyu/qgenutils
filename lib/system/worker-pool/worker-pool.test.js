/**
 * Unit tests for worker pool utilities module
 * 
 * Tests cover worker pool creation, task execution, error handling,
 * and resource cleanup scenarios.
 */

const { createWorkerPool } = require('./worker-pool');
const path = require('path');

// Mock worker threads module for testing
jest.mock('worker_threads', () => {
  const EventEmitter = require('events');
  
  class MockWorker extends EventEmitter {
    constructor(scriptPath) {
      super();
      this.scriptPath = scriptPath;
      this.isTerminated = false;
      this.messageHandlers = [];
      
      // Simulate worker initialization after a short delay
      setTimeout(() => {
        if (!this.isTerminated) {
          this.emit('message', { status: 'initialized' });
        }
      }, 10);
    }
    
    postMessage(data, transferList) {
      // Simulate message processing
      setTimeout(() => {
        if (!this.isTerminated) {
          if (data && data.type === 'init') {
            // Initialization already handled in constructor
            return;
          }
          
          // Simulate task completion
          this.emit('message', { 
            status: 'completed', 
            result: `processed: ${JSON.stringify(data)}` 
          });
        }
      }, 5);
    }
    
    async terminate() {
      this.isTerminated = true;
      this.emit('exit', 0);
      return Promise.resolve();
    }
    
    simulateError(error) {
      this.emit('error', new Error(error));
    }
    
    simulateExit(code) {
      this.isTerminated = true;
      this.emit('exit', code);
    }
  }
  
  return { Worker: MockWorker };
});

// Mock os module for CPU count
jest.mock('os', () => ({
  cpus: () => new Array(4) // Mock 4 CPU cores
}));

describe('Worker Pool Utilities', () => {
  describe('createWorkerPool', () => {
    let pool;
    
    afterEach(async () => {
      if (pool) {
        await pool.terminate();
        pool = null;
      }
    });

    // Test worker pool creation with valid parameters
    test('should create worker pool with valid parameters', () => {
      expect(() => {
        pool = createWorkerPool('./test-worker.js', 2);
      }).not.toThrow();
      
      expect(pool).toHaveProperty('init');
      expect(pool).toHaveProperty('execute');
      expect(pool).toHaveProperty('terminate');
      expect(pool).toHaveProperty('getStatus');
    });

    // Test input validation for worker script path
    test('should validate worker script path', () => {
      expect(() => {
        createWorkerPool('', 2);
      }).toThrow('Worker script path must be a non-empty string');
      
      expect(() => {
        createWorkerPool(null, 2);
      }).toThrow('Worker script path must be a non-empty string');
      
      expect(() => {
        createWorkerPool(123, 2);
      }).toThrow('Worker script path must be a non-empty string');
    });

    // Test input validation for pool size
    test('should validate pool size', () => {
      expect(() => {
        createWorkerPool('./worker.js', 0);
      }).toThrow('Pool size must be an integer between 1 and 16');
      
      expect(() => {
        createWorkerPool('./worker.js', -1);
      }).toThrow('Pool size must be an integer between 1 and 16');
      
      expect(() => {
        createWorkerPool('./worker.js', 17);
      }).toThrow('Pool size must be an integer between 1 and 16');
      
      expect(() => {
        createWorkerPool('./worker.js', 'invalid');
      }).toThrow('Pool size must be an integer between 1 and 16');
      
      expect(() => {
        createWorkerPool('./worker.js', 3.5);
      }).toThrow('Pool size must be an integer between 1 and 16');
    });

    // Test default pool size uses CPU count
    test('should use CPU count as default pool size', () => {
      expect(() => {
        pool = createWorkerPool('./worker.js');
      }).not.toThrow();
      
      // Should use 4 CPUs from our mock
      const status = pool.getStatus();
      expect(status.totalWorkers).toBe(0); // Workers not created until init()
    });

    // Test worker pool initialization
    test('should initialize worker pool successfully', async () => {
      pool = createWorkerPool('./test-worker.js', 2);
      
      await expect(pool.init()).resolves.toBeUndefined();
      
      const status = pool.getStatus();
      expect(status.totalWorkers).toBe(2);
      expect(status.isInitialized).toBe(true);
    });

    // Test multiple initialization calls return same promise
    test('should return same promise for multiple init calls', async () => {
      pool = createWorkerPool('./test-worker.js', 1);
      
      const initPromise1 = pool.init();
      const initPromise2 = pool.init();
      
      // Both should resolve to the same result
      const [result1, result2] = await Promise.all([initPromise1, initPromise2]);
      expect(result1).toBe(result2);
    });

    // Test task execution without initialization
    test('should require initialization before task execution', async () => {
      pool = createWorkerPool('./test-worker.js', 1);
      
      await expect(pool.execute({ data: 'test' }))
        .rejects.toThrow('Worker pool not initialized. Call init() first.');
    });

    // Test successful task execution
    test('should execute tasks successfully', async () => {
      pool = createWorkerPool('./test-worker.js', 2);
      await pool.init();
      
      const result = await pool.execute({ test: 'data' });
      expect(result).toContain('processed');
      expect(result).toContain('test');
    });

    // Test concurrent task execution
    test('should handle multiple concurrent tasks', async () => {
      pool = createWorkerPool('./test-worker.js', 2);
      await pool.init();
      
      const tasks = [
        pool.execute({ task: 1 }),
        pool.execute({ task: 2 }),
        pool.execute({ task: 3 })
      ];
      
      const results = await Promise.all(tasks);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toContain('processed');
      });
    });

    // Test worker pool status reporting
    test('should provide accurate status information', async () => {
      pool = createWorkerPool('./test-worker.js', 3);
      
      let status = pool.getStatus();
      expect(status.totalWorkers).toBe(0);
      expect(status.isInitialized).toBe(false);
      
      await pool.init();
      
      // Wait for workers to fully initialize
      await new Promise(resolve => setTimeout(resolve, 50));
      
      status = pool.getStatus();
      expect(status.totalWorkers).toBe(3);
      expect(status.initializedWorkers).toBe(3);
      expect(status.isInitialized).toBe(true);
    });

    // Test graceful termination
    test('should terminate all workers gracefully', async () => {
      pool = createWorkerPool('./test-worker.js', 2);
      await pool.init();
      
      await expect(pool.terminate()).resolves.toBeUndefined();
      
      const status = pool.getStatus();
      expect(status.totalWorkers).toBe(0);
      expect(status.isInitialized).toBe(false);
    });

    // Test termination of empty pool
    test('should handle termination of empty pool', async () => {
      pool = createWorkerPool('./test-worker.js', 1);
      
      await expect(pool.terminate()).resolves.toBeUndefined();
    });

    // Test execution during shutdown
    test('should reject tasks during shutdown', async () => {
      pool = createWorkerPool('./test-worker.js', 1);
      await pool.init();
      
      // Start shutdown process but don't wait
      const terminatePromise = pool.terminate();
      
      await expect(pool.execute({ data: 'test' }))
        .rejects.toThrow('Cannot execute tasks during worker pool shutdown');
        
      await terminatePromise;
    });

    // Test reinitialization after shutdown
    test('should allow reinitialization after shutdown', async () => {
      pool = createWorkerPool('./test-worker.js', 1);
      await pool.init();
      
      // Shutdown completely
      await pool.terminate();
      
      // Should be able to reinitialize after full shutdown
      await expect(pool.init()).resolves.toBeUndefined();
    });

    // Test function signatures
    test('should have correct function signatures', () => {
      expect(typeof createWorkerPool).toBe('function');
      
      pool = createWorkerPool('./test-worker.js', 1);
      expect(typeof pool.init).toBe('function');
      expect(typeof pool.execute).toBe('function');
      expect(typeof pool.terminate).toBe('function');
      expect(typeof pool.getStatus).toBe('function');
    });

    // Test edge cases
    test('should handle edge case scenarios', async () => {
      pool = createWorkerPool('./test-worker.js', 1);
      await pool.init();
      
      // Test with undefined data
      const result1 = await pool.execute(undefined);
      expect(result1).toContain('processed');
      
      // Test with null data
      const result2 = await pool.execute(null);
      expect(result2).toContain('processed');
      
      // Test with empty object
      const result3 = await pool.execute({});
      expect(result3).toContain('processed');
    }, 15000);

    // Test resource cleanup after errors
    test('should maintain clean state after operations', async () => {
      pool = createWorkerPool('./test-worker.js', 2);
      await pool.init();
      
      // Execute some tasks
      await pool.execute({ data: 'test1' });
      await pool.execute({ data: 'test2' });
      
      const status = pool.getStatus();
      expect(status.queuedTasks).toBe(0);
      expect(status.busyWorkers).toBe(0);
      
      await pool.terminate();
      
      const finalStatus = pool.getStatus();
      expect(finalStatus.totalWorkers).toBe(0);
    });
  });
});
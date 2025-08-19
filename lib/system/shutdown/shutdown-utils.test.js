/**
 * Unit tests for shutdown utilities module
 * 
 * Tests cover shutdown manager creation, handler registration, graceful shutdown,
 * signal handling, and timeout scenarios.
 */

const { createShutdownManager, gracefulShutdown } = require('./shutdown-utils');

// Mock process.exit to prevent actual process termination during tests
const originalExit = process.exit;
const originalOn = process.on;
const originalRemoveAllListeners = process.removeAllListeners;

describe('Shutdown Utilities', () => {
  let mockExit;
  let mockOn;
  let mockRemoveAllListeners;
  let processEventHandlers;

  beforeEach(() => {
    // Mock process.exit
    mockExit = jest.fn();
    process.exit = mockExit;

    // Mock process.on
    processEventHandlers = new Map();
    mockOn = jest.fn((signal, handler) => {
      processEventHandlers.set(signal, handler);
    });
    process.on = mockOn;

    // Mock process.removeAllListeners
    mockRemoveAllListeners = jest.fn((signal) => {
      processEventHandlers.delete(signal);
    });
    process.removeAllListeners = mockRemoveAllListeners;
  });

  afterEach(() => {
    // Restore original functions
    process.exit = originalExit;
    process.on = originalOn;
    process.removeAllListeners = originalRemoveAllListeners;
    jest.clearAllMocks();
  });

  describe('createShutdownManager', () => {
    // Test shutdown manager creation with default options
    test('should create shutdown manager with default options', () => {
      const manager = createShutdownManager();
      
      expect(manager).toHaveProperty('registerHandler');
      expect(manager).toHaveProperty('unregisterHandler');
      expect(manager).toHaveProperty('shutdown');
      expect(manager).toHaveProperty('enableSignalHandlers');
      expect(manager).toHaveProperty('disableSignalHandlers');
      expect(manager).toHaveProperty('getStatus');
    });

    // Test shutdown manager creation with custom options
    test('should create shutdown manager with custom options', () => {
      const manager = createShutdownManager({
        timeout: 5000,
        signals: ['SIGTERM'],
        exitCode: 2,
        forceExitCode: 3
      });
      
      const status = manager.getStatus();
      expect(status.timeout).toBe(5000);
      expect(status.signals).toEqual(['SIGTERM']);
    });

    // Test input validation for timeout
    test('should validate timeout option', () => {
      expect(() => {
        createShutdownManager({ timeout: 500 });
      }).toThrow('Timeout must be an integer between 1000 and 60000 milliseconds');

      expect(() => {
        createShutdownManager({ timeout: 70000 });
      }).toThrow('Timeout must be an integer between 1000 and 60000 milliseconds');

      expect(() => {
        createShutdownManager({ timeout: 'invalid' });
      }).toThrow('Timeout must be an integer between 1000 and 60000 milliseconds');
    });

    // Test handler registration
    test('should register cleanup handlers', () => {
      const manager = createShutdownManager();
      const mockHandler = jest.fn();

      manager.registerHandler('test-handler', mockHandler, 50);

      const status = manager.getStatus();
      expect(status.registeredHandlers).toContain('test-handler');
      expect(status.handlerCount).toBe(1);
    });

    // Test handler registration validation
    test('should validate handler registration parameters', () => {
      const manager = createShutdownManager();

      expect(() => {
        manager.registerHandler('', jest.fn());
      }).toThrow('Handler name must be a non-empty string');

      expect(() => {
        manager.registerHandler(null, jest.fn());
      }).toThrow('Handler name must be a non-empty string');

      expect(() => {
        manager.registerHandler('test', 'not-a-function');
      }).toThrow('Handler must be a function');

      expect(() => {
        manager.registerHandler('test', jest.fn(), -1);
      }).toThrow('Priority must be a non-negative integer');

      expect(() => {
        manager.registerHandler('test', jest.fn(), 'invalid');
      }).toThrow('Priority must be a non-negative integer');
    });

    // Test handler unregistration
    test('should unregister cleanup handlers', () => {
      const manager = createShutdownManager();
      const mockHandler = jest.fn();

      manager.registerHandler('test-handler', mockHandler);
      expect(manager.getStatus().handlerCount).toBe(1);

      const removed = manager.unregisterHandler('test-handler');
      expect(removed).toBe(true);
      expect(manager.getStatus().handlerCount).toBe(0);

      const removedAgain = manager.unregisterHandler('test-handler');
      expect(removedAgain).toBe(false);
    });

    // Test signal handler enabling
    test('should enable signal handlers', () => {
      const manager = createShutdownManager();

      manager.enableSignalHandlers();

      expect(mockOn).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(manager.getStatus().signalHandlersEnabled).toBe(true);
    });

    // Test signal handler disabling
    test('should disable signal handlers', () => {
      const manager = createShutdownManager();

      manager.enableSignalHandlers();
      manager.disableSignalHandlers();

      expect(mockRemoveAllListeners).toHaveBeenCalledWith('SIGTERM');
      expect(mockRemoveAllListeners).toHaveBeenCalledWith('SIGINT');
      expect(manager.getStatus().signalHandlersEnabled).toBe(false);
    });

    // Test shutdown execution with handlers
    test('should execute shutdown with handlers', async () => {
      const manager = createShutdownManager({ timeout: 2000 });
      const mockHandler1 = jest.fn().mockResolvedValue(undefined);
      const mockHandler2 = jest.fn().mockResolvedValue(undefined);

      manager.registerHandler('handler1', mockHandler1, 10);
      manager.registerHandler('handler2', mockHandler2, 20);

      // Start shutdown but don't wait for it to complete (it will call process.exit)
      const shutdownPromise = manager.shutdown();
      
      // Give it a moment to execute handlers
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockHandler1).toHaveBeenCalled();
      expect(mockHandler2).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    // Test shutdown execution order by priority
    test('should execute handlers in priority order', async () => {
      const manager = createShutdownManager({ timeout: 2000 });
      const executionOrder = [];

      const highPriorityHandler = jest.fn().mockImplementation(() => {
        executionOrder.push('high');
        return Promise.resolve();
      });

      const lowPriorityHandler = jest.fn().mockImplementation(() => {
        executionOrder.push('low');
        return Promise.resolve();
      });

      manager.registerHandler('low-priority', lowPriorityHandler, 100);
      manager.registerHandler('high-priority', highPriorityHandler, 10);

      // Start shutdown
      const shutdownPromise = manager.shutdown();
      
      // Give it a moment to execute
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(executionOrder).toEqual(['high', 'low']);
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    // Test shutdown with failing handler
    test('should continue shutdown even if handler fails', async () => {
      const manager = createShutdownManager({ timeout: 2000 });
      const failingHandler = jest.fn().mockRejectedValue(new Error('Handler failed'));
      const successHandler = jest.fn().mockResolvedValue(undefined);

      manager.registerHandler('failing', failingHandler, 10);
      manager.registerHandler('success', successHandler, 20);

      // Start shutdown
      const shutdownPromise = manager.shutdown();
      
      // Give it a moment to execute
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(failingHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    // Test multiple shutdown calls behave correctly
    test('should handle multiple shutdown calls correctly', async () => {
      const manager = createShutdownManager();
      const mockHandler = jest.fn().mockResolvedValue(undefined);

      manager.registerHandler('test', mockHandler);

      const promise1 = manager.shutdown();
      const promise2 = manager.shutdown();

      // Both promises should resolve and handler should only be called once
      await Promise.all([
        promise1.catch(() => {}), // Catch to avoid unhandled promise rejection
        promise2.catch(() => {})
      ]);
      
      // Give it time to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // Handler should only be called once despite multiple shutdown calls
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    // Test shutdown timeout handling
    test('should handle shutdown timeout', async () => {
      const manager = createShutdownManager({ timeout: 1000, forceExitCode: 1 });
      const slowHandler = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1200)); // Slower than timeout
      });

      manager.registerHandler('slow', slowHandler);

      // Start shutdown
      const shutdownPromise = manager.shutdown();
      
      // Wait for timeout to occur
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(mockExit).toHaveBeenCalledWith(1); // Force exit code
    });

    // Test status reporting
    test('should provide accurate status information', () => {
      const manager = createShutdownManager({ timeout: 5000 });
      
      let status = manager.getStatus();
      expect(status.isShuttingDown).toBe(false);
      expect(status.signalHandlersEnabled).toBe(false);
      expect(status.handlerCount).toBe(0);
      expect(status.timeout).toBe(5000);

      manager.registerHandler('test', jest.fn());
      manager.enableSignalHandlers();

      status = manager.getStatus();
      expect(status.handlerCount).toBe(1);
      expect(status.signalHandlersEnabled).toBe(true);
      expect(status.registeredHandlers).toContain('test');
    });

    // Test signal triggering shutdown
    test('should trigger shutdown on signal', async () => {
      const manager = createShutdownManager();
      const mockHandler = jest.fn().mockResolvedValue(undefined);

      manager.registerHandler('test', mockHandler);
      manager.enableSignalHandlers();

      // Simulate SIGTERM signal
      const sigTermHandler = processEventHandlers.get('SIGTERM');
      expect(sigTermHandler).toBeDefined();

      sigTermHandler();

      // Give it a moment to execute
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockHandler).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    // Test function signatures
    test('should have correct function signatures', () => {
      expect(typeof createShutdownManager).toBe('function');
      
      const manager = createShutdownManager();
      expect(typeof manager.registerHandler).toBe('function');
      expect(typeof manager.unregisterHandler).toBe('function');
      expect(typeof manager.shutdown).toBe('function');
      expect(typeof manager.enableSignalHandlers).toBe('function');
      expect(typeof manager.disableSignalHandlers).toBe('function');
      expect(typeof manager.getStatus).toBe('function');
    });
  });

  describe('gracefulShutdown', () => {
    let mockServer;

    beforeEach(() => {
      mockServer = {
        close: jest.fn()
      };
    });

    // Test basic graceful shutdown
    test('should perform basic graceful shutdown', async () => {
      mockServer.close.mockImplementation((callback) => {
        setTimeout(() => callback(), 10);
      });

      const shutdownPromise = gracefulShutdown(mockServer);
      
      // Give it time to execute
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockServer.close).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    // Test graceful shutdown with additional cleanup
    test('should perform graceful shutdown with additional cleanup', async () => {
      const additionalCleanup = jest.fn().mockResolvedValue(undefined);
      
      mockServer.close.mockImplementation((callback) => {
        setTimeout(() => callback(), 10);
      });

      const shutdownPromise = gracefulShutdown(mockServer, additionalCleanup);
      
      // Give it time to execute
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockServer.close).toHaveBeenCalled();
      expect(additionalCleanup).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    // Test input validation
    test('should validate server parameter', async () => {
      await expect(gracefulShutdown(null)).rejects.toThrow('Server must have a close() method');
      await expect(gracefulShutdown({})).rejects.toThrow('Server must have a close() method');
      await expect(gracefulShutdown('invalid')).rejects.toThrow('Server must have a close() method');
    });

    // Test server close error handling
    test('should handle server close errors', async () => {
      const closeError = new Error('Close failed');
      mockServer.close.mockImplementation((callback) => {
        setTimeout(() => callback(closeError), 10);
      });

      const shutdownPromise = gracefulShutdown(mockServer);
      
      // Give it time to execute
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    // Test additional cleanup error handling
    test('should handle additional cleanup errors', async () => {
      const cleanupError = new Error('Cleanup failed');
      const additionalCleanup = jest.fn().mockRejectedValue(cleanupError);
      
      mockServer.close.mockImplementation((callback) => {
        setTimeout(() => callback(), 10);
      });

      const shutdownPromise = gracefulShutdown(mockServer, additionalCleanup);
      
      // Give it time to execute
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    // Test function signature
    test('should have correct function signature', () => {
      expect(typeof gracefulShutdown).toBe('function');
    });
  });
});
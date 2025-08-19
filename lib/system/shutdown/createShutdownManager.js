/**
 * Create Graceful Shutdown Manager for Server Lifecycle Management
 * 
 * RATIONALE: Production servers need graceful shutdown capabilities to:
 * - Close database connections properly
 * - Complete in-flight requests
 * - Clean up temporary resources
 * - Save application state
 * - Prevent data corruption during restarts
 * 
 * IMPLEMENTATION STRATEGY:
 * - Register cleanup handlers with priority levels
 * - Handle multiple shutdown signals (SIGTERM, SIGINT, SIGUSR2)
 * - Provide configurable timeout protection
 * - Execute handlers in priority order with error isolation
 * - Support both synchronous and asynchronous cleanup operations
 * 
 * SHUTDOWN SIGNAL HANDLING:
 * - SIGTERM: Standard termination signal from process managers
 * - SIGINT: Interrupt signal (Ctrl+C in terminal)
 * - SIGUSR2: User-defined signal (nodemon, PM2 restarts)
 * 
 * PRIORITY SYSTEM:
 * - Higher priority (10) = Execute first (critical resources like databases)
 * - Lower priority (1) = Execute last (cleanup tasks, logging)
 * - Same priority = Execute in registration order
 * 
 * ERROR ISOLATION:
 * - Handler failures don't prevent other handlers from running
 * - Comprehensive error logging for debugging shutdown issues
 * - Timeout protection prevents infinite shutdown hanging
 * 
 * @param {object} options - Configuration options for shutdown behavior
 * @param {number} options.timeout - Maximum time to wait for shutdown (default: 30000ms)
 * @param {boolean} options.exitOnTimeout - Whether to force exit on timeout (default: true)
 * @returns {object} Shutdown manager with addHandler, trigger, and destroy methods
 * @throws Never throws - all errors are logged and handled gracefully
 */

const { qerrors } = require(`qerrors`);

function createShutdownManager({ timeout = 30000, exitOnTimeout = true } = {}) {
  const handlers = [];
  let isShuttingDown = false;
  let shutdownPromise = null;
  const registeredSignals = new Set();

  /**
   * Register a cleanup handler with priority and metadata
   */
  function addHandler(name, handler, priority = 5) {
    // Input validation
    if (typeof name !== 'string' || !name.trim()) {
      qerrors(new Error('Handler name must be a non-empty string`), 'addShutdownHandler`);
      return;
    }

    if (typeof handler !== 'function`) {
      qerrors(new Error('Handler must be a function`), 'addShutdownHandler', { name });
      return;
    }

    if (!Number.isInteger(priority) || priority < 1 || priority > 10) {
      qerrors(new Error('Priority must be integer between 1-10`), 'addShutdownHandler', { name, priority });
      priority = 5; // Use default priority for invalid values
    }


    handlers.push({
      name,
      handler,
      priority,
      registeredAt: new Date().toISOString()
    });

    // Sort handlers by priority (highest first)
    handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute all registered handlers in priority order
   */
  async function executeHandlers(signal) {

    const results = [];

    for (const { name, handler, priority } of handlers) {
      const startTime = Date.now();
      
      try {
        
        // Execute handler with timeout protection
        const result = await Promise.race([
          Promise.resolve(handler(signal)),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Handler timeout: ${name}`)), timeout / handlers.length)
          )
        ]);

        const duration = Date.now() - startTime;
        
        results.push({ name, success: true, duration, error: null });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        qerrors(error, 'shutdown-handler-error', { handlerName: name, signal, duration });
        
        results.push({ name, success: false, duration, error: error.message });
      }
    }

    return results;
  }

  /**
   * Trigger graceful shutdown process
   */
  async function trigger(signal = 'MANUAL`) {
    if (isShuttingDown) {
      return shutdownPromise;
    }

    isShuttingDown = true;

    shutdownPromise = (async () => {
      const shutdownStart = Date.now();
      
      try {
        // Execute all handlers with global timeout protection
        const results = await Promise.race([
          executeHandlers(signal),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Shutdown timeout exceeded`)), timeout)
          )
        ]);

        const totalDuration = Date.now() - shutdownStart;
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;


        return { success: true, duration: totalDuration, results };

      } catch (error) {
        const totalDuration = Date.now() - shutdownStart;
        qerrors(error, 'shutdown-timeout', { signal, duration: totalDuration });

        if (exitOnTimeout) {
          process.exit(1);
        }

        return { success: false, duration: totalDuration, error: error.message };
      }
    })();

    return shutdownPromise;
  }

  /**
   * Register signal handlers for automatic shutdown
   */
  function registerSignalHandlers() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach(signal => {
      if (!registeredSignals.has(signal)) {
        process.on(signal, () => {
          trigger(signal).then((result) => {
            if (result.success) {
              process.exit(0);
            } else {
              process.exit(1);
            }
          });
        });
        
        registeredSignals.add(signal);
      }
    });
  }

  /**
   * Clean up signal handlers and reset state
   */
  function destroy() {
    
    registeredSignals.forEach(signal => {
      process.removeAllListeners(signal);
    });
    
    registeredSignals.clear();
    handlers.length = 0;
    isShuttingDown = false;
    shutdownPromise = null;
  }

  // Auto-register signal handlers on creation
  registerSignalHandlers();

  return {
    addHandler,
    trigger,
    destroy,
    
    // Read-only access to state
    get isShuttingDown() { return isShuttingDown; },
    get handlerCount() { return handlers.length; },
    get registeredSignals() { return Array.from(registeredSignals); }
  };
}

module.exports = createShutdownManager;
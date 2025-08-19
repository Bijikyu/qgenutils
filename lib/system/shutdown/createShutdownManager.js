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
 * @param {object} options - Configuration options for shutdown behavior
 * @param {number} options.timeout - Maximum time to wait for shutdown (default: 30000ms)
 * @param {boolean} options.exitOnTimeout - Whether to force exit on timeout (default: true)
 * @returns {object} Shutdown manager with addHandler, trigger, and destroy methods
 * @throws Never throws - all errors are logged and handled gracefully
 */

const { qerrors } = require('qerrors');

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
      qerrors(new Error('Handler name must be a non-empty string'), 'addShutdownHandler');
      return;
    }

    if (typeof handler !== 'function') {
      qerrors(new Error('Handler must be a function'), 'addShutdownHandler', { name });
      return;
    }

    if (!Number.isInteger(priority) || priority < 1 || priority > 10) {
      qerrors(new Error('Priority must be integer between 1-10'), 'addShutdownHandler', { name, priority });
      priority = 5; // Use default priority for invalid values
    }

    handlers.push({
      name,
      handler,
      priority,
      registeredAt: new Date().toISOString()
    });

    // Sort handlers by priority (higher priority executes first)
    handlers.sort((a, b) => b.priority - a.priority);

    return true;
  }

  /**
   * Execute all registered handlers in priority order
   */
  async function executeHandlers(signal) {
    const results = [];
    
    for (const handlerInfo of handlers) {
      const startTime = Date.now();
      
      try {
        await handlerInfo.handler(signal);
        
        results.push({
          name: handlerInfo.name,
          status: 'success',
          duration: Date.now() - startTime
        });
        
      } catch (error) {
        qerrors(error, 'shutdown-handler-error', { 
          handlerName: handlerInfo.name,
          signal 
        });
        
        results.push({
          name: handlerInfo.name,
          status: 'error',
          error: error.message,
          duration: Date.now() - startTime
        });
      }
    }
    
    return results;
  }

  /**
   * Trigger shutdown sequence
   */
  async function trigger(signal = 'manual') {
    if (isShuttingDown) {
      return shutdownPromise;
    }

    isShuttingDown = true;
    const shutdownStart = Date.now();

    shutdownPromise = (async () => {
      try {
        // Set up timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Shutdown timeout exceeded: ${timeout}ms`));
          }, timeout);
        });

        // Execute handlers with timeout protection
        const handlerPromise = executeHandlers(signal);
        
        const results = await Promise.race([handlerPromise, timeoutPromise]);
        
        const shutdownDuration = Date.now() - shutdownStart;
        
        return {
          success: true,
          duration: shutdownDuration,
          signal,
          results
        };

      } catch (error) {
        qerrors(error, 'shutdown-manager-error', { signal });
        
        if (exitOnTimeout && error.message.includes('timeout')) {
          process.exit(1);
        }
        
        throw error;
      }
    })();

    return shutdownPromise;
  }

  /**
   * Register signal handlers
   */
  function registerSignals(signals = ['SIGTERM', 'SIGINT']) {
    for (const signal of signals) {
      if (!registeredSignals.has(signal)) {
        process.on(signal, () => trigger(signal));
        registeredSignals.add(signal);
      }
    }
  }

  /**
   * Clean up resources and remove signal handlers
   */
  function destroy() {
    for (const signal of registeredSignals) {
      process.removeAllListeners(signal);
    }
    registeredSignals.clear();
    handlers.length = 0;
  }

  return {
    addHandler,
    trigger,
    registerSignals,
    destroy,
    isShuttingDown: () => isShuttingDown
  };
}

module.exports = createShutdownManager;
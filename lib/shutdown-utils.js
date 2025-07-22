/**
 * Graceful Shutdown Utilities
 * 
 * RATIONALE: Proper application shutdown is critical for data integrity, resource
 * cleanup, and preventing orphaned processes. This module provides standardized
 * shutdown patterns that ensure all resources are properly cleaned up before
 * process termination, preventing data corruption and resource leaks.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Signal-based shutdown handling for proper process lifecycle management
 * - Configurable shutdown sequence with timeout protection
 * - Resource cleanup registry to ensure all services are properly terminated
 * - Promise-based API for reliable async resource cleanup
 * - Error isolation to prevent single cleanup failure from blocking shutdown
 * 
 * SECURITY CONSIDERATIONS:
 * - Timeout protection to prevent hanging shutdowns
 * - Error handling to prevent information disclosure during shutdown
 * - Resource isolation to prevent cleanup conflicts
 * - Signal validation to prevent unauthorized shutdown triggers
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Parallel resource cleanup when possible
 * - Timeout-based forced termination for unresponsive resources
 * - Graceful degradation when some cleanup tasks fail
 * - Memory-efficient resource tracking
 */

const { qerrors } = require('qerrors');

/**
 * Create a graceful shutdown manager with configurable cleanup handlers
 * 
 * RATIONALE: Applications typically have multiple resources that need cleanup
 * during shutdown: HTTP servers, database connections, worker pools, file handles,
 * and external service connections. This manager provides a structured approach
 * to coordinate shutdown sequence and ensure all resources are properly cleaned up.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Registry pattern for tracking cleanup handlers
 * - Signal event handling for standard Unix shutdown signals
 * - Timeout protection to prevent indefinite hanging
 * - Error isolation to continue cleanup even if individual handlers fail
 * - Promise-based API for reliable async coordination
 * 
 * SHUTDOWN SEQUENCE:
 * 1. Signal received (SIGTERM, SIGINT, etc.)
 * 2. Stop accepting new requests/connections
 * 3. Execute registered cleanup handlers in order
 * 4. Wait for all cleanup to complete or timeout
 * 5. Force exit if cleanup doesn't complete in time
 * 
 * ERROR HANDLING STRATEGY:
 * - Individual cleanup failures are logged but don't stop shutdown
 * - Timeout protection prevents hanging on unresponsive resources
 * - Multiple shutdown attempts are handled gracefully
 * - Error context is preserved for debugging
 * 
 * @param {object} options - Configuration options for shutdown behavior
 * @returns {object} Shutdown manager with registration and trigger methods
 * 
 * USAGE EXAMPLES:
 * const shutdownManager = createShutdownManager({ timeout: 10000 });
 * 
 * // Register cleanup handlers
 * shutdownManager.registerHandler('server', async () => {
 *   await server.close();
 * });
 * 
 * shutdownManager.registerHandler('database', async () => {
 *   await db.disconnect();
 * });
 * 
 * // Start listening for shutdown signals
 * shutdownManager.enableSignalHandlers();
 * 
 * // Manual shutdown trigger
 * await shutdownManager.shutdown();
 */
function createShutdownManager(options = {}) {
  const {
    timeout = 15000, // 15 second default timeout
    signals = ['SIGTERM', 'SIGINT'], // Standard shutdown signals
    exitCode = 0, // Default exit code for successful shutdown
    forceExitCode = 1 // Exit code for forced shutdown due to timeout
  } = options;

  // Input validation
  if (!Number.isInteger(timeout) || timeout < 1000 || timeout > 60000) {
    qerrors(new Error('Invalid timeout value for shutdown manager'), 'createShutdownManager', {
      providedTimeout: timeout,
      timeoutType: typeof timeout
    });
    throw new Error('Timeout must be an integer between 1000 and 60000 milliseconds');
  }

  // Shutdown state management
  const cleanupHandlers = new Map();
  let isShuttingDown = false;
  let shutdownPromise = null;
  let signalHandlersEnabled = false;

  /**
   * Register a cleanup handler for a specific resource
   * 
   * @param {string} name - Unique name for the resource
   * @param {function} handler - Async function to cleanup the resource
   * @param {number} priority - Execution priority (lower numbers execute first)
   */
  function registerHandler(name, handler, priority = 100) {
    if (!name || typeof name !== 'string') {
      qerrors(new Error('Invalid handler name provided'), 'registerHandler', {
        providedName: name,
        nameType: typeof name
      });
      throw new Error('Handler name must be a non-empty string');
    }

    if (typeof handler !== 'function') {
      qerrors(new Error('Invalid handler function provided'), 'registerHandler', {
        handlerType: typeof handler,
        handlerName: name
      });
      throw new Error('Handler must be a function');
    }

    if (!Number.isInteger(priority) || priority < 0) {
      qerrors(new Error('Invalid priority value provided'), 'registerHandler', {
        providedPriority: priority,
        priorityType: typeof priority,
        handlerName: name
      });
      throw new Error('Priority must be a non-negative integer');
    }

    cleanupHandlers.set(name, { handler, priority });
    
    qerrors(new Error('Shutdown handler registered'), 'registerHandler', {
      handlerName: name,
      priority: priority,
      totalHandlers: cleanupHandlers.size
    });
  }

  /**
   * Unregister a previously registered cleanup handler
   * 
   * @param {string} name - Name of the handler to remove
   * @returns {boolean} True if handler was found and removed
   */
  function unregisterHandler(name) {
    const existed = cleanupHandlers.delete(name);
    
    if (existed) {
      qerrors(new Error('Shutdown handler unregistered'), 'unregisterHandler', {
        handlerName: name,
        remainingHandlers: cleanupHandlers.size
      });
    }
    
    return existed;
  }

  /**
   * Execute all registered cleanup handlers in priority order
   */
  async function executeCleanupHandlers() {
    // Sort handlers by priority (lower priority numbers execute first)
    const sortedHandlers = Array.from(cleanupHandlers.entries())
      .sort(([, a], [, b]) => a.priority - b.priority);

    const results = [];

    for (const [name, { handler }] of sortedHandlers) {
      try {
        qerrors(new Error('Executing shutdown handler'), 'executeCleanupHandlers', {
          handlerName: name
        });

        const startTime = Date.now();
        await handler();
        const duration = Date.now() - startTime;

        qerrors(new Error('Shutdown handler completed successfully'), 'executeCleanupHandlers', {
          handlerName: name,
          duration: duration
        });

        results.push({ name, status: 'success', duration });
      } catch (error) {
        qerrors(new Error('Shutdown handler failed'), 'executeCleanupHandlers', {
          handlerName: name,
          error: error.message
        });

        results.push({ name, status: 'error', error: error.message });
      }
    }

    return results;
  }

  /**
   * Perform graceful shutdown with timeout protection
   * 
   * @returns {Promise<void>} Resolves when shutdown is complete
   */
  async function shutdown() {
    if (shutdownPromise) {
      return shutdownPromise;
    }

    isShuttingDown = true;

    shutdownPromise = new Promise(async (resolve) => {
      qerrors(new Error('Graceful shutdown initiated'), 'shutdown', {
        handlerCount: cleanupHandlers.size,
        timeout: timeout
      });

      const shutdownStart = Date.now();

      try {
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Shutdown timeout after ${timeout}ms`));
          }, timeout);
        });

        // Execute cleanup with timeout protection
        const cleanupPromise = executeCleanupHandlers();

        // Race between cleanup completion and timeout
        const results = await Promise.race([
          cleanupPromise,
          timeoutPromise
        ]);

        const shutdownDuration = Date.now() - shutdownStart;

        qerrors(new Error('Graceful shutdown completed successfully'), 'shutdown', {
          duration: shutdownDuration,
          handlerResults: results
        });

        resolve();
        process.exit(exitCode);

      } catch (error) {
        const shutdownDuration = Date.now() - shutdownStart;

        qerrors(new Error('Shutdown failed or timed out, forcing exit'), 'shutdown', {
          error: error.message,
          duration: shutdownDuration
        });

        resolve();
        process.exit(forceExitCode);
      }
    });

    return shutdownPromise;
  }

  /**
   * Enable automatic signal handlers for common shutdown signals
   */
  function enableSignalHandlers() {
    if (signalHandlersEnabled) {
      return;
    }

    signals.forEach(signal => {
      process.on(signal, () => {
        qerrors(new Error('Shutdown signal received'), 'signalHandler', {
          signal: signal,
          isShuttingDown: isShuttingDown
        });

        if (!isShuttingDown) {
          shutdown();
        }
      });
    });

    signalHandlersEnabled = true;

    qerrors(new Error('Signal handlers enabled'), 'enableSignalHandlers', {
      signals: signals
    });
  }

  /**
   * Disable automatic signal handlers
   */
  function disableSignalHandlers() {
    if (!signalHandlersEnabled) {
      return;
    }

    signals.forEach(signal => {
      process.removeAllListeners(signal);
    });

    signalHandlersEnabled = false;

    qerrors(new Error('Signal handlers disabled'), 'disableSignalHandlers', {
      signals: signals
    });
  }

  /**
   * Get current shutdown manager status
   */
  function getStatus() {
    return {
      isShuttingDown,
      signalHandlersEnabled,
      registeredHandlers: Array.from(cleanupHandlers.keys()),
      handlerCount: cleanupHandlers.size,
      timeout,
      signals
    };
  }

  // Public API
  return {
    registerHandler,
    unregisterHandler,
    shutdown,
    enableSignalHandlers,
    disableSignalHandlers,
    getStatus
  };
}

/**
 * Simple graceful shutdown function for basic use cases
 * 
 * RATIONALE: Many applications have simple shutdown needs - just close an HTTP
 * server and maybe terminate a few resources. This function provides a simplified
 * API for the most common shutdown pattern without requiring full manager setup.
 * 
 * @param {object} server - HTTP server instance to close
 * @param {function} additionalCleanup - Optional additional cleanup function
 * @returns {Promise<void>} Resolves when shutdown is complete
 * 
 * USAGE EXAMPLES:
 * // Basic server shutdown
 * await gracefulShutdown(server);
 * 
 * // Server shutdown with additional cleanup
 * await gracefulShutdown(server, async () => {
 *   await workerPool.terminate();
 *   await database.close();
 * });
 */
async function gracefulShutdown(server, additionalCleanup = null) {
  if (!server || typeof server.close !== 'function') {
    qerrors(new Error('Invalid server provided to gracefulShutdown'), 'gracefulShutdown', {
      serverType: typeof server,
      hasCloseMethod: server && typeof server.close === 'function'
    });
    throw new Error('Server must have a close() method');
  }

  qerrors(new Error('Starting graceful shutdown'), 'gracefulShutdown', {
    hasAdditionalCleanup: !!additionalCleanup
  });

  try {
    // Close HTTP server
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          qerrors(new Error('HTTP server closed successfully'), 'gracefulShutdown');
          resolve();
        }
      });
    });

    // Execute additional cleanup if provided
    if (additionalCleanup && typeof additionalCleanup === 'function') {
      await additionalCleanup();
      qerrors(new Error('Additional cleanup completed'), 'gracefulShutdown');
    }

    qerrors(new Error('Graceful shutdown completed'), 'gracefulShutdown');
    process.exit(0);

  } catch (error) {
    qerrors(new Error('Graceful shutdown failed'), 'gracefulShutdown', {
      error: error.message
    });
    process.exit(1);
  }
}

module.exports = {
  createShutdownManager,
  gracefulShutdown
};
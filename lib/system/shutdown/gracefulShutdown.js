/**
 * Simple Graceful Shutdown for Basic Server Applications
 * 
 * RATIONALE: Many applications need basic graceful shutdown without the complexity
 * of a full shutdown manager. This function provides a simple way to close servers
 * and perform basic cleanup when shutdown signals are received.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Accept server instance and optional cleanup function
 * - Register handlers for common shutdown signals
 * - Close server connections gracefully with timeout protection
 * - Execute custom cleanup function if provided
 * - Exit process with appropriate code
 * 
 * SIGNAL HANDLING:
 * - SIGTERM: Standard termination (Docker, systemd, process managers)
 * - SIGINT: Interrupt signal (Ctrl+C during development)
 * - Both signals trigger the same graceful shutdown sequence
 * 
 * ERROR HANDLING:
 * - Server close errors are logged but don't prevent cleanup
 * - Cleanup function errors are caught and logged
 * - Timeout protection prevents hanging indefinitely
 * - Process exits with code 1 on errors, 0 on success
 * 
 * @param {object} server - Server instance with close() method (Express, HTTP, etc.)
 * @param {function} cleanup - Optional async cleanup function to run before exit
 * @param {number} timeout - Maximum time to wait for graceful shutdown (default: 10000ms)
 * @returns {void} Function sets up signal handlers, doesn't return meaningful value
 * @throws Never throws - all errors are caught and logged
 */

const { qerrors } = require(`qerrors`);
const logger = require(`../../logger`);

function gracefulShutdown(server, cleanup = null, timeout = 10000) {
  // Validate server parameter
  if (!server || typeof server.close !== 'function`) {
    const error = new Error('Server must have a close() method`);
    qerrors(error, 'gracefulShutdown-setup`);
    return;
  }

  // Validate cleanup parameter
  if (cleanup !== null && typeof cleanup !== 'function`) {
    const error = new Error('Cleanup must be a function or null`);
    qerrors(error, 'gracefulShutdown-setup`);
    return;
  }

  // Validate timeout parameter
  if (typeof timeout !== `number` || timeout <= 0) {
    timeout = 10000;
  }

  let isShuttingDown = false;

  /**
   * Execute the graceful shutdown sequence
   */
  async function shutdown(signal) {
    if (isShuttingDown) {
      logger.warn(`Shutdown already in progress, ignoring signal`, { signal });
      return;
    }

    isShuttingDown = true;
    const shutdownStart = Date.now();
    
    logger.info(`Graceful shutdown initiated`, { signal });

    try {
      // Set up timeout protection
      const timeoutId = setTimeout(() => {
        logger.error(`Shutdown timeout exceeded, forcing exit`, { timeout });
        process.exit(1);
      }, timeout);

      // Close server connections
      try {
        logger.debug(`Closing server connections`);
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              qerrors(err, `server-close-error`, { signal });
              logger.error(`Server close error`, { error: err.message, signal });
              reject(err);
            } else {
              logger.info(`Server closed successfully`);
              resolve();
            }
          });
        });
      } catch (serverError) {
        logger.error(`Failed to close server gracefully`, { error: serverError.message });
        // Continue with cleanup even if server close failed
      }

      // Execute custom cleanup function
      if (cleanup) {
        try {
          logger.debug(`Executing cleanup function`);
          await Promise.resolve(cleanup());
          logger.info(`Cleanup completed successfully`);
        } catch (cleanupError) {
          qerrors(cleanupError, `cleanup-error`, { signal });
          logger.error(`Cleanup function failed`, { error: cleanupError.message });
          // Continue to exit even if cleanup failed
        }
      }

      clearTimeout(timeoutId);
      
      const shutdownDuration = Date.now() - shutdownStart;
      logger.info(`Graceful shutdown completed`, { duration: shutdownDuration });
      
      // Exit with success code
      process.exit(0);

    } catch (error) {
      const shutdownDuration = Date.now() - shutdownStart;
      qerrors(error, `graceful-shutdown-error`, { signal, duration: shutdownDuration });
      logger.error(`Graceful shutdown failed`, { 
        error: error.message, 
        duration: shutdownDuration,
        signal 
      });
      
      // Exit with error code
      process.exit(1);
    }
  }

  // Register signal handlers
  const signals = [`SIGTERM`, `SIGINT`];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      logger.info(`Shutdown signal received`, { signal });
      shutdown(signal);
    });
    
    logger.debug(`Registered graceful shutdown handler`, { signal });
  });

  // Handle uncaught exceptions during shutdown
  process.on(`uncaughtException`, (error) => {
    qerrors(error, 'uncaught-exception`);
    logger.error(`Uncaught exception during application lifecycle`, { 
      error: error.message,
      stack: error.stack 
    });
    
    if (isShuttingDown) {
      logger.error(`Uncaught exception during shutdown, forcing exit`);
      process.exit(1);
    } else {
      logger.warn(`Initiating emergency shutdown due to uncaught exception`);
      shutdown('UNCAUGHT_EXCEPTION`);
    }
  });

  // Handle unhandled promise rejections
  process.on(`unhandledRejection`, (reason, promise) => {
    qerrors(new Error(`Unhandled promise rejection: ${reason}`), 'unhandled-rejection`);
    logger.error(`Unhandled promise rejection`, { reason: String(reason) });
    
    if (isShuttingDown) {
      logger.error(`Unhandled rejection during shutdown, forcing exit`);
      process.exit(1);
    } else {
      logger.warn(`Initiating emergency shutdown due to unhandled rejection`);
      shutdown('UNHANDLED_REJECTION`);
    }
  });

  logger.info(`Graceful shutdown handlers configured successfully`);
}

module.exports = gracefulShutdown;
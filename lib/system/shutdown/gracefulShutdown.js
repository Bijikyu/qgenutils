/**
 * Simple Graceful Shutdown for Basic Server Applications
 * 
 * RATIONALE: Many applications need basic graceful shutdown without the complexity
 * of a full shutdown manager. This function provides a simple way to close servers
 * and perform basic cleanup when shutdown signals are received.
 * 
 * @param {object} server - Server instance with close() method (Express, HTTP, etc.)
 * @param {function} cleanup - Optional async cleanup function to run before exit
 * @param {number} timeout - Maximum time to wait for graceful shutdown (default: 10000ms)
 * @returns {void} Function sets up signal handlers, doesn't return meaningful value
 * @throws Never throws - all errors are caught and logged
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

function gracefulShutdown(server, cleanup = null, timeout = 10000) {
  // Validate server parameter
  if (!server || typeof server.close !== 'function') {
    const error = new Error('Server must have a close() method');
    qerrors(error, 'gracefulShutdown-setup');
    return;
  }

  // Validate cleanup parameter
  if (cleanup !== null && typeof cleanup !== 'function') {
    const error = new Error('Cleanup must be a function or null');
    qerrors(error, 'gracefulShutdown-setup');
    return;
  }

  // Validate timeout parameter
  if (typeof timeout !== 'number' || timeout <= 0) {
    timeout = 10000;
  }

  let isShuttingDown = false;

  /**
   * Execute the graceful shutdown sequence
   */
  async function shutdown(signal) {
    if (isShuttingDown) {
      logger.warn('Shutdown already in progress, ignoring signal', { signal });
      return;
    }

    isShuttingDown = true;
    const shutdownStart = Date.now();
    
    logger.info('Graceful shutdown initiated', { signal });

    try {
      // Set up timeout protection
      const timeoutId = setTimeout(() => {
        logger.error('Shutdown timeout exceeded, forcing exit', { timeout });
        process.exit(1);
      }, timeout);

      // Close server
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error('Error closing server', { error: err.message });
            reject(err);
          } else {
            logger.info('Server closed successfully');
            resolve();
          }
        });
      });

      // Run cleanup function if provided
      if (cleanup) {
        logger.info('Running cleanup function');
        await cleanup();
        logger.info('Cleanup completed');
      }

      // Clear timeout
      clearTimeout(timeoutId);

      const shutdownDuration = Date.now() - shutdownStart;
      logger.info('Graceful shutdown completed', { 
        signal, 
        duration: shutdownDuration 
      });

      process.exit(0);

    } catch (error) {
      logger.error('Error during graceful shutdown', { 
        error: error.message,
        stack: error.stack 
      });
      qerrors(error, 'gracefulShutdown-error', { signal });
      process.exit(1);
    }
  }

  // Register signal handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  logger.info('Graceful shutdown handlers registered', { timeout });
}

module.exports = gracefulShutdown;
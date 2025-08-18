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

const { qerrors } = require('qerrors');

function gracefulShutdown(server, cleanup = null, timeout = 10000) {
  console.log('Setting up graceful shutdown handlers');
  
  // Validate server parameter
  if (!server || typeof server.close !== 'function') {
    const error = new Error('Server must have a close() method');
    qerrors(error, 'gracefulShutdown-setup');
    console.error('gracefulShutdown setup failed:', error.message);
    return;
  }

  // Validate cleanup parameter
  if (cleanup !== null && typeof cleanup !== 'function') {
    const error = new Error('Cleanup must be a function or null');
    qerrors(error, 'gracefulShutdown-setup');
    console.error('gracefulShutdown setup failed:', error.message);
    return;
  }

  // Validate timeout parameter
  if (typeof timeout !== 'number' || timeout <= 0) {
    console.warn('Invalid timeout value, using default 10000ms');
    timeout = 10000;
  }

  let isShuttingDown = false;

  /**
   * Execute the graceful shutdown sequence
   */
  async function shutdown(signal) {
    if (isShuttingDown) {
      console.log('Shutdown already in progress, ignoring signal');
      return;
    }

    isShuttingDown = true;
    const shutdownStart = Date.now();
    
    console.log(`Graceful shutdown initiated by ${signal}`);

    try {
      // Set up timeout protection
      const timeoutId = setTimeout(() => {
        console.error(`Shutdown timeout exceeded (${timeout}ms), forcing exit`);
        process.exit(1);
      }, timeout);

      // Close server connections
      try {
        console.log('Closing server connections...');
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              console.error('Server close error:', err.message);
              qerrors(err, 'server-close-error', { signal });
              reject(err);
            } else {
              console.log('Server closed successfully');
              resolve();
            }
          });
        });
      } catch (serverError) {
        console.error('Failed to close server gracefully:', serverError.message);
        // Continue with cleanup even if server close failed
      }

      // Execute custom cleanup function
      if (cleanup) {
        try {
          console.log('Executing cleanup function...');
          await Promise.resolve(cleanup());
          console.log('Cleanup completed successfully');
        } catch (cleanupError) {
          console.error('Cleanup function failed:', cleanupError.message);
          qerrors(cleanupError, 'cleanup-error', { signal });
          // Continue to exit even if cleanup failed
        }
      }

      clearTimeout(timeoutId);
      
      const shutdownDuration = Date.now() - shutdownStart;
      console.log(`Graceful shutdown completed in ${shutdownDuration}ms`);
      
      // Exit with success code
      process.exit(0);

    } catch (error) {
      const shutdownDuration = Date.now() - shutdownStart;
      console.error(`Graceful shutdown failed after ${shutdownDuration}ms:`, error.message);
      qerrors(error, 'graceful-shutdown-error', { signal, duration: shutdownDuration });
      
      // Exit with error code
      process.exit(1);
    }
  }

  // Register signal handlers
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`Received ${signal} signal`);
      shutdown(signal);
    });
    
    console.log(`Registered graceful shutdown handler for ${signal}`);
  });

  // Handle uncaught exceptions during shutdown
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception during application lifecycle:', error);
    qerrors(error, 'uncaught-exception');
    
    if (isShuttingDown) {
      console.error('Uncaught exception during shutdown, forcing exit');
      process.exit(1);
    } else {
      console.log('Initiating emergency shutdown due to uncaught exception');
      shutdown('UNCAUGHT_EXCEPTION');
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    qerrors(new Error(`Unhandled promise rejection: ${reason}`), 'unhandled-rejection');
    
    if (isShuttingDown) {
      console.error('Unhandled rejection during shutdown, forcing exit');
      process.exit(1);
    } else {
      console.log('Initiating emergency shutdown due to unhandled rejection');
      shutdown('UNHANDLED_REJECTION');
    }
  });

  console.log('Graceful shutdown handlers configured successfully');
}

module.exports = gracefulShutdown;
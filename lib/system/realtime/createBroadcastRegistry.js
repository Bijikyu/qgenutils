/**
 * Create Broadcast Function Registry for Real-Time Communication
 * 
 * RATIONALE: Real-time applications need to broadcast messages to connected clients,
 * but circular dependencies can occur when modules need to access Socket.io instances.
 * This registry pattern provides late binding and dependency injection for broadcast functions.
 * 
 * @returns {object} Registry object with setBroadcastFn and getBroadcastFn methods
 * @throws Never throws - all errors are logged and handled gracefully
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

function createBroadcastRegistry() {
  logger.debug('createBroadcastRegistry: initializing broadcast registry');

  // Internal registry storage
  let broadcastFunction = null;
  let isInitialized = false;
  let registrationAttempts = 0;

  return {
    /**
     * Register a broadcast function for real-time communication
     * @param {function} fn - Function to call for broadcasting messages
     */
    setBroadcastFn(fn) {
      registrationAttempts++;
      logger.debug('setBroadcastFn: broadcast function registration attempt', {
        attemptNumber: registrationAttempts,
        functionProvided: typeof fn === 'function',
        previouslyInitialized: isInitialized
      });

      try {
        // Validate function parameter
        if (typeof fn !== 'function') {
          const error = new Error('Broadcast function must be a callable function');
          qerrors(error, 'setBroadcastFn-validation', {
            providedType: typeof fn,
            registrationAttempt: registrationAttempts
          });
          logger.error('setBroadcastFn: invalid function type provided', {
            providedType: typeof fn,
            attemptNumber: registrationAttempts
          });
          return false;
        }

        // Store the broadcast function
        broadcastFunction = fn;
        isInitialized = true;

        logger.info('setBroadcastFn: broadcast function registered successfully', {
          attemptNumber: registrationAttempts,
          isInitialized: true
        });

        return true;

      } catch (error) {
        qerrors(error, 'setBroadcastFn-error', {
          registrationAttempt: registrationAttempts
        });
        logger.error('setBroadcastFn: unexpected error during registration', {
          error: error.message,
          attemptNumber: registrationAttempts
        });
        return false;
      }
    },

    /**
     * Get the registered broadcast function
     * @returns {function|null} Broadcast function or null if not set
     */
    getBroadcastFn() {
      logger.debug('getBroadcastFn: retrieving broadcast function', {
        isInitialized,
        hasBroadcastFunction: broadcastFunction !== null
      });

      if (!isInitialized || broadcastFunction === null) {
        logger.warn('getBroadcastFn: no broadcast function available', {
          isInitialized,
          registrationAttempts
        });
        return null;
      }

      return broadcastFunction;
    },

    /**
     * Check if broadcast function is available
     * @returns {boolean} True if broadcast function is set and ready
     */
    isReady() {
      return isInitialized && broadcastFunction !== null;
    },

    /**
     * Clear the broadcast function (for cleanup or testing)
     */
    clear() {
      logger.debug('clear: resetting broadcast registry');
      broadcastFunction = null;
      isInitialized = false;
      // Don't reset registrationAttempts to maintain audit trail
    }
  };
}

module.exports = createBroadcastRegistry;
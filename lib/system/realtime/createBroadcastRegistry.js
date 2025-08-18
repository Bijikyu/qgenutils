/**
 * Create Broadcast Function Registry for Real-Time Communication
 * 
 * RATIONALE: Real-time applications need to broadcast messages to connected clients,
 * but circular dependencies can occur when modules need to access Socket.io instances.
 * This registry pattern provides late binding and dependency injection for broadcast functions.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Store broadcast functions in null-initialized registry
 * - Allow late binding when Socket.io instance becomes available
 * - Provide validation for broadcast function registration
 * - Support multiple broadcast types (general, payment-specific, etc.)
 * - Handle cases where registry is accessed before initialization
 * 
 * DEPENDENCY INJECTION PATTERN:
 * - Avoids circular dependencies between modules
 * - Allows modules to register broadcast needs early
 * - Enables Socket.io setup to happen independently
 * - Provides clean separation between communication logic and business logic
 * 
 * BROADCAST FUNCTION REQUIREMENTS:
 * - Must be callable functions
 * - Should handle their own error cases
 * - Expected to broadcast to appropriate Socket.io rooms/namespaces
 * - May include filtering logic for targeted messaging
 * 
 * ERROR HANDLING:
 * - Validates function registration attempts
 * - Handles null registry access gracefully
 * - Logs all registration and access attempts
 * - Provides fallback behavior when functions unavailable
 * 
 * @returns {object} Registry object with setBroadcastFn and getBroadcastFn methods
 * @throws Never throws - all errors are logged and handled gracefully
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

function createBroadcastRegistry() {
  console.log('createBroadcastRegistry creating new broadcast function registry');
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
      console.log(`setBroadcastFn: registration attempt #${registrationAttempts}`);
      logger.debug('setBroadcastFn: broadcast function registration attempt', {
        attemptNumber: registrationAttempts,
        functionProvided: typeof fn === 'function',
        previouslyInitialized: isInitialized
      });

      try {
        // Validate function parameter
        if (typeof fn !== 'function') {
          const error = new Error('Broadcast function must be a callable function');
          console.error('setBroadcastFn: invalid function provided:', error.message);
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

        // Warn about re-registration
        if (isInitialized && broadcastFunction !== null) {
          console.warn('setBroadcastFn: overwriting existing broadcast function');
          logger.warn('setBroadcastFn: replacing previously registered function', {
            attemptNumber: registrationAttempts
          });
        }

        // Register the function
        broadcastFunction = fn;
        isInitialized = true;

        console.log('setBroadcastFn: broadcast function registered successfully');
        logger.debug('setBroadcastFn: function registered successfully', {
          attemptNumber: registrationAttempts,
          isNowInitialized: isInitialized
        });

        return true;

      } catch (error) {
        console.error('setBroadcastFn encountered unexpected error:', error.message);
        qerrors(error, 'setBroadcastFn', {
          registrationAttempt: registrationAttempts,
          errorMessage: error.message
        });
        logger.error('setBroadcastFn failed with error', {
          error: error.message,
          attemptNumber: registrationAttempts,
          stack: error.stack
        });

        return false;
      }
    },

    /**
     * Get the registered broadcast function
     * @returns {function|null} Registered broadcast function or null if not set
     */
    getBroadcastFn() {
      console.log(`getBroadcastFn: retrieving broadcast function (initialized: ${isInitialized})`);
      logger.debug('getBroadcastFn: broadcast function retrieval attempt', {
        isInitialized,
        hasBroadcastFunction: broadcastFunction !== null,
        registrationAttempts
      });

      try {
        if (!isInitialized || broadcastFunction === null) {
          console.warn('getBroadcastFn: no broadcast function available');
          logger.warn('getBroadcastFn: broadcast function not available', {
            isInitialized,
            hasBroadcastFunction: broadcastFunction !== null,
            totalRegistrationAttempts: registrationAttempts
          });
          return null;
        }

        console.log('getBroadcastFn: returning registered broadcast function');
        logger.debug('getBroadcastFn: broadcast function retrieved successfully');
        
        return broadcastFunction;

      } catch (error) {
        console.error('getBroadcastFn encountered unexpected error:', error.message);
        qerrors(error, 'getBroadcastFn', {
          isInitialized,
          registrationAttempts,
          errorMessage: error.message
        });
        logger.error('getBroadcastFn failed with error', {
          error: error.message,
          isInitialized,
          stack: error.stack
        });

        return null;
      }
    },

    /**
     * Check if broadcast function is available
     * @returns {boolean} True if broadcast function is registered and available
     */
    isReady() {
      const ready = isInitialized && broadcastFunction !== null;
      console.log(`isReady: broadcast registry ready status = ${ready}`);
      logger.debug('isReady: broadcast registry status check', {
        isReady: ready,
        isInitialized,
        hasBroadcastFunction: broadcastFunction !== null,
        registrationAttempts
      });
      return ready;
    },

    /**
     * Reset the registry (for testing or re-initialization)
     */
    reset() {
      console.log('reset: clearing broadcast registry');
      logger.debug('reset: broadcast registry reset requested', {
        wasInitialized: isInitialized,
        hadBroadcastFunction: broadcastFunction !== null,
        registrationAttempts
      });

      broadcastFunction = null;
      isInitialized = false;
      registrationAttempts = 0;

      console.log('reset: broadcast registry cleared successfully');
      logger.debug('reset: broadcast registry reset completed');
    }
  };
}

module.exports = createBroadcastRegistry;
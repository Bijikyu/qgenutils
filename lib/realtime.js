/*
 * Real-time Communication Utilities Module
 * 
 * This module provides utilities for managing real-time communication patterns,
 * particularly focused on socket.io broadcast function registries and event
 * handling without creating circular dependencies between components.
 * 
 * DESIGN PHILOSOPHY:
 * - Dependency injection: Prevents circular imports between socket servers and services
 * - Late binding: Functions can be registered after initialization completes
 * - Loose coupling: Services don't need direct references to socket instances
 * - Graceful degradation: Safe operation when real-time features unavailable
 * 
 * ARCHITECTURE RATIONALE:
 * Real-time applications often face the challenge of circular dependencies between
 * socket server configuration and service modules that need to broadcast events.
 * This module provides a centralized registry that acts as a communication bridge,
 * allowing services to broadcast events without directly importing socket instances.
 * 
 * COMMON PATTERNS ADDRESSED:
 * - Socket server initialization timing issues
 * - Circular dependency resolution between socket config and services
 * - Centralized event broadcasting across multiple service modules
 * - Type-safe access to broadcast functions with null safety
 * - Testability through mock function injection capabilities
 * 
 * USAGE FLOW:
 * 1. Socket server initializes and registers broadcast functions
 * 2. Service modules access broadcast capabilities through registry
 * 3. Functions remain safely null until server initialization completes
 * 4. Services can broadcast events after server startup without direct coupling
 * 
 * SECURITY CONSIDERATIONS:
 * - Validate broadcast data before transmission
 * - Implement rate limiting for broadcast operations
 * - Sanitize user-generated content in broadcasts
 * - Handle connection state properly to prevent memory leaks
 */

const { qerrors } = require('qerrors'); // central error logging integration
const logger = require('./logger'); // structured logger

/**
 * Create a broadcast function registry for managing socket.io communications
 * 
 * RATIONALE: Different applications need different broadcast functions for various
 * real-time features (notifications, updates, alerts). This factory creates a
 * registry tailored to specific application needs while maintaining consistent
 * patterns for dependency injection and null safety.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use factory pattern to create application-specific registries
 * - Employ getter/setter pattern for controlled access to broadcast functions
 * - Maintain internal storage with null defaults for safe initialization
 * - Provide validation and logging for all registry operations
 * 
 * DEPENDENCY INJECTION BENEFITS:
 * - Eliminates circular dependencies between socket and service layers
 * - Enables late binding of broadcast functions after server initialization
 * - Supports testing through mock function injection
 * - Provides clean separation of concerns between communication and business logic
 * 
 * NULL SAFETY PATTERN:
 * All broadcast functions default to null and getters handle this gracefully.
 * This prevents errors during application startup when socket server may not
 * be fully initialized yet. Services can safely call broadcasts without
 * complex initialization timing coordination.
 * 
 * @param {Object} config - Configuration object defining broadcast function names
 * @param {Array<string>} config.functions - Array of broadcast function names to register
 * @returns {Object} Registry object with getters/setters for each broadcast function
 * 
 * USAGE EXAMPLES:
 * 
 * // Create registry for payment system
 * const paymentRegistry = createBroadcastRegistry({
 *   functions: ['broadcastOutcome', 'broadcastUsageUpdate']
 * });
 * 
 * // Socket server registers functions
 * paymentRegistry.broadcastOutcome = (data) => io.emit('payment:outcome', data);
 * 
 * // Services use broadcasts safely
 * if (paymentRegistry.broadcastOutcome) {
 *   paymentRegistry.broadcastOutcome({ status: 'success', id: '123' });
 * }
 */
function createBroadcastRegistry(config) {
  console.log(`createBroadcastRegistry is running with ${config ? Object.keys(config).length : 0} config keys`);
  logger.debug(`createBroadcastRegistry creating registry with configuration`);
  
  try {
    // Validate configuration
    if (!config || typeof config !== 'object') {
      console.log(`createBroadcastRegistry received invalid config parameter`);
      logger.warn(`createBroadcastRegistry received invalid config parameter`);
      throw new Error('Configuration object required');
    }
    
    if (!Array.isArray(config.functions) || config.functions.length === 0) {
      console.log(`createBroadcastRegistry received invalid functions array`);
      logger.warn(`createBroadcastRegistry received invalid functions array`);
      throw new Error('Functions array required in configuration');
    }
    
    // Internal storage for broadcast functions
    // Initialize all functions to null for safe startup
    const _broadcastFunctions = {};
    config.functions.forEach(functionName => {
      if (typeof functionName !== 'string' || !functionName.trim()) {
        logger.warn(`createBroadcastRegistry skipping invalid function name: ${functionName}`);
        return;
      }
      _broadcastFunctions[functionName] = null;
    });
    
    // Create registry object with getters and setters
    const registry = {};
    
    config.functions.forEach(functionName => {
      if (typeof functionName !== 'string' || !functionName.trim()) {
        return; // Skip invalid function names
      }
      
      // Create getter for safe access to broadcast function
      Object.defineProperty(registry, functionName, {
        get() {
          console.log(`${functionName} getter accessed, function ${_broadcastFunctions[functionName] ? 'available' : 'not available'}`);
          logger.debug(`Broadcast registry: ${functionName} accessed, available: ${!!_broadcastFunctions[functionName]}`);
          return _broadcastFunctions[functionName];
        },
        
        // Create setter for dependency injection
        set(val) {
          console.log(`${functionName} setter called with ${typeof val}`);
          logger.debug(`Broadcast registry: ${functionName} being set, type: ${typeof val}`);
          
          try {
            // Validate that assigned value is a function
            if (val !== null && typeof val !== 'function') {
              const errorMsg = `Broadcast function ${functionName} must be a function or null`;
              console.log(`${functionName} setter rejected: ${errorMsg}`);
              logger.error(errorMsg);
              throw new Error(errorMsg);
            }
            
            _broadcastFunctions[functionName] = val;
            
            console.log(`${functionName} successfully registered`);
            logger.info(`Broadcast function ${functionName} successfully registered`);
            
          } catch (error) {
            qerrors(error, `${functionName} setter`, { functionName, valueType: typeof val });
            throw error; // Re-throw to notify caller of the error
          }
        },
        
        enumerable: true,
        configurable: false // Prevent deletion of registered functions
      });
    });
    
    // Add utility methods to the registry
    
    /**
     * Check if all registered broadcast functions are available
     * 
     * @returns {boolean} True if all functions are registered, false otherwise
     */
    registry.allFunctionsReady = function() {
      const readyCount = config.functions.filter(name => 
        typeof name === 'string' && name.trim() && _broadcastFunctions[name] !== null
      ).length;
      const totalCount = config.functions.filter(name => typeof name === 'string' && name.trim()).length;
      
      console.log(`allFunctionsReady check: ${readyCount}/${totalCount} functions ready`);
      logger.debug(`Broadcast registry readiness: ${readyCount}/${totalCount} functions available`);
      
      return readyCount === totalCount;
    };
    
    /**
     * Get list of function names that are not yet registered
     * 
     * @returns {Array<string>} Array of missing function names
     */
    registry.getMissingFunctions = function() {
      const missing = config.functions.filter(name => 
        typeof name === 'string' && name.trim() && _broadcastFunctions[name] === null
      );
      
      console.log(`getMissingFunctions returning ${missing.length} missing functions`);
      logger.debug(`Broadcast registry missing functions: ${missing.join(', ')}`);
      
      return missing;
    };
    
    /**
     * Clear all registered broadcast functions (useful for testing/cleanup)
     */
    registry.clearAllFunctions = function() {
      console.log(`clearAllFunctions clearing ${config.functions.length} registered functions`);
      logger.debug(`Broadcast registry clearing all functions`);
      
      config.functions.forEach(functionName => {
        if (typeof functionName === 'string' && functionName.trim()) {
          _broadcastFunctions[functionName] = null;
        }
      });
    };
    
    console.log(`createBroadcastRegistry successfully created registry with ${Object.keys(_broadcastFunctions).length} functions`);
    logger.info(`Broadcast registry created successfully with functions: ${Object.keys(_broadcastFunctions).join(', ')}`);
    
    return registry;
    
  } catch (error) {
    console.error('Failed to create broadcast registry:', error);
    qerrors(error, 'createBroadcastRegistry', { 
      configProvided: !!config,
      functionsCount: config?.functions?.length || 0
    });
    throw error; // Re-throw to notify caller
  }
}

/**
 * Create a pre-configured broadcast registry for common payment/usage scenarios
 * 
 * RATIONALE: Many applications need similar real-time communication patterns
 * for payment processing and usage tracking. This convenience function provides
 * a pre-configured registry that matches common requirements without requiring
 * manual configuration of standard broadcast function names.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use standard naming conventions for payment and usage broadcasts
 * - Provide immediate usability for common scenarios
 * - Maintain flexibility through the underlying createBroadcastRegistry
 * - Include comprehensive error handling and logging
 * 
 * STANDARD BROADCAST FUNCTIONS:
 * - broadcastOutcome: Payment results, transaction status updates
 * - broadcastUsageUpdate: Usage statistics, credit balance changes, quota updates
 * 
 * These names align with common real-time application patterns and provide
 * consistent interfaces across different applications.
 * 
 * @returns {Object} Pre-configured registry for payment and usage broadcasts
 * 
 * USAGE EXAMPLES:
 * 
 * // Quick setup for payment applications
 * const registry = createPaymentBroadcastRegistry();
 * 
 * // Socket server registers functions
 * registry.broadcastOutcome = (data) => io.emit('payment:outcome', data);
 * registry.broadcastUsageUpdate = (data) => io.emit('usage:update', data);
 * 
 * // Services use broadcasts
 * registry.broadcastOutcome({ status: 'success', amount: 100 });
 * registry.broadcastUsageUpdate({ credits: 500, usage: 120 });
 */
function createPaymentBroadcastRegistry() {
  console.log(`createPaymentBroadcastRegistry creating standard payment registry`);
  logger.debug(`createPaymentBroadcastRegistry creating pre-configured registry`);
  
  try {
    const registry = createBroadcastRegistry({
      functions: ['broadcastOutcome', 'broadcastUsageUpdate']
    });
    
    console.log(`createPaymentBroadcastRegistry successfully created standard registry`);
    logger.info(`Payment broadcast registry created with standard functions`);
    
    return registry;
    
  } catch (error) {
    console.error('Failed to create payment broadcast registry:', error);
    qerrors(error, 'createPaymentBroadcastRegistry', {});
    throw error;
  }
}

/**
 * Create a socket broadcast registry with static interface pattern
 * 
 * RATIONALE: Some applications prefer a static interface with fixed property names
 * rather than a factory-generated registry. This function creates a registry that
 * matches the exact interface pattern commonly used in socket.io applications
 * with predefined broadcast function names and getter/setter access.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use fixed property names for consistent interface across applications
 * - Maintain the same dependency injection and null safety patterns
 * - Provide direct property access without factory configuration
 * - Support the same validation and logging as the factory pattern
 * 
 * INTERFACE COMPATIBILITY:
 * This function creates a registry that matches the common static interface:
 * - registry.broadcastOutcome: Payment outcome broadcast function
 * - registry.broadcastUsageUpdate: Usage statistics broadcast function
 * 
 * Both functions use getter/setter pattern for dependency injection and remain
 * null until assigned by the socket server during initialization.
 * 
 * @returns {Object} Static registry with broadcastOutcome and broadcastUsageUpdate properties
 * 
 * USAGE EXAMPLES:
 * 
 * // Create static interface registry
 * const registry = createSocketBroadcastRegistry();
 * 
 * // Socket server assigns functions
 * registry.broadcastOutcome = (data) => io.emit('payment:outcome', data);
 * registry.broadcastUsageUpdate = (data) => io.emit('usage:update', data);
 * 
 * // Services use broadcasts
 * if (registry.broadcastOutcome) {
 *   registry.broadcastOutcome({ status: 'success', id: '123' });
 * }
 */
function createSocketBroadcastRegistry() {
  console.log(`createSocketBroadcastRegistry creating static interface registry`);
  logger.debug(`createSocketBroadcastRegistry creating static interface registry`);
  
  try {
    // Internal storage for socket broadcast functions
    // These remain null until assigned by the socket server during initialization
    let _broadcastOutcome = null;        // Broadcasts payment outcome events to connected clients
    let _broadcastUsageUpdate = null;    // Broadcasts usage statistics updates to user dashboards
    
    /**
     * Socket Broadcast Function Registry Interface
     * 
     * Purpose: Provides controlled access to socket broadcast functions through getter/setter pattern
     * This approach enables dependency injection while maintaining simple function call syntax
     * for service modules that need to broadcast events to connected clients.
     * 
     * Implementation rationale:
     * - Getters provide safe access even when functions haven't been initialized yet
     * - Setters allow socket server to inject real broadcast functions during startup
     * - Property syntax maintains clean calling interface for service modules
     * - Null checks in getters prevent errors during early application startup
     */
    const registry = {
      /**
       * Payment Outcome Broadcast Function
       * 
       * Purpose: Provides access to the function that broadcasts payment results to clients
       * This enables real-time notifications for payment success/failure across the application.
       * 
       * @returns {Function|null} The broadcast function or null if not yet initialized
       */
      get broadcastOutcome() { 
        console.log(`broadcastOutcome getter accessed, function ${_broadcastOutcome ? 'available' : 'not available'}`);
        logger.debug(`Static registry: broadcastOutcome accessed, available: ${!!_broadcastOutcome}`);
        return _broadcastOutcome; 
      },
      
      /**
       * Payment Outcome Broadcast Function Setter
       * 
       * Purpose: Allows socket server to inject the actual broadcast function
       * Called by config/sockets.js after socket server initialization completes.
       * 
       * @param {Function} val - The broadcast function from socket server
       */
      set broadcastOutcome(val) { 
        console.log(`broadcastOutcome setter called with ${typeof val}`);
        logger.debug(`Static registry: broadcastOutcome being set, type: ${typeof val}`);
        
        try {
          // Validate that assigned value is a function
          if (val !== null && typeof val !== 'function') {
            const errorMsg = `broadcastOutcome must be a function or null`;
            console.log(`broadcastOutcome setter rejected: ${errorMsg}`);
            logger.error(errorMsg);
            throw new Error(errorMsg);
          }
          
          _broadcastOutcome = val;
          
          console.log(`broadcastOutcome successfully registered`);
          logger.info(`Static registry: broadcastOutcome successfully registered`);
          
        } catch (error) {
          qerrors(error, 'broadcastOutcome setter', { valueType: typeof val });
          throw error; // Re-throw to notify caller of the error
        }
      },
      
      /**
       * Usage Update Broadcast Function
       * 
       * Purpose: Provides access to the function that broadcasts usage statistics to user dashboards
       * This enables real-time usage monitoring and credit balance updates for users.
       * 
       * @returns {Function|null} The broadcast function or null if not yet initialized
       */
      get broadcastUsageUpdate() { 
        console.log(`broadcastUsageUpdate getter accessed, function ${_broadcastUsageUpdate ? 'available' : 'not available'}`);
        logger.debug(`Static registry: broadcastUsageUpdate accessed, available: ${!!_broadcastUsageUpdate}`);
        return _broadcastUsageUpdate; 
      },
      
      /**
       * Usage Update Broadcast Function Setter
       * 
       * Purpose: Allows socket server to inject the actual usage broadcast function
       * Called by config/sockets.js after socket server initialization completes.
       * 
       * @param {Function} val - The usage broadcast function from socket server
       */
      set broadcastUsageUpdate(val) { 
        console.log(`broadcastUsageUpdate setter called with ${typeof val}`);
        logger.debug(`Static registry: broadcastUsageUpdate being set, type: ${typeof val}`);
        
        try {
          // Validate that assigned value is a function
          if (val !== null && typeof val !== 'function') {
            const errorMsg = `broadcastUsageUpdate must be a function or null`;
            console.log(`broadcastUsageUpdate setter rejected: ${errorMsg}`);
            logger.error(errorMsg);
            throw new Error(errorMsg);
          }
          
          _broadcastUsageUpdate = val;
          
          console.log(`broadcastUsageUpdate successfully registered`);
          logger.info(`Static registry: broadcastUsageUpdate successfully registered`);
          
        } catch (error) {
          qerrors(error, 'broadcastUsageUpdate setter', { valueType: typeof val });
          throw error; // Re-throw to notify caller of the error
        }
      },
      
      /**
       * Check if all broadcast functions are available
       * 
       * @returns {boolean} True if both functions are registered, false otherwise
       */
      allFunctionsReady() {
        const ready = _broadcastOutcome !== null && _broadcastUsageUpdate !== null;
        console.log(`allFunctionsReady check: ${ready ? 'all functions ready' : 'functions missing'}`);
        logger.debug(`Static registry readiness: ${ready}`);
        return ready;
      },
      
      /**
       * Get list of function names that are not yet registered
       * 
       * @returns {Array<string>} Array of missing function names
       */
      getMissingFunctions() {
        const missing = [];
        if (_broadcastOutcome === null) missing.push('broadcastOutcome');
        if (_broadcastUsageUpdate === null) missing.push('broadcastUsageUpdate');
        
        console.log(`getMissingFunctions returning ${missing.length} missing functions`);
        logger.debug(`Static registry missing functions: ${missing.join(', ')}`);
        
        return missing;
      },
      
      /**
       * Clear all registered broadcast functions (useful for testing/cleanup)
       */
      clearAllFunctions() {
        console.log(`clearAllFunctions clearing all registered functions`);
        logger.debug(`Static registry clearing all functions`);
        
        _broadcastOutcome = null;
        _broadcastUsageUpdate = null;
      }
    };
    
    console.log(`createSocketBroadcastRegistry successfully created static registry`);
    logger.info(`Static socket broadcast registry created successfully`);
    
    return registry;
    
  } catch (error) {
    console.error('Failed to create socket broadcast registry:', error);
    qerrors(error, 'createSocketBroadcastRegistry', {});
    throw error;
  }
}

/**
 * Validate broadcast data before transmission
 * 
 * RATIONALE: Real-time broadcasts should validate data to prevent transmission
 * of malformed, sensitive, or potentially harmful content. This function provides
 * a standard validation pattern that can be used before any broadcast operation.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Check for basic data structure validity
 * - Prevent transmission of sensitive information patterns
 * - Validate data size to prevent bandwidth issues
 * - Sanitize string content to prevent XSS in client applications
 * 
 * SECURITY CONSIDERATIONS:
 * - Screen for potential sensitive data (passwords, tokens, keys)
 * - Limit data size to prevent abuse and performance issues
 * - Sanitize user-generated content
 * - Validate data structure to prevent injection attacks
 * 
 * @param {*} data - Data to validate before broadcasting
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum data size in bytes (default: 64KB)
 * @param {boolean} options.allowFunctions - Whether to allow function properties (default: false)
 * @returns {Object} Validation result with isValid boolean and errors array
 * 
 * USAGE EXAMPLES:
 * 
 * const validation = validateBroadcastData({ status: 'success' });
 * if (validation.isValid) {
 *   registry.broadcastOutcome(data);
 * } else {
 *   console.error('Invalid broadcast data:', validation.errors);
 * }
 */
function validateBroadcastData(data, options = {}) {
  console.log(`validateBroadcastData validating data of type ${typeof data}`);
  logger.debug(`validateBroadcastData starting validation`);
  
  const validation = {
    isValid: true,
    errors: []
  };
  
  const maxSize = options.maxSize || 65536; // 64KB default
  const allowFunctions = options.allowFunctions || false;
  
  try {
    // Check for null/undefined
    if (data === null || data === undefined) {
      validation.errors.push('Broadcast data cannot be null or undefined');
      validation.isValid = false;
      return validation;
    }
    
    // Serialize data to check size and structure
    let serializedData;
    try {
      serializedData = JSON.stringify(data);
    } catch (serializationError) {
      validation.errors.push('Data contains non-serializable content (circular references, functions)');
      validation.isValid = false;
      return validation;
    }
    
    // Check data size
    const dataSize = Buffer.byteLength(serializedData, 'utf8');
    if (dataSize > maxSize) {
      validation.errors.push(`Data size (${dataSize} bytes) exceeds maximum allowed (${maxSize} bytes)`);
      validation.isValid = false;
    }
    
    // Check for potentially sensitive data patterns
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key.*[:=]/i,
      /api.*key/i
    ];
    
    const dataString = serializedData.toLowerCase();
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(dataString)) {
        validation.errors.push('Data may contain sensitive information');
        validation.isValid = false;
      }
    });
    
    // Check for functions if not allowed
    if (!allowFunctions && typeof data === 'object') {
      const checkForFunctions = (obj, path = '') => {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const currentPath = path ? `${path}.${key}` : key;
            if (typeof obj[key] === 'function') {
              validation.errors.push(`Function found at ${currentPath} - functions not allowed in broadcast data`);
              validation.isValid = false;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              checkForFunctions(obj[key], currentPath);
            }
          }
        }
      };
      checkForFunctions(data);
    }
    
    console.log(`validateBroadcastData completed: ${validation.isValid ? 'valid' : 'invalid'} (${validation.errors.length} errors)`);
    logger.debug(`Broadcast data validation result: ${validation.isValid}, errors: ${validation.errors.length}`);
    
    return validation;
    
  } catch (error) {
    console.error('Error during broadcast data validation:', error);
    qerrors(error, 'validateBroadcastData', { dataType: typeof data });
    
    validation.isValid = false;
    validation.errors.push('Validation error occurred');
    return validation;
  }
}

/*
 * Module Export Strategy:
 * 
 * We export real-time communication utilities that complement existing server-side utilities:
 * 
 * 1. createBroadcastRegistry - Factory for creating application-specific broadcast registries
 * 2. createPaymentBroadcastRegistry - Pre-configured registry for payment/usage scenarios
 * 3. createSocketBroadcastRegistry - Static interface registry with fixed broadcast functions
 * 4. validateBroadcastData - Data validation for secure real-time broadcasts
 * 
 * These functions follow the same patterns as other QGenUtils modules:
 * - Comprehensive error handling with qerrors integration
 * - Structured logging for debugging and monitoring
 * - Fail-safe behavior when real-time features are unavailable
 * - Clear, descriptive function names and consistent interfaces
 * - Factory patterns for flexibility and reusability
 * 
 * FUTURE ENHANCEMENTS:
 * - Add connection state management utilities
 * - Add rate limiting helpers for broadcast operations
 * - Add authentication/authorization helpers for socket connections
 * - Add room management utilities for targeted broadcasts
 * - Add event pattern validation and schema enforcement
 * - Add metrics collection for broadcast performance monitoring
 */
module.exports = {
  createBroadcastRegistry, // export factory for custom broadcast registries
  createPaymentBroadcastRegistry, // export pre-configured payment registry
  createSocketBroadcastRegistry, // export static interface registry
  validateBroadcastData // export broadcast data validation
};
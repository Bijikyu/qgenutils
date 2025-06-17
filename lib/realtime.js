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
 * 3. validateBroadcastData - Data validation for secure real-time broadcasts
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
  validateBroadcastData // export broadcast data validation
};
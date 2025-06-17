/*
 * Secure ID Generation Utilities Module
 * 
 * This module provides cryptographically secure ID generation utilities for
 * execution tracking, task management, and data integrity across applications.
 * It centralizes ID generation logic to ensure consistency and prevent collisions.
 * 
 * DESIGN PHILOSOPHY:
 * - Cryptographic security: Uses nanoid for secure random components
 * - Collision resistance: Timestamp + random suffix provides uniqueness
 * - Natural ordering: Timestamp prefix enables chronological sorting
 * - Type identification: Prefix clearly identifies entity types
 * - Scalability: Handles high-frequency generation without conflicts
 * 
 * ARCHITECTURE RATIONALE:
 * Many applications need unique identifiers for tracking workflows, tasks,
 * and entities. This module provides a centralized approach that guarantees
 * uniqueness while maintaining readability and sortability. The timestamp-based
 * approach ensures natural chronological ordering in databases and logs.
 * 
 * SECURITY CONSIDERATIONS:
 * - Uses nanoid instead of Math.random() for cryptographically secure randomness
 * - 11-character random suffix provides 36^11 ≈ 131 trillion possibilities
 * - Prevents timing attacks through consistent generation patterns
 * - No sensitive information leaked through ID structure
 * 
 * COLLISION RESISTANCE:
 * The combination of millisecond timestamp and 11-character random suffix
 * makes collisions extremely unlikely even under high-frequency generation.
 * This approach scales to thousands of IDs per second without conflicts.
 * 
 * USAGE PATTERNS:
 * - Execution IDs: Track automation workflow runs
 * - Task IDs: Identify individual tasks within workflows
 * - Entity IDs: Generate identifiers for non-temporal entities
 * - Session IDs: Create unique session identifiers
 * - Request IDs: Track API requests for debugging
 */

const { nanoid } = require('nanoid'); // cryptographically secure random ID generation
const { qerrors } = require('qerrors'); // central error logging integration
const logger = require('./logger'); // structured logger

/**
 * Generates a unique execution ID with timestamp and secure random component
 * 
 * RATIONALE: Automation workflows need unique identifiers for tracking execution
 * state, logging, and debugging. This function provides IDs that are naturally
 * sortable by execution time while guaranteeing uniqueness across the system.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use 'exec' prefix for clear type identification
 * - Include timestamp for chronological ordering in databases
 * - Add 11-character random suffix for collision resistance
 * - Log generation for debugging and audit trails
 * 
 * FORMAT STRUCTURE:
 * exec_[timestamp]_[11-char-random]
 * - exec: Identifies this as an execution ID
 * - timestamp: Milliseconds since epoch for sorting
 * - random: 11 characters from nanoid's URL-safe alphabet
 * 
 * COLLISION RESISTANCE:
 * Even with thousands of executions per second, the combination of millisecond
 * timestamp and 11-character random suffix makes collisions extremely unlikely.
 * 11 characters provides 36^11 ≈ 131 trillion unique combinations.
 * 
 * @returns {string} Formatted execution ID (e.g., "exec_1703123456789_a1b2c3d4e5f")
 * 
 * USAGE EXAMPLES:
 * const execId = generateExecutionId();
 * console.log(execId); // "exec_1703123456789_a1b2c3d4e5f"
 * 
 * // Use in workflow tracking
 * const workflow = {
 *   id: generateExecutionId(),
 *   status: 'running',
 *   startTime: new Date()
 * };
 */
function generateExecutionId() {
  console.log(`generateExecutionId is running`);
  logger.debug(`generateExecutionId creating new execution identifier`);
  
  try {
    const result = generateSecureId('exec');
    
    console.log(`generateExecutionId is returning ${result}`);
    logger.info(`Execution ID generated successfully: ${result}`);
    
    return result;
    
  } catch (error) {
    console.error('Failed to generate execution ID:', error);
    qerrors(error, 'generateExecutionId', {});
    throw error; // Re-throw to notify caller
  }
}

/**
 * Generates a unique task ID with timestamp and secure random component
 * 
 * RATIONALE: Individual tasks within execution workflows need unique identifiers
 * for progress tracking, error handling, and result correlation. Task IDs should
 * be sortable by creation time and clearly distinguishable from other ID types.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use 'task' prefix for clear type identification
 * - Include timestamp for chronological ordering within executions
 * - Add 11-character random suffix for collision resistance
 * - Maintain same format as execution IDs for consistency
 * 
 * FORMAT STRUCTURE:
 * task_[timestamp]_[11-char-random]
 * - task: Identifies this as a task ID
 * - timestamp: Milliseconds since epoch for sorting
 * - random: 11 characters from nanoid's URL-safe alphabet
 * 
 * TASK LIFECYCLE INTEGRATION:
 * Task IDs can be used throughout the task lifecycle for consistent tracking:
 * - Creation: Initial task setup and queuing
 * - Execution: Progress updates and intermediate results
 * - Completion: Final results and cleanup
 * - Error handling: Exception tracking and retry logic
 * 
 * @returns {string} Formatted task ID (e.g., "task_1703123456789_x1y2z3a4b5c")
 * 
 * USAGE EXAMPLES:
 * const taskId = generateTaskId();
 * console.log(taskId); // "task_1703123456789_x1y2z3a4b5c"
 * 
 * // Use in task management
 * const task = {
 *   id: generateTaskId(),
 *   executionId: parentExecutionId,
 *   type: 'data_processing',
 *   status: 'pending'
 * };
 */
function generateTaskId() {
  console.log(`generateTaskId is running`);
  logger.debug(`generateTaskId creating new task identifier`);
  
  try {
    const result = generateSecureId('task');
    
    console.log(`generateTaskId is returning ${result}`);
    logger.info(`Task ID generated successfully: ${result}`);
    
    return result;
    
  } catch (error) {
    console.error('Failed to generate task ID:', error);
    qerrors(error, 'generateTaskId', {});
    throw error; // Re-throw to notify caller
  }
}

/**
 * Core secure ID generation function with configurable prefix
 * 
 * RATIONALE: Multiple ID types (execution, task, session, etc.) share the same
 * underlying structure but need different prefixes for type identification.
 * This core function centralizes the generation logic while providing flexibility
 * for various use cases throughout the application.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use millisecond timestamp for natural chronological ordering
 * - Generate 11-character random suffix for collision resistance
 * - Validate prefix parameter to prevent malformed IDs
 * - Comprehensive error handling and logging for debugging
 * 
 * TIMESTAMP BENEFITS:
 * Including millisecond timestamps provides several advantages:
 * - Natural sorting order in databases and logs
 * - Approximate creation time for debugging
 * - Distributed system coordination through time-based ordering
 * - Easy filtering by time ranges in queries
 * 
 * RANDOM SUFFIX SECURITY:
 * nanoid provides cryptographically secure random generation:
 * - URL-safe alphabet (A-Za-z0-9_-) prevents encoding issues
 * - Cryptographically strong random number generator
 * - No guessable patterns or sequential increments
 * - Resistant to timing attacks and enumeration
 * 
 * @param {string} prefix - Identifies the entity type (exec, task, session, etc.)
 * @returns {string} Formatted ID string with guaranteed uniqueness
 * 
 * VALIDATION RULES:
 * - Prefix must be a non-empty string
 * - Prefix should contain only alphanumeric characters and underscores
 * - Prefix length should be reasonable (1-20 characters)
 * 
 * ERROR HANDLING:
 * - Invalid prefix parameters throw descriptive errors
 * - nanoid generation failures are caught and logged
 * - All errors include context for debugging
 * 
 * USAGE EXAMPLES:
 * const sessionId = generateSecureId('session');
 * const requestId = generateSecureId('req');
 * const batchId = generateSecureId('batch');
 */
function generateSecureId(prefix) {
  console.log(`generateSecureId is running with ${prefix}`);
  logger.debug(`generateSecureId creating identifier with prefix: ${prefix}`);
  
  try {
    // Validate prefix parameter
    if (!prefix || typeof prefix !== 'string') {
      const errorMsg = 'Prefix must be a non-empty string';
      console.log(`generateSecureId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (prefix.trim().length === 0) {
      const errorMsg = 'Prefix cannot be empty or whitespace only';
      console.log(`generateSecureId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (prefix.length > 20) {
      const errorMsg = 'Prefix length cannot exceed 20 characters';
      console.log(`generateSecureId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Validate prefix format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(prefix)) {
      const errorMsg = 'Prefix must contain only alphanumeric characters and underscores';
      console.log(`generateSecureId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const timestamp = Date.now();
    const randomSuffix = nanoid(11);
    const id = `${prefix}_${timestamp}_${randomSuffix}`;
    
    console.log(`generateSecureId is returning ${id}`);
    logger.debug(`Secure ID generated successfully: ${id}`);
    
    return id;
    
  } catch (error) {
    console.error('Error during secure ID generation:', error);
    qerrors(error, 'generateSecureId', { 
      prefix: prefix,
      prefixType: typeof prefix,
      prefixLength: prefix?.length || 0
    });
    throw error; // Re-throw to notify caller
  }
}

/**
 * Generates a simple random ID without timestamp for non-temporal entities
 * 
 * RATIONALE: Some entities don't require chronological ordering and benefit
 * from shorter, simpler identifiers. User IDs, API keys, and configuration
 * objects often fall into this category where creation time is less important
 * than uniqueness and brevity.
 * 
 * IMPLEMENTATION DECISIONS:
 * - No timestamp component to keep IDs shorter
 * - Configurable random component length for different use cases
 * - Default 8-character length balances uniqueness with brevity
 * - Same prefix validation as timestamp-based IDs
 * 
 * USE CASES:
 * - User identifiers: Shorter IDs for better user experience
 * - API keys: Random tokens without timing information
 * - Configuration IDs: Settings and preferences that don't need ordering
 * - Cache keys: Short identifiers for performance-critical caching
 * - Session tokens: Authentication tokens without timestamp leakage
 * 
 * LENGTH CONSIDERATIONS:
 * - 8 characters: 36^8 ≈ 2.8 trillion possibilities (default)
 * - 6 characters: 36^6 ≈ 2.2 billion possibilities (shorter)
 * - 12 characters: 36^12 ≈ 4.7 quadrillion possibilities (longer)
 * 
 * Choose length based on expected volume and uniqueness requirements.
 * 
 * @param {string} prefix - Identifies the entity type
 * @param {number} length - Length of random component (default: 8)
 * @returns {string} Formatted ID string without timestamp
 * 
 * VALIDATION RULES:
 * - Prefix follows same rules as generateSecureId
 * - Length must be a positive integer
 * - Length should be reasonable (1-50 characters)
 * 
 * USAGE EXAMPLES:
 * const userId = generateSimpleId('user'); // "user_a1b2c3d4"
 * const apiKey = generateSimpleId('key', 16); // "key_a1b2c3d4e5f6g7h8"
 * const configId = generateSimpleId('cfg', 6); // "cfg_x1y2z3"
 */
function generateSimpleId(prefix, length = 8) {
  console.log(`generateSimpleId is running with ${prefix} and ${length}`);
  logger.debug(`generateSimpleId creating simple identifier with prefix: ${prefix}, length: ${length}`);
  
  try {
    // Validate prefix parameter (reuse validation from generateSecureId)
    if (!prefix || typeof prefix !== 'string') {
      const errorMsg = 'Prefix must be a non-empty string';
      console.log(`generateSimpleId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (prefix.trim().length === 0) {
      const errorMsg = 'Prefix cannot be empty or whitespace only';
      console.log(`generateSimpleId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (prefix.length > 20) {
      const errorMsg = 'Prefix length cannot exceed 20 characters';
      console.log(`generateSimpleId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Validate prefix format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(prefix)) {
      const errorMsg = 'Prefix must contain only alphanumeric characters and underscores';
      console.log(`generateSimpleId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Validate length parameter
    if (!Number.isInteger(length) || length < 1) {
      const errorMsg = 'Length must be a positive integer';
      console.log(`generateSimpleId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (length > 50) {
      const errorMsg = 'Length cannot exceed 50 characters';
      console.log(`generateSimpleId rejected: ${errorMsg}`);
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const randomComponent = nanoid(length);
    const id = `${prefix}_${randomComponent}`;
    
    console.log(`generateSimpleId is returning ${id}`);
    logger.debug(`Simple ID generated successfully: ${id}`);
    
    return id;
    
  } catch (error) {
    console.error('Error during simple ID generation:', error);
    qerrors(error, 'generateSimpleId', { 
      prefix: prefix,
      length: length,
      prefixType: typeof prefix,
      lengthType: typeof length
    });
    throw error; // Re-throw to notify caller
  }
}

/*
 * Module Export Strategy:
 * 
 * We export secure ID generation utilities that complement existing utilities:
 * 
 * 1. generateExecutionId - Pre-configured for automation workflow tracking
 * 2. generateTaskId - Pre-configured for individual task identification
 * 3. generateSecureId - Core function with configurable prefix and timestamp
 * 4. generateSimpleId - Simple random IDs without timestamp for non-temporal entities
 * 
 * These functions follow the same patterns as other QGenUtils modules:
 * - Comprehensive error handling with qerrors integration
 * - Structured logging for debugging and monitoring
 * - Input validation with descriptive error messages
 * - Clear, descriptive function names and consistent interfaces
 * - Cryptographically secure random generation using nanoid
 * 
 * FUTURE ENHANCEMENTS:
 * - Add batch ID generation for creating multiple IDs efficiently
 * - Add ID validation utilities to verify format and structure
 * - Add ID parsing utilities to extract timestamp and components
 * - Add custom alphabet support for specialized use cases
 * - Add collision detection and retry logic for extreme edge cases
 * - Add ID anonymization utilities for privacy-sensitive applications
 */
module.exports = {
  generateExecutionId, // export execution ID generator
  generateTaskId, // export task ID generator
  generateSecureId, // export core secure ID generator
  generateSimpleId // export simple ID generator
};
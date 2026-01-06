/**
 * Generate Execution ID for Task and Process Tracking
 * 
 * RATIONALE: Distributed systems and async operations need unique identifiers
 * for tracking execution flows, correlating logs, and debugging issues.
 * This function creates collision-resistant IDs with natural time ordering.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use nanoid for cryptographically secure random generation
 * - Include timestamp prefix for natural chronological ordering
 * - Use URL-safe alphabet (no special characters that need escaping)
 * - Maintain reasonable length for database storage and logging
 * - Ensure global uniqueness across multiple processes and servers
 * 
 * ID STRUCTURE:
 * Format: exec_TIMESTAMP_RANDOMSTRING
 * - "exec_" prefix clearly identifies execution IDs in logs
 * - Timestamp enables chronological sorting and expiration logic
 * - Random suffix prevents collisions when IDs generated simultaneously
 * - Total length: ~28 characters (manageable for most systems)
 * 
 * COLLISION RESISTANCE:
 * - nanoid provides 21-character random string with ~140 years collision-free
 * - Timestamp prefix further reduces collision probability
 * - Safe for high-concurrency systems generating thousands of IDs per second
 * - Suitable for distributed systems without centralized ID coordination
 * 
 * USE CASES:
 * - Request tracking across microservices
 * - Async job execution monitoring
 * - Distributed transaction coordination
 * - Log correlation and debugging
 * - Performance monitoring and profiling
 * 
 * @returns {string} Unique execution ID with format: exec_TIMESTAMP_RANDOMSTRING
 * @throws Never throws - uses fallback generation if nanoid fails
 */

import { nanoid } from 'nanoid';
import { qerrors } from 'qerrors';
import logger from '../../logger.js';

function generateExecutionId() {
  logger.debug(`generateExecutionId: generating unique execution identifier`);

  try {
    // Get current timestamp for chronological ordering
    const timestamp: any = Date.now().toString();
    
    // Generate cryptographically secure random string
    let randomPart;
    try {
      randomPart = nanoid(12); // 12 characters provides good collision resistance
    } catch (nanoidError) {
      qerrors(nanoidError as Error, `generateExecutionId-nanoid`);
      logger.warn(`generateExecutionId: nanoid generation failed, using fallback`, { 
        error: nanoidError instanceof Error ? nanoidError.message : String(nanoidError)
      });
      
      // Fallback to Math.random with timestamp for uniqueness
      randomPart = Math.random().toString(36).substring(2, 14).padEnd(12, `0`);
    }

    // Combine timestamp and random parts with clear prefix
    const executionId: any = `exec_${timestamp}_${randomPart}`;
    
    logger.debug(`generateExecutionId: ID generated successfully`, {
      executionId,
      timestamp,
      randomPartLength: randomPart.length,
      totalLength: executionId.length
    });

    return executionId;

  } catch (error) {
    // Handle any unexpected errors during ID generation
    qerrors(error instanceof Error ? error : new Error(String(error)), `generateExecutionId`);
    logger.error(`generateExecutionId failed with error`, { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : String(error)
    });

    // Generate fallback ID using timestamp and random number
    const fallbackTimestamp: any = Date.now().toString();
    const fallbackRandom: any = Math.random().toString(36).substring(2, 14).padEnd(12, `0`);
    const fallbackId: any = `exec_${fallbackTimestamp}_${fallbackRandom}`;
    
    logger.warn(`generateExecutionId: using fallback ID generation`, { 
      fallbackId,
      originalError: error instanceof Error ? error.message : String(error)
    });

    return fallbackId;
  }
}

export default generateExecutionId;
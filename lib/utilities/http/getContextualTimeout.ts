import { qerrors } from 'qerrors';

/**
 * Gets contextual timeout based on operation type.
 *
 * PURPOSE: Returns the appropriate timeout in milliseconds for a given
 * operation type. Falls back to default timeout for unknown operation types.
 *
 * @param {string} operation - Type of operation being performed
 * @returns {number} Appropriate timeout in milliseconds
 */
let contextualTimeouts: any;
try {
  contextualTimeouts = require('./contextualTimeouts');
} catch (moduleError) {
  // Module loading failed - provide default fallback
  contextualTimeouts = { default: 30000 };
  if (typeof qerrors !== 'undefined') {
    qerrors(new Error('Failed to load contextualTimeouts module'), 'getContextualTimeout', 'Module loading failed');
  }
}

function getContextualTimeout(operation: string): number {
  try {
    if (!operation || typeof operation !== 'string') {
      throw new Error('Operation must be a non-empty string');
    }
    
    return contextualTimeouts[operation] ?? contextualTimeouts.default;
  } catch (error) {
    const safeOperation = operation || 'undefined';
    qerrors(error instanceof Error ? error : new Error(String(error)), 'getContextualTimeout', `Contextual timeout retrieval failed for operation: ${safeOperation}`);
    return 30000; // Return safe default timeout
  }
}

export default getContextualTimeout;

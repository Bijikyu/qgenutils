/**
 * Standardize Authentication Operation Logging
 * 
 * RATIONALE: Consistent authentication logging is critical for security
 * auditing, debugging, and compliance. This centralized function ensures
 * all authentication operations follow the same logging format.
 * 
 * SECURITY CONSIDERATIONS:
 * - Never log sensitive data like passwords or tokens
 * - Include sufficient context for security investigations
 * - Use consistent format for automated log parsing
 * - Support security incident response workflows
 * 
 * @param {string} functionName - Name of the calling authentication function
 * @param {*} input - Input parameter being processed (sanitized)
 * @param {*} result - Result being returned
 * @throws Never throws - logging failures are non-critical
 */

// 🔗 Tests: logAuthOperation → authentication logging → audit trails
const logger = require('../../logger');

function logAuthOperation(functionName, input, result) {
  try {
    // Sanitize input for logging (remove sensitive data)
    const sanitizedInput = input && typeof input === `object` 
      ? { type: typeof input, hasUser: !!input.user }
      : input || `none`;

    logger.debug(`${functionName} is running with ${JSON.stringify(sanitizedInput)}`);
    logger.debug(`${functionName} is returning ${result}`);
    
  } catch (error) {
    // Don't let logging errors affect authentication flow
    logger.warn(`Authentication logging failed`, { 
      functionName, 
      error: error.message 
    });
  }
}

module.exports = logAuthOperation;
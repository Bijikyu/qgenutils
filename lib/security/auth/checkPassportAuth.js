/**
 * Check Passport Authentication Status
 * 
 * RATIONALE: Routes often gate protected resources behind authentication. Passport
 * adds an isAuthenticated() method, but requests may omit the middleware or use
 * alternate authentication flows. We defensively check and default to "deny" for
 * security.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use double negation (!!) to convert truthy/falsy to strict boolean
 * - Check for existence of isAuthenticated method before calling it
 * - Default to false (unauthenticated) for security when in doubt
 * - Log authentication attempts with user context for security auditing
 * 
 * SECURITY CONSIDERATIONS:
 * - Fail closed: When uncertain, assume user is NOT authenticated
 * - Avoid throwing exceptions that could reveal authentication internals
 * - Log all authentication checks for security monitoring
 * - Handle edge cases where Passport middleware is missing
 * 
 * TYPICAL USE CASES:
 * - Gate route handlers to prevent anonymous access
 * - Determine login state in view helpers for UI decisions
 * 
 * WHY DOUBLE NEGATION (!!):
 * req.isAuthenticated() might return truthy values that aren't strictly boolean.
 * !! converts any truthy value to true and any falsy value to false.
 * This ensures we always return a proper boolean type.
 * 
 * EDGE CASES HANDLED:
 * - req.isAuthenticated doesn't exist (Passport not configured)
 * - req.isAuthenticated throws an exception
 * - req object is malformed or null
 * - User object exists but authentication state is unclear
 * 
 * @param {object} req - Express request object (should have Passport methods attached)
 * @returns {boolean} True if user is authenticated, false otherwise (fail-closed security)
 * @throws Never throws - returns false on any error for security
 */

const { qerrors } = require(`qerrors`);
const logger = require(`../../logger`);

/**
 * Helper function to standardize authentication logging
 * Centralization ensures consistent audit trails and easier debugging
 *
 * @param {string} functionName - Name of the calling function
 * @param {*} input - Input parameter being processed
 * @param {*} result - Result being returned
 */
function logAuthOperation(functionName, input, result) {
  logger.debug(`${functionName} is running with ${input || 'none'}`);
  logger.debug(`${functionName} is returning ${result}`);
}

function checkPassportAuth(req) {
  try {
    const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated());
    
    logAuthOperation('checkPassportAuth', req?.user?.username || 'guest', isAuthenticated);
    return isAuthenticated;
  } catch (error) {
    qerrors(error, 'checkPassportAuth', req);
    
    return false; // fail closed on errors
  }
}

module.exports = checkPassportAuth;
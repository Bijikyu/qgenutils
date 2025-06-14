/*
 * Authentication Utility Module
 * 
 * This module provides authentication utilities for applications using Passport.js
 * authentication middleware. It focuses on checking authentication status and
 * detecting configured authentication strategies.
 * 
 * DESIGN PHILOSOPHY:
 * - Security by default: Functions return false when authentication is uncertain
 * - Graceful degradation: Handle missing Passport middleware without crashing
 * - Strategy detection: Allow conditional features based on available auth methods
 * - Error resilience: Authentication failures shouldn't break the entire request
 * 
 * PASSPORT.JS INTEGRATION:
 * Passport.js is a popular authentication middleware for Express.js that supports
 * multiple authentication strategies (local, OAuth, SAML, etc.). These utilities
 * work with Passport's standard API and patterns.
 */

const { qerrors } = require('qerrors'); // integrate central error tracking
const logger = require('./logger'); // structured logger

/**
 * Helper function to standardize authentication logging
 * Centralization ensures consistent audit trails and easier debugging
 *
 * @param {string} functionName - Name of the calling function
 * @param {*} input - Input parameter being processed
 * @param {*} result - Result being returned
 */
function logAuthOperation(functionName, input, result) {
  console.log(`${functionName} is running with ${input || 'none'}`); logger.debug(`${functionName} is running with ${input || 'none'}`); // log inputs for debugging context
  console.log(`${functionName} is returning ${result}`); logger.debug(`${functionName} is returning ${result}`); // log outputs to trace decision making
}

/**
 * Check Passport authentication status
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
 */
function checkPassportAuth(req) {
  try { // begin auth state evaluation
    const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated()); // call Passport isAuthenticated when available and coerce to boolean

    logAuthOperation('checkPassportAuth', req?.user?.username || 'guest', isAuthenticated); // record the check for auditing
    return isAuthenticated; // return computed auth state
  } catch (error) {
    qerrors(error, 'checkPassportAuth', req); // capture any unexpected issues

    return false; // fail closed on errors
  }
}

/**
 * Detect presence of GitHub OAuth strategy
 *
 * RATIONALE: Some interfaces display GitHub login options only when OAuth is
 * configured. Checking Passport's strategies lets the UI adapt to available
 * authentication methods without exposing configuration details.
 *
 * IMPLEMENTATION STRATEGY:
 * - Access Passport's internal strategy registry
 * - Check specifically for 'github' strategy by name
 * - Convert result to strict boolean for consistency
 * - Handle cases where Passport isn't available globally
 * 
 * WHY CHECK STRATEGIES:
 * Authentication strategies require configuration (client IDs, secrets, callback URLs).
 * Just because the code supports GitHub OAuth doesn't mean it's properly configured.
 * This function lets the UI adapt based on actual configuration.
 * 
 * PASSPORT INTERNALS:
 * Passport stores configured strategies in passport._strategies object.
 * Each strategy has a name (key) and configuration object (value).
 * This is an internal API but stable across Passport versions.
 * 
 * ERROR HANDLING:
 * - Return false if Passport isn't available (graceful degradation)
 * - Return false if strategies object doesn't exist
 * - Log errors for debugging configuration issues
 * - Fail closed so misconfiguration never exposes OAuth endpoints
 *
 * TYPICAL USE CASES:
 * - Show or hide GitHub login buttons in templates
 * - Determine if GitHub-based routes should be active
 *
 * ALTERNATIVE APPROACHES CONSIDERED:
 * - Environment variable checking - rejected because config might be dynamic
 * - Strategy instantiation testing - rejected for performance reasons
 * - Configuration file parsing - rejected for coupling reasons
 *
 * @returns {boolean} True if GitHub strategy is configured and available, false otherwise
 * SECURITY: Function fails closed, returning false when configuration is uncertain
 */
function hasGithubStrategy() {
  try { // attempt strategy detection
    const passportObj = global.passport; // get Passport instance from global scope
    if (!passportObj || !passportObj._strategies) { // confirm strategies registry exists
      logAuthOperation('hasGithubStrategy', 'none', false); // note absence of GitHub strategy prerequisites
      return false; // fail closed if prerequisites missing
    }

    const result = !!passportObj._strategies['github']; // boolean presence check for GitHub strategy

    logAuthOperation('hasGithubStrategy', 'none', result); // log detection result for debugging
    return result; // surface strategy availability to caller
  } catch (err) {
    qerrors(err, 'hasGithubStrategy'); // log unexpected errors
    console.log('hasGithubStrategy has run resulting in a final value of failure'); logger.debug('hasGithubStrategy has run resulting in a final value of failure'); // manual error indicator
    return false; // fail closed upon error
  }
}

/*
 * Module Export Strategy:
 * 
 * We export both authentication functions because they serve different but
 * related purposes:
 * 
 * 1. checkPassportAuth - Runtime authentication state checking
 * 2. hasGithubStrategy - Configuration/capability detection
 * 
 * Both are essential for building adaptive user interfaces that respond
 * appropriately to authentication state and available authentication methods.
 * 
 * FUTURE ENHANCEMENTS:
 * - Add functions to check other OAuth strategies (Google, Facebook, etc.)
 * - Add role-based authorization checking
 * - Add session expiration checking
 * - Add multi-factor authentication support
 */
module.exports = { // expose utilities for external use
  checkPassportAuth, // export runtime auth verifier
  hasGithubStrategy // export GitHub strategy detector
};
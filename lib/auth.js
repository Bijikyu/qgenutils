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

const { qerrors } = require('qerrors');

/**
 * Helper function to standardize authentication logging
 * This centralizes the logging pattern used by auth functions
 * 
 * @param {string} functionName - Name of the calling function
 * @param {*} input - Input parameter being processed
 * @param {*} result - Result being returned
 */
function logAuthOperation(functionName, input, result) {
  console.log(`${functionName} is running with ${input || 'none'}`); // record which user or context triggered the auth helper
  console.log(`${functionName} is returning ${result}`); // show the outcome of the helper for debugging
}

/**
 * Check Passport authentication status
 * 
 * RATIONALE: Many routes need to verify if a user is authenticated before allowing
 * access. Passport.js adds an isAuthenticated() method to request objects, but
 * we need to handle cases where Passport isn't configured or requests bypass it.
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
  try {
    // Check if Passport authentication method exists and user is authenticated
    // req.isAuthenticated is added by Passport.js middleware when properly configured
    const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated()); // convert to strict boolean for clarity
    logAuthOperation('checkPassportAuth', req?.user?.username || 'guest', isAuthenticated); // record outcome with user info
    return isAuthenticated; // inform caller of authenticated state
  } catch (error) {
    // Handle any errors in authentication checking gracefully
    // This prevents authentication errors from breaking the entire request flow
    // Common scenarios: Passport not configured, malformed request objects
    qerrors(error, 'checkPassportAuth', req); // Log error with full request context for debugging
    return false; // Default to unauthenticated state for security (fail-closed approach)
  }
}

/**
 * Detect presence of GitHub OAuth strategy
 * 
 * RATIONALE: Applications often need to conditionally show features based on
 * which authentication strategies are available. For example, only show "Login with GitHub"
 * button if GitHub OAuth is actually configured.
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
 * 
 * ALTERNATIVE APPROACHES CONSIDERED:
 * - Environment variable checking - rejected because config might be dynamic
 * - Strategy instantiation testing - rejected for performance reasons
 * - Configuration file parsing - rejected for coupling reasons
 * 
 * @returns {boolean} True if GitHub strategy is configured and available, false otherwise
 */
function hasGithubStrategy() {
  try {
    // Handle case where passport is not defined or available
    if (typeof passport === 'undefined') {
      logAuthOperation('hasGithubStrategy', 'none', false); // note absence of passport for debugging
      return false; // No passport means no GitHub strategy
    }

    // Check if the GitHub strategy is configured in Passport
    // Strategy names are typically stored in passport._strategies
    const hasStrategy = passport && passport._strategies && passport._strategies['github']; // read internal registry safely
    const result = !!hasStrategy; // Convert to boolean (true if strategy exists)
    
    logAuthOperation('hasGithubStrategy', 'none', result); // log final determination for monitoring
    return result; // return true only when strategy object exists
  } catch (err) {
    // Handle errors in strategy detection (passport not configured, etc.)
    qerrors(err, 'hasGithubStrategy'); // log failure context for debugging
    console.log('hasGithubStrategy has run resulting in a final value of failure'); // Log error condition
    return false; // Assume no GitHub strategy on error (fail-closed)
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
module.exports = {
  checkPassportAuth,
  hasGithubStrategy
};
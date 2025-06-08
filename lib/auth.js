
/**
 * Authentication Module
 * 
 * This module provides utilities for checking authentication status and OAuth strategy
 * configuration. It's designed to work with Passport.js middleware while providing
 * fail-safe authentication checking.
 * 
 * Security philosophy:
 * - Fail-closed: Any errors default to "not authenticated" for security
 * - Graceful degradation: Auth failures don't break the entire application
 * - Clear logging: All auth checks are logged for security monitoring
 * - Boolean consistency: Always returns boolean values for predictable logic
 */

const { qerrors } = require('qerrors');

/**
 * Check Passport authentication status
 * 
 * This function safely checks if a user is authenticated using Passport.js middleware.
 * It's designed to handle edge cases where Passport isn't properly initialized or
 * where the request object doesn't have the expected authentication methods.
 * 
 * Rationale for implementation approach:
 * 1. Uses double negation (!!) to ensure strict boolean return value
 * 2. Checks for existence of isAuthenticated method before calling it
 * 3. Defaults to false (unauthenticated) on any error for security
 * 4. Logs user context for security monitoring and debugging
 * 5. Handles requests that don't have Passport middleware attached
 * 
 * Security considerations:
 * - Always returns boolean (never undefined/null) for predictable security logic
 * - Fails closed - any error results in "not authenticated" status
 * - Logs authentication attempts for security monitoring
 * - Doesn't throw errors that could break request processing
 * 
 * Passport.js integration:
 * - req.isAuthenticated() is added by Passport middleware
 * - req.user contains user data if authenticated
 * - Method safely handles cases where Passport isn't configured
 * 
 * Edge cases handled:
 * - Request without Passport middleware (returns false)
 * - Malformed request objects (returns false)
 * - Passport configuration errors (returns false)
 * - User object exists but not authenticated (relies on isAuthenticated())
 * 
 * @param {object} req - Express request object (potentially with Passport middleware)
 * @returns {boolean} True if user is authenticated, false otherwise
 */
function checkPassportAuth(req) {
  // Log authentication check with user context for security monitoring
  // Use optional chaining and fallback to 'guest' to handle missing user data
  console.log(`checkPassportAuth is running with ${req.user ? req.user.username : 'guest'}`);
  try {
    // Check if Passport authentication method exists before calling it
    // req.isAuthenticated is added by Passport.js middleware and may not exist
    // Use double negation (!!) to convert any truthy/falsy result to strict boolean
    const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated());
    console.log(`checkPassportAuth is returning ${isAuthenticated}`); // Log result for debugging
    return isAuthenticated;
  } catch (error) {
    // Handle any errors in authentication checking gracefully
    // This prevents authentication errors from breaking the entire request
    qerrors(error, 'checkPassportAuth', req); // Log error with full request context for debugging
    return false; // Default to unauthenticated state for security (fail-closed approach)
  }
}

/**
 * Detect presence of GitHub OAuth strategy
 * 
 * This function checks if GitHub OAuth strategy is configured in Passport.js.
 * It's used to conditionally show GitHub login options or determine available
 * authentication methods.
 * 
 * Rationale for strategy detection:
 * 1. Allows conditional UI rendering based on available auth methods
 * 2. Prevents runtime errors when GitHub strategy isn't configured
 * 3. Enables graceful degradation when OAuth services are unavailable
 * 4. Provides debugging information for authentication setup issues
 * 
 * Implementation approach:
 * - Directly checks Passport's internal _strategies object
 * - Uses Boolean() for explicit boolean conversion
 * - Handles cases where passport object doesn't exist
 * - Logs strategy detection attempts for debugging
 * 
 * Why check internal _strategies:
 * - Passport doesn't provide a public API for strategy detection
 * - _strategies object contains all registered authentication strategies
 * - GitHub strategy is registered with key 'github'
 * - This is the most reliable way to detect strategy availability
 * 
 * Edge cases handled:
 * - Passport not initialized (returns false)
 * - No strategies configured (returns false)
 * - GitHub strategy not configured (returns false)
 * - Malformed passport object (returns false)
 * 
 * @returns {boolean} True if GitHub strategy is configured, false otherwise
 */
function hasGithubStrategy() {
  console.log(`hasGithubStrategy is running with none`); // Log strategy check attempt
  try {
    // Check Passport's internal strategies object for GitHub configuration
    // Use Boolean() for explicit conversion to boolean type
    // passport._strategies.github will be truthy if GitHub strategy is registered
    const configured = Boolean(passport._strategies && passport._strategies.github);
    console.log(`hasGithubStrategy is returning ${configured}`); // Log boolean result for debugging
    return configured; // Return strategy availability status
  } catch (error) {
    // Handle errors when passport object doesn't exist or is malformed
    qerrors(error, 'hasGithubStrategy'); // Log error for debugging configuration issues
    return false; // Default to strategy not available on any error
  }
}

module.exports = {
  checkPassportAuth,
  hasGithubStrategy
};

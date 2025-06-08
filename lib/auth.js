
const { qerrors } = require('qerrors');

/**
 * Check Passport authentication status
 * @param {object} req - Express request object
 * @returns {boolean} True if user is authenticated, false otherwise
 */
function checkPassportAuth(req) {
  console.log(`checkPassportAuth is running with ${req.user ? req.user.username : 'guest'}`); // Log authentication check with user context
  try {
    // Check if Passport authentication method exists and user is authenticated
    // req.isAuthenticated is added by Passport.js middleware
    const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated()); // convert to strict boolean using !! (description of change & current functionality)
    console.log(`checkPassportAuth is returning ${isAuthenticated}`); // Log authentication result for debugging
    return isAuthenticated;
  } catch (error) {
    // Handle any errors in authentication checking gracefully
    // This prevents authentication errors from breaking the entire request
    qerrors(error, 'checkPassportAuth', req); // Log error with request context
    return false; // Default to unauthenticated state for security (fail-closed)
  }
}

/**
 * Detect presence of GitHub OAuth strategy
 * @returns {boolean} True if GitHub strategy is configured, false otherwise
 */
function hasGithubStrategy() {
  console.log(`hasGithubStrategy is running with none`); // start log for strategy check
  try {
    const configured = Boolean(passport._strategies && passport._strategies.github); // convert to strict boolean (description of change & current functionality)
    console.log(`hasGithubStrategy is returning ${configured}`); // log boolean result
    return configured; // return evaluation
  } catch (error) {
    qerrors(error, 'hasGithubStrategy'); // log unexpected error context
    return false; // default absence on error
  }
}

module.exports = {
  checkPassportAuth,
  hasGithubStrategy
};

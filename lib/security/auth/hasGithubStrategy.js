/**
 * Detect Presence of GitHub OAuth Strategy
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
 * @throws Never throws - returns false on any error for security (fail-closed)
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

/**
 * Helper function to standardize authentication logging
 * Centralization ensures consistent audit trails and easier debugging
 *
 * @param {string} functionName - Name of the calling function
 * @param {*} input - Input parameter being processed
 * @param {*} result - Result being returned
 */
function logAuthOperation(functionName, input, result) {
  console.log(`${functionName} is running with ${input || 'none'}`); 
  logger.debug(`${functionName} is running with ${input || 'none'}`);
  console.log(`${functionName} is returning ${result}`); 
  logger.debug(`${functionName} is returning ${result}`);
}

function hasGithubStrategy() {
  try {
    const passportObj = global.passport;
    if (!passportObj || !passportObj._strategies) {
      logAuthOperation('hasGithubStrategy', 'none', false);
      return false;
    }

    const result = !!passportObj._strategies['github'];

    logAuthOperation('hasGithubStrategy', 'none', result);
    return result;
  } catch (err) {
    qerrors(err, 'hasGithubStrategy');
    console.log('hasGithubStrategy has run resulting in a final value of failure'); 
    logger.debug('hasGithubStrategy has run resulting in a final value of failure');
    return false;
  }
}

module.exports = hasGithubStrategy;
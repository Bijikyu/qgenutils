/**
 * Check if Environment Variable Exists and Has Non-Empty Value
 * 
 * RATIONALE: Applications often need to conditionally enable features based on
 * environment variable presence. This utility provides a reliable way to test
 * variable existence without throwing errors, enabling graceful feature detection.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Return boolean for simple conditional logic in calling code
 * - Check both existence and non-empty value (empty strings are considered "missing")
 * - Handle invalid variable names gracefully without throwing
 * - Log checks for debugging configuration issues
 * - Provide consistent behavior across different input types
 * 
 * USAGE PATTERNS:
 * - Feature flags: if (hasEnvVar('ENABLE_FEATURE_X')) { ... }
 * - Optional configuration: hasEnvVar('OPTIONAL_CONFIG') ? useConfig() : useDefaults()
 * - Development vs production: hasEnvVar('NODE_ENV') && process.env.NODE_ENV === 'production'
 * 
 * VALIDATION RULES:
 * - Variable must exist in process.env
 * - Variable must not be undefined
 * - Variable must not be empty string
 * - Variable name must be a non-empty string
 * - Whitespace-only values are considered empty
 * 
 * @param {string} varName - Name of environment variable to check
 * @returns {boolean} True if variable exists and has non-empty value, false otherwise
 * @throws Never throws - returns false for any error condition
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');

function hasEnvVar(varName) {
  console.log(`hasEnvVar checking: ${varName}`);
  logger.debug('hasEnvVar checking environment variable', { varName });

  try {
    // Validate variable name input
    if (typeof varName !== 'string') {
      console.log(`hasEnvVar: invalid variable name type (${typeof varName}), returning false`);
      logger.warn('hasEnvVar: non-string variable name provided', { 
        varName, 
        type: typeof varName 
      });
      return false;
    }

    // Handle empty or whitespace-only variable names
    const trimmedName = varName.trim();
    if (trimmedName === '') {
      console.log('hasEnvVar: empty variable name provided, returning false');
      logger.warn('hasEnvVar: empty variable name after trimming');
      return false;
    }

    // Check if variable exists and has non-empty value
    const value = process.env[trimmedName];
    
    if (value === undefined) {
      console.log(`hasEnvVar: ${trimmedName} is undefined, returning false`);
      logger.debug('hasEnvVar: variable not found in environment', { varName: trimmedName });
      return false;
    }

    if (value === '' || (typeof value === 'string' && value.trim() === '')) {
      console.log(`hasEnvVar: ${trimmedName} is empty or whitespace, returning false`);
      logger.debug('hasEnvVar: variable found but empty/whitespace', { 
        varName: trimmedName,
        valueLength: value.length
      });
      return false;
    }

    // Variable exists and has a meaningful value
    console.log(`hasEnvVar: ${trimmedName} exists with value, returning true`);
    logger.debug('hasEnvVar: variable found with valid value', { 
      varName: trimmedName,
      hasValue: true,
      valueLength: value.length
    });
    return true;

  } catch (error) {
    // Handle any unexpected errors during environment variable access
    console.error('hasEnvVar encountered unexpected error:', error.message);
    qerrors(error, 'hasEnvVar', { 
      varName,
      errorMessage: error.message
    });
    logger.error('hasEnvVar failed with error', { 
      error: error.message,
      varName,
      stack: error.stack
    });

    // Return false for any error condition (fail-safe approach)
    return false;
  }
}

module.exports = hasEnvVar;
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
const logger = require('../../logger');
const isValidString = require('../../validation/isValidString');

function hasEnvVar(varName) {
  logger.debug('hasEnvVar checking environment variable', { varName });

  try {
    // Validate variable name input using our validation utility
    if (!isValidString(varName)) {
      logger.warn('hasEnvVar: invalid variable name provided', { 
        varName, 
        type: typeof varName 
      });
      return false;
    }

    const trimmedName = varName.trim();

    // Check if variable exists and has non-empty value
    const value = process.env[trimmedName];
    
    if (value === undefined) {
      logger.debug('hasEnvVar: variable not found in environment', { varName: trimmedName });
      return false;
    }

    if (value === '' || (typeof value === 'string' && value.trim() === '')) {
      logger.debug('hasEnvVar: variable found but empty/whitespace', { 
        varName: trimmedName,
        valueLength: value.length
      });
      return false;
    }

    // Variable exists and has a meaningful value
    logger.debug('hasEnvVar: variable found with valid value', { 
      varName: trimmedName,
      hasValue: true,
      valueLength: value.length
    });
    return true;

  } catch (error) {
    // Handle any unexpected errors during environment variable access
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
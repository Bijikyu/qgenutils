/**
 * Check if Environment Variable Exists and Has Non-Empty Value
 * 
 * RATIONALE: Applications often need to conditionally enable features based on
 * environment variable presence. This utility provides a reliable way to test
 * variable existence without throwing errors, enabling graceful feature detection.
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
    // Direct process.env access needed for dynamic variable lookup
    const value = process.env[trimmedName];
    
    if (value === undefined) {
      logger.debug('hasEnvVar: variable does not exist', { varName: trimmedName });
      return false;
    }

    if (value === null) {
      logger.debug('hasEnvVar: variable is null', { varName: trimmedName });
      return false;
    }

    if (typeof value !== 'string') {
      logger.debug('hasEnvVar: variable is not a string', { 
        varName: trimmedName,
        type: typeof value 
      });
      return false;
    }

    if (value.trim() === '') {
      logger.debug('hasEnvVar: variable is empty string', { varName: trimmedName });
      return false;
    }

    logger.debug('hasEnvVar: variable exists and has value', { 
      varName: trimmedName,
      hasValue: true 
    });
    
    return true;

  } catch (error) {
    // Log error and return false for safety
    qerrors(error, 'hasEnvVar-error', { varName });
    logger.error('hasEnvVar: unexpected error occurred', { 
      varName,
      error: error.message 
    });
    
    return false;
  }
}

module.exports = hasEnvVar;
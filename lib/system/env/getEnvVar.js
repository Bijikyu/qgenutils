/**
 * Retrieve Environment Variable with Type Conversion and Validation
 *
 * PURPOSE: Many applications require environment variables for configuration,
 * but process.env only provides string values. This utility adds type
 * conversion, validation, and sensible defaults to simplify configuration
 * management across different deployment environments.
 *
 * @param {string} varName - Name of environment variable to retrieve
 * @param {any} defaultValue - Value returned if variable missing or invalid
 * @param {string} type - Expected type for conversion ('string', 'number', 'boolean')
 * @returns {any} Environment variable value (converted to specified type) or default value
 * @throws Never throws - returns default value on any error
 */

// Defensive require for qerrors to prevent test environment failures
let qerrors;
try {
  const qerrorsModule = require('qerrors');
  qerrors = qerrorsModule && qerrorsModule.qerrors ? qerrorsModule.qerrors : (qerrorsModule && qerrorsModule.default) ? qerrorsModule.default : qerrorsModule;
} catch (err) {
  // Provide a no-op fallback so tests won't fail if qerrors is absent
  qerrors = function () { /* no-op error reporter for test envs */ };
}

const logger = require('../../logger');
const isValidString = require('../../validation/isValidString');

// Import constants from centralized localVars
const localVars = require('../../../config/localVars');

function getEnvVar(varName, defaultValue = undefined, type = 'string') {
  logger.debug('getEnvVar retrieving environment variable', { 
    varName, 
    type, 
    hasDefault: defaultValue !== undefined
  });

  try {
    // Validate variable name using our validation utility
    if (!isValidString(varName)) {
      logger.warn('getEnvVar: invalid variable name provided', { 
        varName, 
        type: typeof varName 
      });
      return defaultValue;
    }

    // Validate type parameter
    const validTypes = ['string', 'number', 'boolean'];
    if (!validTypes.includes(type)) {
      logger.warn('getEnvVar: invalid type specified, using string', { 
        varName, 
        requestedType: type,
        validTypes 
      });
      type = 'string';
    }

    const trimmedName = varName.trim();
    
    // Get raw value from environment
    // Direct process.env access needed for dynamic variable retrieval
    const rawValue = process.env[trimmedName];
    
    // Handle missing or undefined values
    if (rawValue === undefined || rawValue === null) {
      logger.debug('getEnvVar: variable not found, using default', { 
        varName: trimmedName,
        defaultValue 
      });
      return defaultValue;
    }

    // Handle empty string values
    const trimmedValue = rawValue.trim();
    if (trimmedValue === '') {
      logger.debug('getEnvVar: empty variable value, using default', { 
        varName: trimmedName,
        defaultValue 
      });
      return defaultValue;
    }

    // Perform type conversion
    let convertedValue;
    
    switch (type) {
      case 'string':
        convertedValue = trimmedValue;
        break;
        
      case 'number':
        convertedValue = parseFloat(trimmedValue);
        if (isNaN(convertedValue)) {
          logger.warn('getEnvVar: failed to convert to number, using default', { 
            varName: trimmedName,
            originalValue: trimmedValue,
            defaultValue 
          });
          return defaultValue;
        }
        break;
        
      case 'boolean':
        // Handle common boolean representations
        const lowerValue = trimmedValue.toLowerCase();
        if (['true', '1', 'yes', 'on', 'enabled'].includes(lowerValue)) {
          convertedValue = true;
        } else if (['false', '0', 'no', 'off', 'disabled'].includes(lowerValue)) {
          convertedValue = false;
        } else {
          logger.warn('getEnvVar: failed to convert to boolean, using default', { 
            varName: trimmedName,
            originalValue: trimmedValue,
            defaultValue 
          });
          return defaultValue;
        }
        break;
        
      default:
        convertedValue = trimmedValue;
    }

    logger.debug('getEnvVar: successfully converted environment variable', { 
      varName: trimmedName,
      type,
      value: type === 'string' ? convertedValue : 'converted'
    });

    return convertedValue;

  } catch (error) {
    // Log error and return default value
    qerrors(error, 'getEnvVar-error', { varName, type });
    logger.error('getEnvVar: unexpected error occurred', { 
      varName,
      type,
      error: error.message,
      defaultValue 
    });
    
    return defaultValue;
  }
}

module.exports = getEnvVar;
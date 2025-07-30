/**
 * Get Environment Variable with Default Value and Type Conversion
 * 
 * RATIONALE: Environment variables are always strings, but applications often need
 * typed values (numbers, booleans) or default values when variables are missing.
 * This utility provides safe access with type conversion and fallback handling.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Return actual environment variable value when present
 * - Use provided default value when variable is missing or empty
 * - Support common type conversions (string, number, boolean)
 * - Handle edge cases like whitespace-only values
 * - Log variable access for debugging configuration issues
 * 
 * TYPE CONVERSION RULES:
 * - String: Return as-is (default behavior)
 * - Number: Convert using parseFloat(), return default if NaN
 * - Boolean: "true"/"1"/"yes" → true, "false"/"0"/"no" → false, others use default
 * - Invalid type specification defaults to string conversion
 * 
 * DEFAULT VALUE HANDLING:
 * - Used when variable is undefined
 * - Used when variable is empty string
 * - Used when type conversion fails
 * - Default can be any type (string, number, boolean, object, etc.)
 * 
 * @param {string} varName - Name of environment variable to retrieve
 * @param {any} defaultValue - Value to return if variable is missing/empty (default: undefined)
 * @param {string} type - Type conversion: 'string', 'number', 'boolean' (default: 'string')
 * @returns {any} Environment variable value (converted to specified type) or default value
 * @throws Never throws - returns default value on any error
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');
const { ENV_VALID_TYPES, ENV_TRUTHY_VALUES, ENV_FALSY_VALUES } = require('loqatevars/config/localVars');

function getEnvVar(varName, defaultValue = undefined, type = 'string') {
  console.log(`getEnvVar retrieving: ${varName} (type: ${type})`);
  logger.debug('getEnvVar retrieving environment variable', { 
    varName, 
    type, 
    hasDefault: defaultValue !== undefined 
  });

  try {
    // Validate variable name input
    if (typeof varName !== 'string' || varName.trim() === '') {
      console.log('getEnvVar: invalid variable name, returning default value');
      logger.warn('getEnvVar: invalid variable name provided', { 
        varName, 
        type: typeof varName 
      });
      return defaultValue;
    }

    // Validate type parameter
    const validTypes = ENV_VALID_TYPES || ['string', 'number', 'boolean'];
    if (!validTypes.includes(type)) {
      console.log(`getEnvVar: invalid type "${type}", defaulting to string`);
      logger.warn('getEnvVar: invalid type specified, using string', { 
        specifiedType: type,
        validTypes
      });
      type = 'string';
    }

    const trimmedName = varName.trim();
    const rawValue = process.env[trimmedName];

    // Handle missing or empty environment variable
    if (rawValue === undefined || rawValue === '' || 
        (typeof rawValue === 'string' && rawValue.trim() === '')) {
      console.log(`getEnvVar: ${trimmedName} is missing/empty, returning default`);
      logger.debug('getEnvVar: variable missing or empty, using default', { 
        varName: trimmedName,
        defaultValue,
        type
      });
      return defaultValue;
    }

    // Perform type conversion
    let convertedValue;

    switch (type) {
      case 'number':
        convertedValue = parseFloat(rawValue);
        if (isNaN(convertedValue)) {
          console.log(`getEnvVar: ${trimmedName} cannot be converted to number, using default`);
          logger.warn('getEnvVar: number conversion failed, using default', { 
            varName: trimmedName,
            rawValue,
            defaultValue
          });
          return defaultValue;
        }
        break;

      case 'boolean':
        const lowerValue = rawValue.toLowerCase().trim();
        const truthyValues = ENV_TRUTHY_VALUES || ['true', '1', 'yes', 'on', 'enabled'];
        const falsyValues = ENV_FALSY_VALUES || ['false', '0', 'no', 'off', 'disabled'];
        
        if (truthyValues.includes(lowerValue)) {
          convertedValue = true;
        } else if (falsyValues.includes(lowerValue)) {
          convertedValue = false;
        } else {
          console.log(`getEnvVar: ${trimmedName} cannot be converted to boolean, using default`);
          logger.warn('getEnvVar: boolean conversion failed, using default', { 
            varName: trimmedName,
            rawValue,
            defaultValue
          });
          return defaultValue;
        }
        break;

      case 'string':
      default:
        convertedValue = rawValue;
        break;
    }

    console.log(`getEnvVar: ${trimmedName} retrieved successfully (${type})`);
    logger.debug('getEnvVar: variable retrieved and converted', { 
      varName: trimmedName,
      type,
      valueLength: typeof convertedValue === 'string' ? convertedValue.length : 'n/a'
    });

    return convertedValue;

  } catch (error) {
    // Handle any unexpected errors during variable access or conversion
    console.error('getEnvVar encountered unexpected error:', error.message);
    qerrors(error, 'getEnvVar', { 
      varName,
      type,
      errorMessage: error.message
    });
    logger.error('getEnvVar failed with error', { 
      error: error.message,
      varName,
      type,
      stack: error.stack
    });

    // Return default value for any error condition
    return defaultValue;
  }
}

module.exports = getEnvVar;
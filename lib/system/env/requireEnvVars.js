/**
 * Environment Variable Validation Utility
 * 
 * Validates the presence and non-empty state of required environment variables.
 * Throws an error if any variables are missing or empty, preventing silent failures.
 * 
 * Security Considerations:
 * - Fail-fast validation prevents runtime errors from missing configuration
 * - Does not log actual environment variable values for security
 * - Provides clear error messages for debugging while maintaining security
 * 
 * @module requireEnvVars
 * @author QGen Development Team
 * @since 1.0.0
 * 
 * @example
 * // Single variable
 * requireEnvVars('DATABASE_URL');
 * 
 * @example
 * // Multiple variables
 * requireEnvVars(['API_KEY', 'SECRET_TOKEN', 'DATABASE_URL']);
 * 
 * @param {string|string[]} varNames - Variable name(s) to validate
 * @throws {Error} When variables are missing, empty, or invalid
 * @returns {void} Nothing on success, throws on failure
 */

// 🔗 Tests: requireEnvVars → environment variable validation → error handling
const { qerrors } = require('qerrors');
const logger = require('../../logger');

function requireEnvVars(varNames) {
  logger.debug('requireEnvVars validating environment variables', { 
    varNames,
    inputType: Array.isArray(varNames) ? 'array' : typeof varNames
  });

  try {
    // Normalize input to array for consistent processing
    const variablesToCheck = Array.isArray(varNames) ? varNames : [varNames];
    
    // Validate input parameters
    if (variablesToCheck.length === 0) {
      logger.debug('requireEnvVars: empty variable list provided');
      return; // No variables to check
    }

    // Check for non-string variable names
    const invalidNames = variablesToCheck.filter(name => typeof name !== 'string');
    if (invalidNames.length > 0) {
      const error = new Error(`Invalid variable names provided: ${invalidNames.join(', ')}`);
      qerrors(error, 'requireEnvVars-invalid-names', { invalidNames });
      logger.error('requireEnvVars: invalid variable names', { invalidNames });
      throw error;
    }

    // Check each variable for presence and non-empty values
    const missingVars = [];
    const emptyVars = [];
    
    for (const varName of variablesToCheck) {
      const trimmedName = varName.trim();
      // Direct process.env access needed for dynamic variable validation
      const value = process.env[trimmedName];
      
      if (value === undefined) {
        missingVars.push(trimmedName);
      } else if (value === '') {
        emptyVars.push(trimmedName);
      }
    }

    // Combine missing and empty variables for error reporting
    const problematicVars = [...missingVars, ...emptyVars];
    
    if (problematicVars.length > 0) {
      const errorMessage = `Missing or empty environment variables: ${problematicVars.join(', ')}`;
      
      const error = new Error(errorMessage);
      qerrors(error, 'requireEnvVars-missing', { 
        missingVars, 
        emptyVars, 
        allProblematic: problematicVars 
      });
      logger.error('requireEnvVars: missing environment variables', { 
        missing: missingVars,
        empty: emptyVars,
        total: problematicVars.length
      });
      
      throw error;
    }

    // All variables are present and non-empty
    logger.debug('requireEnvVars: all environment variables validated successfully', {
      variableCount: variablesToCheck.length,
      variables: variablesToCheck
    });

  } catch (error) {
    // Re-throw validation errors as-is, catch unexpected errors
    if (error.message.includes('Missing or empty environment variables') ||
        error.message.includes('Invalid variable names provided')) {
      throw error; // Expected validation errors
    }
    
    // Log and re-throw unexpected errors
    const wrappedError = new Error(`requireEnvVars validation failed: ${error.message}`);
    qerrors(wrappedError, 'requireEnvVars-unexpected', { originalError: error.message });
    logger.error('requireEnvVars: unexpected validation error', { 
      error: error.message,
      stack: error.stack 
    });
    throw wrappedError;
  }
}

module.exports = requireEnvVars;
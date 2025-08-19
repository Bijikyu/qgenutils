/**
 * Require Environment Variables to be Present and Non-Empty
 *
 * PURPOSE: Applications often need critical configuration from environment
 * variables at startup. This function validates their presence and throws
 * descriptive errors for missing or empty values, enabling fail-fast behavior
 * during application initialization.
 *
 * VALIDATION LOGIC:
 * - Accepts single variable name or array of names
 * - Checks each variable exists in process.env
 * - Validates each variable has non-empty string value
 * - Throws comprehensive error listing all problems found
 *
 * ERROR HANDLING:
 * - Distinguishes between missing variables (undefined) and empty ones ('')
 * - Provides detailed error context for debugging configuration issues
 * - Uses qerrors for consistent error logging and monitoring integration
 *
 * USE CASES:
 * - Application startup validation
 * - Configuration verification in deployment scripts
 * - Ensuring required secrets are available before processing
 *
 * @param {string|string[]} varNames - Variable name(s) to check
 * @throws {Error} If any variables are missing or empty
 * @returns {void} Nothing on success, throws on failure
 */

// 🔗 Tests: requireEnvVars → environment variable validation → error handling
const { qerrors } = require(`qerrors`);
const logger = require(`../../logger`);

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
      throw error;
    }

    // Handle unexpected errors during environment variable validation
    qerrors(error, 'requireEnvVars-unexpected', { 
      varNames,
      errorMessage: error.message,
      stack: error.stack
    });

    logger.error('requireEnvVars failed with unexpected error', { 
      error: error.message,
      varNames,
      stack: error.stack
    });

    // Re-throw with additional context for debugging
    throw new Error(`Environment variable validation failed: ${error.message}`);
  }
}

module.exports = requireEnvVars;
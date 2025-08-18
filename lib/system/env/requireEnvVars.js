/**
 * Require Environment Variables with Validation and Early Failure Detection
 * 
 * RATIONALE: Applications should fail fast during startup if critical environment
 * variables are missing. This prevents runtime failures and makes configuration
 * issues immediately visible during deployment or development setup.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Check all required variables at once for comprehensive validation
 * - Provide detailed error messages listing all missing variables
 * - Throw errors immediately to prevent application startup with incomplete config
 * - Log missing variables for debugging configuration issues
 * - Support both single variable and array validation patterns
 * 
 * FAIL-FAST PHILOSOPHY:
 * Better to fail during startup with clear error messages than to encounter
 * undefined behavior or cryptic errors during runtime when variables are accessed.
 * This approach leads to more reliable deployments and easier debugging.
 * 
 * ERROR REPORTING:
 * - Lists all missing variables in a single error message
 * - Provides actionable feedback for fixing configuration
 * - Logs diagnostic information for troubleshooting
 * - Uses consistent error format across different call patterns
 * 
 * @param {string|string[]} varNames - Single variable name or array of required variable names
 * @returns {void} Function throws on missing variables, returns nothing on success
 * @throws {Error} When any required environment variables are missing
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

function requireEnvVars(varNames) {
  console.log(`requireEnvVars checking variables: ${Array.isArray(varNames) ? varNames.join(', ') : varNames}`);
  logger.debug('requireEnvVars validating environment variables', { 
    variables: Array.isArray(varNames) ? varNames : [varNames]
  });

  try {
    // Normalize input to array for consistent processing
    const variablesToCheck = Array.isArray(varNames) ? varNames : [varNames];
    
    // Validate input parameters
    if (variablesToCheck.length === 0) {
      console.log('requireEnvVars: no variables specified, validation skipped');
      logger.debug('requireEnvVars: empty variable list provided');
      return; // No variables to check
    }

    // Check for non-string variable names
    const invalidNames = variablesToCheck.filter(name => typeof name !== 'string' || name.trim() === '');
    if (invalidNames.length > 0) {
      const error = new Error(`Invalid variable names provided: ${invalidNames.join(', ')}`);
      console.error('requireEnvVars validation failed:', error.message);
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
      console.error('requireEnvVars validation failed:', errorMessage);
      
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
    console.log(`requireEnvVars validation passed for ${variablesToCheck.length} variables`);
    logger.debug('requireEnvVars: all environment variables validated successfully', {
      variableCount: variablesToCheck.length,
      variables: variablesToCheck
    });

  } catch (error) {
    // Re-throw known validation errors
    if (error.message.includes('Missing or empty environment variables') || 
        error.message.includes('Invalid variable names')) {
      throw error;
    }

    // Handle unexpected errors during validation
    console.error('requireEnvVars encountered unexpected error:', error.message);
    qerrors(error, 'requireEnvVars-unexpected', { 
      varNames,
      errorMessage: error.message
    });
    logger.error('requireEnvVars failed with unexpected error', { 
      error: error.message,
      variables: varNames,
      stack: error.stack
    });

    // Re-throw with more context
    throw new Error(`Environment variable validation failed: ${error.message}`);
  }
}

module.exports = requireEnvVars;
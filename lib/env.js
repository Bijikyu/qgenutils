/*
 * Environment Variable Utilities Module
 * 
 * This module centralizes all environment variable validation and configuration
 * checking to prevent scattered validation logic across the application. The
 * design follows the "fail-fast" principle - configuration issues are detected
 * at startup rather than during runtime operations.
 * 
 * DESIGN PHILOSOPHY:
 * - Fail-fast: Detect configuration problems immediately at startup
 * - Centralized validation: Single source of truth for environment requirements
 * - Clear error messaging: Explicit feedback about missing configuration
 * - Test-friendly: Environment checks can be mocked in one place
 * 
 * CENTRALIZATION BENEFITS:
 * 1. Single source of truth for required environment variables
 * 2. Consistent error messaging for configuration issues
 * 3. Easy modification of validation logic without touching multiple files
 * 4. Better testing - environment checks can be mocked in one place
 * 5. Deployment validation - catch misconfigurations before runtime failures
 * 
 * FAIL-FAST RATIONALE:
 * Configuration errors should be detected as early as possible in the application
 * lifecycle. It's better to fail during startup with clear error messages than
 * to encounter cryptic runtime failures when environment variables are accessed.
 * 
 * COMMON USE CASES:
 * - Application startup validation
 * - Feature flag configuration checking
 * - External service credential validation
 * - Database connection string verification
 * - API key presence verification
 * 
 * SECURITY CONSIDERATIONS:
 * - Never log actual environment variable values (may contain secrets)
 * - Provide clear error messages without exposing sensitive configuration
 * - Use consistent error handling to prevent information disclosure
 */

const { qerrors } = require('qerrors'); // central error logging integration
const logger = require('./logger'); // structured logger

/**
 * Validate presence of required environment variables
 * 
 * RATIONALE: Environment variable misconfiguration is a common source of
 * deployment failures. This function allows modules to declaratively specify
 * their requirements and get clear feedback about missing configuration.
 * Rather than failing silently or with cryptic errors, this provides explicit
 * lists of missing variables for faster debugging.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Return array of missing variables (not boolean) for detailed feedback
 * - Filter approach allows checking multiple variables in one call
 * - Fail-safe behavior: assume all variables missing on unexpected errors
 * - Log validation attempts for debugging configuration issues
 * 
 * WHY RETURN MISSING ARRAY:
 * Returning the list of missing variables provides actionable feedback:
 * - Empty array = all variables present (success)
 * - Non-empty array = specific variables missing (clear error state)
 * - Caller can decide how to handle missing variables (error, warning, etc.)
 * 
 * FAIL-SAFE ERROR HANDLING:
 * On any unexpected error during validation, we assume ALL variables are
 * missing. This prevents false positives where validation errors might be
 * interpreted as "configuration is valid" when it's actually uncertain.
 * 
 * SECURITY CONSIDERATIONS:
 * - Never log actual environment variable values (may contain API keys, passwords)
 * - Log variable names only (safe for debugging, no sensitive data exposure)
 * - Use structured logging for consistent error tracking and monitoring
 * 
 * PERFORMANCE NOTES:
 * - Single pass through variable list using filter()
 * - No expensive operations (regex, parsing) - just existence checking
 * - Early return on error conditions to minimize processing time
 * 
 * TESTING STRATEGY:
 * Tests can mock process.env to simulate different configuration scenarios:
 * - All variables present
 * - Some variables missing
 * - Invalid variable names
 * - Error conditions during validation
 * 
 * @param {Array<string>} names - Array of environment variable names to check
 * @returns {Array<string>} Array of missing variable names (empty if all present)
 * 
 * USAGE EXAMPLES:
 * const missing = requireEnvVars(['DATABASE_URL', 'API_KEY']);
 * if (missing.length > 0) {
 *   console.error(`Missing environment variables: ${missing.join(', ')}`);
 *   process.exit(1);
 * }
 */
function requireEnvVars(names) {
  console.log(`requireEnvVars is running with ${names && Array.isArray(names) ? names.join(',') : 'undefined'}`); 
  logger.debug(`requireEnvVars is running with ${names && Array.isArray(names) ? names.join(',') : 'undefined'}`); // log validation attempt
  
  try {
    // Validate input parameter
    if (!names || !Array.isArray(names)) {
      console.log(`requireEnvVars is returning empty array - invalid names parameter`); 
      logger.debug(`requireEnvVars is returning empty array - invalid names parameter`);
      return []; // return empty array for invalid input (fail-safe)
    }
    
    // Filter out variables that exist and have non-empty values
    // We check both existence and non-empty string to catch empty variables
    const missing = names.filter(name => {
      if (typeof name !== 'string' || !name.trim()) {
        return true; // invalid variable names are considered "missing"
      }
      const value = process.env[name];
      return !value || value.trim() === ''; // missing or empty string values
    });
    
    console.log(`requireEnvVars is returning ${JSON.stringify(missing)}`); 
    logger.debug(`requireEnvVars found ${missing.length} missing variables out of ${names.length} checked`); // log missing variables count (safe)
    
    return missing; // return array of missing variable names
  } catch (error) {
    qerrors(error, 'requireEnvVars', { namesCount: names ? names.length : 0 }); // log error with safe context (no variable names)
    console.log(`requireEnvVars is returning all names due to error`); 
    logger.error(`requireEnvVars encountered error during validation, assuming all variables missing`); // log error condition
    
    // Assume all variables are missing on error (fail-safe)
    return Array.isArray(names) ? [...names] : []; // return copy of names array or empty array
  }
}

/**
 * Check if a specific environment variable exists and has a non-empty value
 * 
 * RATIONALE: Sometimes you need to check a single environment variable for
 * conditional logic (feature flags, optional integrations). This function
 * provides a simple boolean check for single variable validation.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Return boolean for simple if/else logic in calling code
 * - Check both existence and non-empty value (consistent with requireEnvVars)
 * - Handle invalid input gracefully (return false for safety)
 * - Log check attempts for debugging configuration issues
 * 
 * WHY SEPARATE FROM requireEnvVars:
 * While requireEnvVars is designed for startup validation of multiple required
 * variables, this function is optimized for runtime conditional checks of
 * single variables. Different use cases warrant different interfaces.
 * 
 * FAIL-SAFE BEHAVIOR:
 * On any error or invalid input, return false (variable not available).
 * This prevents conditional features from activating when configuration
 * state is uncertain.
 * 
 * @param {string} name - Environment variable name to check
 * @returns {boolean} True if variable exists and has non-empty value, false otherwise
 * 
 * USAGE EXAMPLES:
 * if (hasEnvVar('FEATURE_FLAG_ENABLED')) {
 *   enableOptionalFeature();
 * }
 * 
 * if (hasEnvVar('REDIS_URL')) {
 *   initializeRedisCache();
 * } else {
 *   initializeMemoryCache();
 * }
 */
function hasEnvVar(name) {
  console.log(`hasEnvVar is running with ${name}`); 
  logger.debug(`hasEnvVar checking variable existence`); // log check attempt (don't log variable name in production)
  
  try {
    // Validate input parameter
    if (typeof name !== 'string' || !name.trim()) {
      console.log(`hasEnvVar is returning false - invalid name parameter`); 
      logger.debug(`hasEnvVar is returning false - invalid name parameter`);
      return false; // invalid variable name = variable not available
    }
    
    const value = process.env[name];
    const exists = value && value.trim() !== '';
    
    console.log(`hasEnvVar is returning ${exists}`); 
    logger.debug(`hasEnvVar completed check - variable ${exists ? 'exists' : 'missing'}`); // log result without variable name
    
    return exists;
  } catch (error) {
    qerrors(error, 'hasEnvVar', { nameProvided: typeof name === 'string' }); // log error with safe context
    console.log(`hasEnvVar is returning false due to error`); 
    logger.error(`hasEnvVar encountered error during check, returning false`); // log error condition
    
    return false; // fail-safe: assume variable not available on error
  }
}

/**
 * Get environment variable value with optional default
 * 
 * RATIONALE: Provides safe access to environment variables with fallback values
 * for optional configuration. This centralizes the pattern of "get env var or
 * use default" that appears throughout applications.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Return actual value or provided default (not boolean)
 * - Handle both missing variables and empty string values
 * - Support any default value type (string, number, object, etc.)
 * - Log access attempts for debugging configuration usage
 * 
 * WHY OPTIONAL DEFAULT:
 * Some environment variables are required (should use requireEnvVars), others
 * are optional with sensible defaults. This function handles the optional case
 * while maintaining consistent error handling and logging patterns.
 * 
 * DEFAULT VALUE HANDLING:
 * If no default is provided and the variable is missing, returns undefined.
 * This allows callers to distinguish between "variable exists but empty" and
 * "variable completely missing" if needed.
 * 
 * @param {string} name - Environment variable name to get
 * @param {*} defaultValue - Default value to return if variable is missing/empty
 * @returns {*} Environment variable value or default value
 * 
 * USAGE EXAMPLES:
 * const port = getEnvVar('PORT', 3000); // number default
 * const dbUrl = getEnvVar('DATABASE_URL', 'sqlite://memory'); // string default
 * const config = getEnvVar('APP_CONFIG', { debug: false }); // object default
 */
function getEnvVar(name, defaultValue) {
  console.log(`getEnvVar is running with ${name}`); 
  logger.debug(`getEnvVar accessing variable with default provided: ${defaultValue !== undefined}`); // log access attempt
  
  try {
    // Validate input parameter
    if (typeof name !== 'string' || !name.trim()) {
      console.log(`getEnvVar is returning default due to invalid name parameter`); 
      logger.debug(`getEnvVar is returning default due to invalid name parameter`);
      return defaultValue; // invalid variable name = use default
    }
    
    const value = process.env[name];
    
    // Return actual value if it exists and is non-empty
    if (value && value.trim() !== '') {
      console.log(`getEnvVar is returning environment value`); 
      logger.debug(`getEnvVar found variable value`); // log successful access
      return value;
    }
    
    // Return default value if variable is missing or empty
    console.log(`getEnvVar is returning default value`); 
    logger.debug(`getEnvVar using default value - variable ${value === undefined ? 'missing' : 'empty'}`); // log default usage
    return defaultValue;
  } catch (error) {
    qerrors(error, 'getEnvVar', { nameProvided: typeof name === 'string', hasDefault: defaultValue !== undefined }); // log error with safe context
    console.log(`getEnvVar is returning default due to error`); 
    logger.error(`getEnvVar encountered error during access, returning default`); // log error condition
    
    return defaultValue; // fail-safe: use default on error
  }
}

/*
 * Module Export Strategy:
 * 
 * We export three complementary functions for different environment variable use cases:
 * 
 * 1. requireEnvVars - Startup validation of multiple required variables
 * 2. hasEnvVar - Runtime boolean check for single variable existence
 * 3. getEnvVar - Safe access with optional default values
 * 
 * This covers the full spectrum of environment variable patterns:
 * - Fail-fast validation during application startup
 * - Conditional feature enablement based on configuration
 * - Safe access to optional configuration with sensible defaults
 * 
 * FUTURE ENHANCEMENTS:
 * - Add environment variable type coercion (string to number, boolean parsing)
 * - Add environment variable format validation (URL format, email format)
 * - Add environment variable grouping (validate related variables together)
 * - Add environment variable documentation generation
 * - Add environment variable change detection for hot reloading
 */
module.exports = {
  requireEnvVars, // export multi-variable validation
  hasEnvVar, // export single variable existence check
  getEnvVar // export safe variable access with defaults
};
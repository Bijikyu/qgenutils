'use strict';

const convict = require('convict'); // robust config validation

/**
 * Builds a validated configuration object using convict
 * @param {Object} schema - Convict schema definition
 * @param {Object} [env] - Environment variables (defaults to process.env)
 * @param {Object} [overrides] - Additional config overrides
 * @returns {Object} Validated configuration object
 * @example
 * const config = buildSecureConfig({
 *   PORT: { format: 'port', default: 5000 },
 *   NODE_ENV: { format: ['development', 'production'], default: 'development' }
 * });
 */
function buildSecureConfig(schema, env = process.env, overrides = {}) { // build validated config
  if (!schema || typeof schema !== 'object') { // validate schema
    throw new Error('Schema is required and must be an object');
  }

  const config = convict(schema); // create convict instance

  const envOverrides = {}; // collect env var overrides
  for (const key of Object.keys(schema)) { // iterate schema keys
    if (env[key] !== undefined) { // check if env var exists
      envOverrides[key] = env[key];
    }
  }

  config.load(envOverrides); // load env overrides
  config.load(overrides); // load explicit overrides

  try {
    config.validate({ allowed: 'strict' }); // strict validation
  } catch (error) {
    throw new Error(`Configuration validation failed: ${error.message}`);
  }

  return config.getProperties(); // return validated config
}

module.exports = buildSecureConfig;

'use strict';

import { qerrors } from 'qerrors';

const convict: any = require('convict'); // robust config validation

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
const buildSecureConfig = (schema: any, env: any = process.env, overrides: any = {}): any => { // build validated config
  if (!schema || typeof schema !== 'object') throw new Error('Schema is required and must be an object');

  const config: any = convict(schema), envOverrides = {};
  for (const key of Object.keys(schema)) env[key] !== undefined && (envOverrides[key] = env[key]);

  config.load(envOverrides);
  config.load(overrides);

  try {
    config.validate({ allowed: 'strict' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    qerrors(error instanceof Error ? error : new Error(String(error)), 'buildSecureConfig', `Configuration validation failed for schema keys: ${Object.keys(schema).length}`);
    throw new Error(`Configuration validation failed: ${errorMessage}`);
  }

  return config.getProperties();
};

export default buildSecureConfig;

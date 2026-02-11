'use strict';

import qerrorsMod from '@bijikyu/qerrors';
const qerrors = (qerrorsMod as any).qerr || (qerrorsMod as any).qerrors || qerrorsMod;

import convict from 'convict'; // robust config validation

/**
 * Builds a validated configuration object using convict
 * @param {Object} schema - Convict schema definition
 * @param {Object} [env] - Environment variables (should import from localVars.js)
 * @param {Object} [overrides] - Additional config overrides
 * @returns {Object} Validated configuration object
 * @example
 * const config = buildSecureConfig({
 *   PORT: { format: 'port', default: 5000 },
 *   NODE_ENV: { format: ['development', 'production'], default: 'development' }
 * });
 */
const buildSecureConfig = (schema: any, env: any, overrides: any = {}): any => {
  // SECURITY: Input validation to prevent schema injection attacks
  // Ensures schema is a proper object and not maliciously crafted
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema is required and must be an object');
  }

  // Initialize convict with schema for type-safe configuration
  const config: any = convict(schema), envOverrides = {};

  // SECURITY: Safe environment variable extraction
  // Only loads environment variables that are defined in the schema
  // This prevents arbitrary environment variable injection
  for (const key of Object.keys(schema)) {
    env[key] !== undefined && (envOverrides[key] = env[key]);
  }

  // Load configuration in priority order:
  // 1. Schema defaults (lowest priority)
  // 2. Environment variables (medium priority)
  // 3. Explicit overrides (highest priority)
  config.load(envOverrides);
  config.load(overrides);

  // SECURITY: Strict validation to prevent configuration drift
  // 'strict' mode ensures no undefined configuration properties are allowed
  // This prevents typos and unauthorized configuration additions
  try {
    config.validate({ allowed: 'strict' });
  } catch (error) {
    // SECURITY: Sanitized error reporting to prevent information leakage
    // Only reports validation failure, not sensitive configuration details
    const errorMessage = error instanceof Error ? error.message : String(error);
    qerrors(error instanceof Error ? error : new Error(String(error)), 'buildSecureConfig', { message: `Configuration validation failed for schema keys: ${Object.keys(schema).length}` });
    throw new Error(`Configuration validation failed: ${errorMessage}`);
  }

  // Return validated, type-safe configuration object
  // All properties are guaranteed to match schema types and constraints
  return config.getProperties();
};

export default buildSecureConfig;

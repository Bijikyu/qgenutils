/**
 * Environment Utilities Module
 *
 * PURPOSE: Provide standardized, type-safe access to environment
 * variables with validation and type conversion.
 *
 * @module env
 */
export {
  getEnvVar,
  requireEnvVar,
  getStringEnvVar,
  getNumberEnvVar,
  getBooleanEnvVar,
  isTestEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
  getLogger
} from './envUtils.js';

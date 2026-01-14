/**
 * Environment Variable Access Utilities
 *
 * PURPOSE: Provide standardized, type-safe access to environment variables
 * with validation, type conversion, and fallback handling.
 *
 * IMPLEMENTATION FEATURES:
 * - Type-safe access with string/number/boolean conversion
 * - Required variable enforcement with clear error messages
 * - Empty string handling (treats whitespace-only as empty)
 * - Test environment detection
 * - Fallback logger for environments without configured logging
 *
 * @module env/envUtils
 */

import logger from '../../logger.js';

type EnvType = 'string' | 'number' | 'boolean';

/**
 * Get environment variable with optional type conversion and default.
 *
 * @param varName - Environment variable name
 * @param defaultValue - Default value if not found
 * @param type - Expected type ('string', 'number', 'boolean')
 * @returns Environment variable value or default
 *
 * @example
 * getEnvVar('PORT', 3000, 'number'); // 3000 or parsed PORT
 * getEnvVar('DEBUG', false, 'boolean'); // true if DEBUG='true'
 * getEnvVar('API_KEY', 'default'); // string value
 */
export const getEnvVar = (
  varName: string,
  defaultValue?: string | number | boolean,
  type: EnvType = 'string'
): string | number | boolean | undefined => {
  if (typeof process === 'undefined' || !process.env[varName]) {
    return defaultValue;
  }

  const envValue = process.env[varName] as string;

  if (type === 'string') {
    const trimmed = envValue.trim();
    return trimmed.length > 0 ? trimmed : defaultValue;
  }

  if (type === 'number') {
    const num = Number(envValue);
    return !isNaN(num) ? num : defaultValue;
  }

  if (type === 'boolean') {
    return envValue.toLowerCase() === 'true';
  }

  return defaultValue;
};

/**
 * Get required environment variable, throws if not found.
 *
 * @param varName - Environment variable name
 * @param type - Expected type ('string', 'number', 'boolean')
 * @returns Environment variable value
 * @throws Error if variable is not configured
 *
 * @example
 * const apiKey = requireEnvVar('API_KEY'); // throws if missing
 * const port = requireEnvVar('PORT', 'number'); // throws if missing
 */
export const requireEnvVar = (
  varName: string,
  type: EnvType = 'string'
): string | number | boolean => {
  const value = getEnvVar(varName, undefined, type);

  if (value === undefined || value === null) {
    const error = new Error(`Required environment variable ${varName} is not configured`);
    logger.error('requireEnvVar: missing required variable', { varName });
    throw error;
  }

  return value;
};

/**
 * Get string environment variable with trimming and empty check.
 *
 * @param varName - Environment variable name
 * @param defaultValue - Default value if not found or empty
 * @returns String value or default
 */
export const getStringEnvVar = (
  varName: string,
  defaultValue?: string
): string | undefined => {
  return getEnvVar(varName, defaultValue, 'string') as string | undefined;
};

/**
 * Get number environment variable with validation.
 *
 * @param varName - Environment variable name
 * @param defaultValue - Default value if not found or invalid
 * @returns Number value or default
 */
export const getNumberEnvVar = (
  varName: string,
  defaultValue?: number
): number | undefined => {
  return getEnvVar(varName, defaultValue, 'number') as number | undefined;
};

/**
 * Get boolean environment variable.
 *
 * @param varName - Environment variable name
 * @param defaultValue - Default value if not found
 * @returns Boolean value or default
 */
export const getBooleanEnvVar = (
  varName: string,
  defaultValue?: boolean
): boolean | undefined => {
  return getEnvVar(varName, defaultValue, 'boolean') as boolean | undefined;
};

/**
 * Check if running in test environment.
 *
 * @returns true if NODE_ENV is 'test'
 */
export const isTestEnvironment = (): boolean => {
  return getStringEnvVar('NODE_ENV') === 'test';
};

/**
 * Check if running in production environment.
 *
 * @returns true if NODE_ENV is 'production'
 */
export const isProductionEnvironment = (): boolean => {
  return getStringEnvVar('NODE_ENV') === 'production';
};

/**
 * Check if running in development environment.
 *
 * @returns true if NODE_ENV is 'development' or not set
 */
export const isDevelopmentEnvironment = (): boolean => {
  const env = getStringEnvVar('NODE_ENV');
  return !env || env === 'development';
};

/**
 * Get logger instance with console fallback.
 *
 * @returns Logger instance
 */
export const getLogger = () => {
  return logger || {
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console)
  };
};

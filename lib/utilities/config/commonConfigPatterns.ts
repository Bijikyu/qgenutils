/**
 * Common Configuration Utilities
 *
 * Centralized configuration utilities to eliminate code duplication across
 * codebase. These utilities handle common configuration patterns including
 * default merging, validation, and builder patterns.
 */

import { handleError } from '../error/commonErrorHandling.js';

/**
 * Configuration merging options
 */
interface MergeOptions {
  deep?: boolean;
  overwrite?: boolean;
  filter?: (key: string, value: any) => boolean;
}

/**
 * Deep merges configuration objects with validation
 * @param defaultConfig - Default configuration
 * @param userConfig - User configuration overrides
 * @param options - Merging options
 * @returns Merged configuration object
 */
export function mergeConfig(
  defaultConfig: Record<string, any>,
  userConfig: Record<string, any> = {},
  options: MergeOptions = {}
): Record<string, any> {
  const { deep = false, overwrite = true, filter } = options;

  try {
    const result = { ...defaultConfig };

    for (const [key, userValue] of Object.entries(userConfig)) {
      // Skip if filter function returns false
      if (filter && !filter(key, userValue)) {
        continue;
      }

      const defaultValue = result[key];

      // Handle deep merging
      if (deep &&
          typeof defaultValue === 'object' && defaultValue !== null &&
          typeof userValue === 'object' && userValue !== null) {
        result[key] = mergeConfig(defaultValue, userValue, { deep, overwrite, filter });
      } else if (overwrite || defaultValue === undefined) {
        result[key] = userValue;
      }
    }

    return result;
  } catch (error) {
    handleError(error, 'mergeConfig', 'Configuration merging failed');
    return defaultConfig;
  }
}

/**
 * Configuration field schema
 */
interface ConfigFieldSchema {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
}

/**
 * Validates configuration against schema
 * @param config - Configuration to validate
 * @param schema - Validation schema
 * @returns Validated configuration with defaults applied
 */
export function validateConfig(
  config: Record<string, any>,
  schema: Record<string, ConfigFieldSchema>
): Record<string, any> {
  const result: Record<string, any> = {};

  try {
    for (const [key, fieldSchema] of Object.entries(schema)) {
      let value = config[key];

      // Apply default value if missing
      if (value === undefined && 'defaultValue' in fieldSchema) {
        value = (fieldSchema as any).defaultValue;
      }

      // Check if required
      if (fieldSchema.required && (value === undefined || value === null)) {
        throw new Error(`Required configuration field '${key}' is missing`);
      }

      // Skip validation if value is optional and missing
      if (!fieldSchema.required && (value === undefined || value === null)) {
        result[key] = value;
        continue;
      }

      // Type validation
      if (fieldSchema.type) {
        const isValidType = validateFieldType(value, fieldSchema.type);
        if (!isValidType) {
          throw new Error(`Configuration field '${key}' must be of type ${fieldSchema.type}`);
        }
      }

      // Range validation for numbers
      if (typeof value === 'number') {
        if (fieldSchema.min !== undefined && value < fieldSchema.min) {
          throw new Error(`Configuration field '${key}' must be at least ${fieldSchema.min}`);
        }
        if (fieldSchema.max !== undefined && value > fieldSchema.max) {
          throw new Error(`Configuration field '${key}' cannot exceed ${fieldSchema.max}`);
        }
      }

      // Pattern validation for strings
      if (typeof value === 'string' && fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
        throw new Error(`Configuration field '${key}' does not match required pattern`);
      }

      // Allowed values validation
      if (fieldSchema.allowedValues && !fieldSchema.allowedValues.includes(value)) {
        throw new Error(`Configuration field '${key}' must be one of: ${fieldSchema.allowedValues.join(', ')}`);
      }

      // Custom validator
      if (fieldSchema.validator && !fieldSchema.validator(value)) {
        throw new Error(`Configuration field '${key}' failed custom validation`);
      }

      // Apply transformer
      if (fieldSchema.transformer) {
        value = fieldSchema.transformer(value);
      }

      result[key] = value;
    }

    return result;
  } catch (error) {
    handleError(error, 'validateConfig', 'Configuration validation failed');
    throw error;
  }
}

/**
 * Validates field type
 * @param value - Value to validate
 * @param type - Expected type
 * @returns True if value matches type
 */
function validateFieldType(value: any, type: string): boolean {
  switch (type) {
  case 'string':
    return typeof value === 'string';
  case 'number':
    return typeof value === 'number' && !isNaN(value);
  case 'boolean':
    return typeof value === 'boolean';
  case 'object':
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  case 'array':
    return Array.isArray(value);
  default:
    return false;
  }
}

/**
 * Creates a configuration builder with validation and merging
 * @param defaultConfig - Default configuration
 * @param schema - Validation schema
 * @returns Configuration builder function
 */
export function createConfigBuilder(
  defaultConfig: Record<string, any>,
  schema: Record<string, ConfigFieldSchema>
) {
  return (userConfig: Record<string, any> = {}): Record<string, any> => {
    // Merge with defaults
    const merged = mergeConfig(defaultConfig, userConfig);

    // Validate against schema
    return validateConfig(merged, schema);
  };
}

/**
 * Environment-specific configuration loader
 * @param baseConfig - Base configuration
 * @param environments - Environment-specific configurations
 * @param currentEnv - Current environment name
 * @returns Environment-specific configuration
 */
export function loadEnvironmentConfig(
  baseConfig: Record<string, any>,
  environments: Record<string, Record<string, any>>,
  currentEnv: string = process.env.NODE_ENV || 'development'
): Record<string, any> {
  try {
    // Get environment-specific config
    const envConfig = environments[currentEnv] || {};

    // Merge with base config
    return mergeConfig(baseConfig, envConfig);
  } catch (error) {
    handleError(error, 'loadEnvironmentConfig', `Failed to load config for environment: ${currentEnv}`);
    return baseConfig;
  }
}

/**
 * Configuration source types
 */
interface ConfigSource {
  name: string;
  load: () => Promise<Record<string, any>> | Record<string, any>;
  priority?: number;
}

/**
 * Loads configuration from multiple sources with priority
 * @param sources - Configuration sources array
 * @param defaultConfig - Default configuration
 * @returns Loaded configuration
 */
export async function loadFromSources(
  sources: ConfigSource[],
  defaultConfig: Record<string, any>
): Promise<Record<string, any>> {
  try {
    // Sort sources by priority (higher = higher priority)
    const sortedSources = sources.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    let mergedConfig = { ...defaultConfig };

    for (const source of sortedSources) {
      const sourceConfig = await source.load();

      if (sourceConfig && typeof sourceConfig === 'object') {
        mergedConfig = mergeConfig(mergedConfig, sourceConfig);
      }
    }

    return mergedConfig;
  } catch (error) {
    handleError(error, 'loadFromSources', 'Failed to load configuration from sources');
    return defaultConfig;
  }
}

/**
 * Common configuration field schemas
 */
export const CommonSchemas = {
  /**
   * Port number schema
   */
  port: {
    type: 'number' as const,
    required: false,
    min: 1,
    max: 65535,
    defaultValue: 3000
  },

  /**
   * Host string schema
   */
  host: {
    type: 'string' as const,
    required: false,
    pattern: /^([a-zA-Z0-9\-\.]+)$/,
    defaultValue: 'localhost'
  },

  /**
   * Boolean enable flag schema
   */
  enableFlag: (defaultValue: boolean = false) => ({
    type: 'boolean' as const,
    required: false,
    defaultValue
  }),

  /**
   * Timeout in milliseconds schema
   */
  timeout: (defaultValue: number = 30000) => ({
    type: 'number' as const,
    required: false,
    min: 0,
    max: 300000,
    defaultValue
  }),

  /**
   * Array of strings schema
   */
  stringArray: (defaultValue: string[] = []) => ({
    type: 'array' as const,
    required: false,
    defaultValue,
    validator: (value: any) => Array.isArray(value) && value.every(item => typeof item === 'string')
  }),

  /**
   * API key schema
   */
  apiKey: {
    type: 'string' as const,
    required: false,
    pattern: /^[a-zA-Z0-9\-_]{16,}$/,
    transformer: (value: any) => typeof value === 'string' ? value.trim() : value
  },

  /**
   * Environment schema
   */
  environment: {
    type: 'string' as const,
    required: false,
    defaultValue: 'development',
    allowedValues: ['development', 'staging', 'production', 'test']
  },

  /**
   * Log level schema
   */
  logLevel: {
    type: 'string' as const,
    required: false,
    defaultValue: 'info',
    allowedValues: ['error', 'warn', 'info', 'debug', 'trace']
  }
};

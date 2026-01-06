/**
 * SHARED CONFIGURATION UTILITIES
 * 
 * PURPOSE: Provides common configuration patterns used across the codebase.
 * This utility eliminates duplication of configuration merging and validation logic.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized configuration management
 * - Consistent validation patterns
 * - Type-safe configuration objects
 * - Environment-based overrides
 * - Schema validation support
 */

import { TypeValidators, ErrorHandlers } from './index.js';

/**
 * Configuration schema interface.
 */
export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    default?: any;
    min?: number;
    max?: number;
    enum?: any[];
    validator?: (value: any) => boolean;
  };
}

/**
 * Configuration validation result.
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  config: any;
}

/**
 * Builds configuration with defaults and validation.
 * 
 * @param defaultConfig - Default configuration values
 * @param userConfig - User-provided configuration overrides
 * @param schema - Optional validation schema
 * @returns Validated configuration object
 */
export const buildConfig = (
  defaultConfig: Record<string, any>,
  userConfig: Record<string, any> = {},
  schema?: ConfigSchema
): ConfigValidationResult => {
  const errors: string[] = [];
  const mergedConfig = { ...defaultConfig, ...userConfig };

  // Validate against schema if provided
  if (schema) {
    for (const [key, schemaRule] of Object.entries(schema)) {
      const value = mergedConfig[key];

      // Required validation
      if (schemaRule.required && (value === undefined || value === null)) {
        errors.push(`Configuration property '${key}' is required`);
        continue;
      }

      // Skip validation for undefined optional values
      if (value === undefined && !schemaRule.required) {
        mergedConfig[key] = schemaRule.default;
        continue;
      }

      // Type validation
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schemaRule.type) {
        errors.push(`Configuration property '${key}' must be of type ${schemaRule.type}, got ${actualType}`);
        continue;
      }

      // Range validation for numbers
      if (schemaRule.type === 'number') {
        if (schemaRule.min !== undefined && value < schemaRule.min) {
          errors.push(`Configuration property '${key}' must be at least ${schemaRule.min}`);
        }
        if (schemaRule.max !== undefined && value > schemaRule.max) {
          errors.push(`Configuration property '${key}' must be at most ${schemaRule.max}`);
        }
      }

      // Enum validation
      if (schemaRule.enum && !schemaRule.enum.includes(value)) {
        errors.push(`Configuration property '${key}' must be one of: ${schemaRule.enum.join(', ')}`);
      }

      // Custom validation
      if (schemaRule.validator && !schemaRule.validator(value)) {
        errors.push(`Configuration property '${key}' failed custom validation`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: mergedConfig
  };
};

/**
 * Creates a configuration builder with chaining methods.
 */
export class ConfigBuilder {
  private config: Record<string, any> = {};
  private schema: ConfigSchema = {};

  /**
   * Sets a configuration value.
   */
  set(key: string, value: any): ConfigBuilder {
    this.config[key] = value;
    return this;
  }

  /**
   * Adds a schema rule for a configuration property.
   */
  addSchema(key: string, rule: ConfigSchema[string]): ConfigBuilder {
    this.schema[key] = rule;
    return this;
  }

  /**
   * Sets multiple configuration values.
   */
  merge(config: Record<string, any>): ConfigBuilder {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Applies environment variable overrides.
   */
  fromEnv(envPrefix: string): ConfigBuilder {
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(envPrefix)) {
        const configKey = key.substring(envPrefix.length);
        // Simple type conversion - could be enhanced
        const parsedValue = !isNaN(Number(value)) ? Number(value) : value;
        this.config[configKey] = parsedValue;
      }
    }
    return this;
  }

  /**
   * Builds and validates the final configuration.
   */
  build(defaults: Record<string, any> = {}): ConfigValidationResult {
    return buildConfig(defaults, this.config, this.schema);
  }

  /**
   * Builds without validation (use with caution).
   */
  buildUnsafe(defaults: Record<string, any> = {}): Record<string, any> {
    return { ...defaults, ...this.config };
  }
}

/**
 * Creates common configuration schemas.
 */
export const CommonSchemas = {
  /**
   * Timeout configuration schema.
   */
  timeout: () => ({
    timeout: { type: 'number', required: true, min: 0, max: 300000 },
    retries: { type: 'number', default: 3, min: 0, max: 10 }
  }),

  /**
   * Rate limiting configuration schema.
   */
  rateLimit: () => ({
    windowMs: { type: 'number', required: true, min: 1000 },
    maxRequests: { type: 'number', required: true, min: 1 },
    skipSuccessfulRequests: { type: 'boolean', default: false },
    skipFailedRequests: { type: 'boolean', default: false }
  }),

  /**
   * Cache configuration schema.
   */
  cache: () => ({
    ttl: { type: 'number', required: true, min: 0 },
    maxSize: { type: 'number', default: 1000, min: 1 },
    strategy: { type: 'string', default: 'lru', enum: ['lru', 'fifo', 'lfu'] }
  }),

  /**
   * HTTP client configuration schema.
   */
  httpClient: () => ({
    baseUrl: { type: 'string', required: true },
    timeout: { type: 'number', default: 5000, min: 100 },
    retries: { type: 'number', default: 3, min: 0, max: 5 },
    retryDelay: { type: 'number', default: 1000, min: 0 }
  })
};

/**
 * Configuration presets for common use cases.
 */
export const ConfigPresets = {
  /**
   * Development configuration preset.
   */
  development: () => ({
    logging: { level: 'debug', console: true },
    performance: { enabled: true, detailed: true },
    security: { strict: false, https: false }
  }),

  /**
   * Production configuration preset.
   */
  production: () => ({
    logging: { level: 'error', console: false },
    performance: { enabled: false, detailed: false },
    security: { strict: true, https: true }
  }),

  /**
   * Testing configuration preset.
   */
  testing: () => ({
    logging: { level: 'silent', console: false },
    performance: { enabled: false, detailed: false },
    security: { strict: false, https: false }
  })
};

/**
 * Environment-based configuration loader.
 */
export const loadEnvConfig = (configPath?: string): ConfigValidationResult => {
  const env = process.env.NODE_ENV || 'development';
  
  // Default configuration based on environment
  let baseConfig = {};
  switch (env) {
    case 'production':
      baseConfig = ConfigPresets.production();
      break;
    case 'testing':
      baseConfig = ConfigPresets.testing();
      break;
    default:
      baseConfig = ConfigPresets.development();
  }

  // Try to load environment-specific config file
  try {
    if (configPath) {
      const envConfigPath = configPath.replace(/\.[^.]+$/, `.${env}.$&`);
      // File loading would be implementation-specific
      // const envConfig = require(envConfigPath);
      // baseConfig = { ...baseConfig, ...envConfig };
    }
  } catch (error) {
    // Environment-specific config is optional
  }

  return {
    isValid: true,
    errors: [],
    config: baseConfig
  };
};

/**
 * Validates configuration against security best practices.
 */
export const validateSecurityConfig = (config: Record<string, any>): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check for insecure defaults
  if (config.https === false && process.env.NODE_ENV === 'production') {
    warnings.push('HTTPS is disabled in production environment');
  }

  if (config.logging?.level === 'debug' && process.env.NODE_ENV === 'production') {
    warnings.push('Debug logging is enabled in production environment');
  }

  if (config.timeout && config.timeout > 60000) {
    warnings.push('Long timeout may lead to resource exhaustion');
  }

  if (config.retries && config.retries > 5) {
    warnings.push('High retry count may amplify failures');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

// Export all configuration utilities
export const ConfigUtils = {
  buildConfig,
  ConfigBuilder,
  CommonSchemas,
  ConfigPresets,
  loadEnvConfig,
  validateSecurityConfig
};

export default ConfigUtils;
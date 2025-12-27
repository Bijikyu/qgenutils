'use strict';

interface ConfigBuilderOptions {
  deepClone?: boolean;
  addTimestamps?: boolean;
  errorHandler?: ((error: Error, inputOptions: any) => any) | null;
}

/**
 * Creates a generic configuration builder with validation and defaults
 * @param {Object} schema - Configuration schema definition
 * @param {Object} schema.defaults - Default values for configuration
 * @param {Object} schema.validators - Validation functions for each field
 * @param {Object} schema.transformers - Optional transformers for field values
 * @param {Object} [options] - Builder options
 * @param {boolean} [options.deepClone=true] - Whether to deep clone objects
 * @param {boolean} [options.addTimestamps=true] - Whether to add createdAt/updatedAt
 * @param {Function} [options.errorHandler] - Custom error handler
 * @returns {Function} Configuration builder function
 * @example
 * const buildFeatureConfig = createConfigBuilder({
 *   defaults: { enabled: false, version: '1.0.0' },
 *   validators: { 
 *     name: (val) => typeof val === 'string' && val.length > 0,
 *     enabled: (val) => typeof val === 'boolean'
 *   }
 * });
 */
function createConfigBuilder(schema: any, options: ConfigBuilderOptions = {}) {
  const { 
    deepClone = true,
    addTimestamps = true,
    errorHandler = null
  } = options;

  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema object is required');
  }

  const { defaults = {}, validators = {}, transformers = {} } = schema;

  /**
   * Builds configuration with validation and defaults
   * @param {Object} [inputOptions={}] - Input configuration options
   * @returns {Object} Validated configuration object
   */
  return function buildConfig(inputOptions = {}) {
    try {
      // Start with defaults
      let config = deepClone ? JSON.parse(JSON.stringify(defaults)) : { ...defaults };

      // Apply input options
      for (const [key, value] of Object.entries(inputOptions)) {
        // Apply transformer if available
        if (transformers[key] && typeof transformers[key] === 'function') {
          try {
            config[key] = transformers[key](value);
          } catch (err) {
            throw new Error(`Transform error for field '${key}': ${err.message}`);
          }
        } else {
          config[key] = value;
        }
      }

      // Validate configuration
      for (const [key, validator] of Object.entries(validators)) {
        if (typeof validator === 'function') {
          try {
            const isValid: any = validator(config[key], config);
            if (!isValid) {
              throw new Error(`Validation failed for field '${key}'`);
            }
          } catch (err) {
            throw new Error(`Validation error for field '${key}': ${err.message}`);
          }
        }
      }

      // Add timestamps if requested
      if (addTimestamps) {
        const timestamp: any = new Date().toISOString();
        config.createdAt = timestamp;
        config.updatedAt = timestamp;
      }

      return config;

    } catch (err) {
      if (errorHandler && typeof errorHandler === 'function') {
        return errorHandler(err, inputOptions);
      }
      throw err;
    }
  };
}

/**
 * Creates a builder with common validation helpers
 * @param {Object} schema - Configuration schema
 * @param {Object} [options] - Builder options
 * @returns {Function} Enhanced configuration builder
 */
function createEnhancedConfigBuilder(schema, options = {}) {
  // Common validation helpers
  const validators = {
    required: (value) => value !== undefined && value !== null && value !== '',
    string: (value) => typeof value === 'string',
    number: (value) => typeof value === 'number' && !isNaN(value),
    boolean: (value) => typeof value === 'boolean',
    array: (value) => Array.isArray(value),
    object: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
    email: (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    url: (value: any): any => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    range: (min, max) => (value) => typeof value === 'number' && value >= min && value <= max,
    minLength: (length) => (value) => typeof value === 'string' && value.length >= length,
    maxLength: (length) => (value) => typeof value === 'string' && value.length <= length,
    pattern: (regex) => (value) => typeof value === 'string' && regex.test(value),
    enum: (values) => (value) => values.includes(value),
    positive: (value) => typeof value === 'number' && value > 0,
    nonNegative: (value) => typeof value === 'number' && value >= 0,
    percentage: (value) => typeof value === 'number' && value >= 0 && value <= 100
  };

  // Common transformers
  const transformers = {
    string: (value) => String(value),
    number: (value) => Number(value),
    boolean: (value) => Boolean(value),
    array: (value) => Array.isArray(value) ? value : [value],
    trim: (value) => typeof value === 'string' ? value.trim() : value,
    lowercase: (value) => typeof value === 'string' ? value.toLowerCase() : value,
    uppercase: (value) => typeof value === 'string' ? value.toUpperCase() : value,
    clone: (value) => JSON.parse(JSON.stringify(value))
  };

  // Merge schema with helpers
  const enhancedSchema = {
    ...schema,
    validators: { ...validators, ...schema.validators },
    transformers: { ...transformers, ...schema.transformers }
  };

  return createConfigBuilder(enhancedSchema, options);
}

/**
 * Creates a field schema for use with config builders
 * @param {Object} fieldConfig - Field configuration
 * @param {*} fieldConfig.default - Default value
 * @param {Array<Function|string>} fieldConfig.validate - Validation rules
 * @param {Array<Function|string>} fieldConfig.transform - Transformation rules
 * @param {boolean} fieldConfig.required - Whether field is required
 * @returns {Object} Field schema object
 */
function createFieldSchema(fieldConfig) {
  const { default: defaultValue, validate = [], transform = [], required = false }: any = fieldConfig;

  const validator = (value, config: any): any => {
    // Check required
    if (required && (value === undefined || value === null || value === '')) {
      return false;
    }

    // Skip validation if value is optional and empty
    if (!required && (value === undefined || value === null || value === '')) {
      return true;
    }

    // Apply validation rules
    for (const rule of validate) {
      if (typeof rule === 'function') {
        try {
          if (!rule(value, config)) {
            return false;
          }
        } catch (err) {
          return false;
        }
      }
    }

    return true;
  };

  const transformer = (value: any): any => {
    let result = value;
    
    for (const rule of transform) {
      if (typeof rule === 'function') {
        try {
          result = rule(result);
        } catch (err) {
          throw new Error(`Transform failed: ${err.message}`);
        }
      }
    }

    return result;
  };

  return {
    default: defaultValue,
    validator,
    transformer: transform.length > 0 ? transformer : undefined
  };
}

/**
 * Builds a schema from field definitions
 * @param {Object} fieldDefinitions - Field definition object
 * @returns {Object} Complete schema for config builder
 */
function buildSchema(fieldDefinitions) {
  const defaults: any = {};
  const validators: any = {};
  const transformers: any = {};

  for (const [fieldName, fieldConfig] of Object.entries(fieldDefinitions)) {
    const schema: any = createFieldSchema(fieldConfig);
    
    if (schema.default !== undefined) {
      defaults[fieldName] = schema.default;
    }
    
    validators[fieldName] = schema.validator;
    
     if (schema.transformer) {
        transformers[fieldName] = schema.transformer;
      } else if (schema.transformers && schema.transformers[fieldName]) {
        transformers[fieldName] = schema.transformers[fieldName];
      }
  }

  return { defaults, validators, transformers };
}

export default {
  createConfigBuilder,
  createEnhancedConfigBuilder,
  createFieldSchema,
  buildSchema
};
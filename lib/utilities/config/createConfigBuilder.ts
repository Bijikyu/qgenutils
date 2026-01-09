'use strict';

interface ConfigBuilderOptions {
  deepClone?: boolean;
  addTimestamps?: boolean;
  errorHandler?: ((error: Error, inputOptions: any) => any) | null;
}

/**
 * Creates a generic configuration builder with validation and defaults
 *
 * This function implements a flexible configuration builder pattern that
 * provides schema-based validation, default value application, and data
 * transformation capabilities. It's designed for creating type-safe,
 * validated configuration objects for applications and services.
 *
 * ## Validation Pattern Explanation
 *
 * The configuration builder uses a declarative validation approach:
 * 1. **Schema Definition**: Define defaults, validators, and transformers
 * 2. **Input Application**: Apply user input with transformation
 * 3. **Validation**: Run field-level validation with context
 * 4. **Error Handling**: Collect and report validation errors
 * 5. **Output Generation**: Return validated, transformed configuration
 *
 * ## Transformer Usage Examples
 *
 * Transformers are applied before validation and can be used for:
 * - **Type Coercion**: Convert strings to numbers, booleans, etc.
 * - **Data Sanitization**: Trim whitespace, normalize values
 * - **Format Standardization**: Ensure consistent data formats
 * - **Value Mapping**: Map enum values to internal representations
 *
 * @param {Object} schema - Configuration schema definition
 * @param {Object} schema.defaults - Default values for configuration fields
 * @param {Object} schema.validators - Validation functions for each field
 * @param {Object} schema.transformers - Optional transformers for field values
 * @param {Object} [options={}] - Builder options
 * @param {boolean} [options.deepClone=true] - Whether to deep clone objects to prevent mutation
 * @param {boolean} [options.addTimestamps=true] - Whether to add createdAt/updatedAt timestamps
 * @param {Function} [options.errorHandler=null] - Custom error handler for validation failures
 *
 * @returns {Function} Configuration builder function that takes input options and returns validated config
 *
 * @example
 * // Basic configuration builder
 * const buildDatabaseConfig = createConfigBuilder({
 *   defaults: {
 *     host: 'localhost',
 *     port: 5432,
 *     ssl: false,
 *     maxConnections: 10
 *   },
 *   validators: {
 *     host: (val) => typeof val === 'string' && val.length > 0,
 *     port: (val) => typeof val === 'number' && val > 0 && val < 65536,
 *     ssl: (val) => typeof val === 'boolean',
 *     maxConnections: (val) => typeof val === 'number' && val > 0
 *   },
 *   transformers: {
 *     port: (val) => Number(val),
 *     ssl: (val) => Boolean(val),
 *     maxConnections: (val) => Number(val)
 *   }
 * });
 *
 * const config = buildDatabaseConfig({
 *   host: 'db.example.com',
 *   port: '5432',
 *   ssl: 'true',
 *   maxConnections: '20'
 * });
 *
 * @example
 * // Advanced configuration with custom error handling
 * const buildApiConfig = createConfigBuilder({
 *   defaults: {
 *     timeout: 30000,
 *     retries: 3,
 *     baseUrl: 'https://api.example.com'
 *   },
 *   validators: {
 *     timeout: (val) => val >= 1000 && val <= 300000,
 *     retries: (val) => val >= 0 && val <= 10,
 *     baseUrl: (val) => {
 *       try {
 *         new URL(val);
 *         return true;
 *       } catch {
 *         return false;
 *       }
 *     }
 *   }
 * }, {
 *   errorHandler: (error, input) => {
 *     console.error('Configuration error:', error.message);
 *     return { error: error.message, input };
 *   }
 * });
 *
 * @throws {Error} When schema is not provided or is invalid
 * @throws {ValidationError} When validation fails (if no error handler provided)
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
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(`Transform error for field '${key}': ${errorMessage}`);
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
            const typedError = err instanceof Error ? err : new Error(String(err));
            throw new Error(`Validation error for field '${key}': ${typedError.message}`);
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
        return errorHandler(err as Error, inputOptions);
      }
      throw err;
    }
  };
}

/**
 * Creates an enhanced configuration builder with built-in validation helpers
 *
 * This function extends the basic config builder with a comprehensive set
 * of pre-built validation functions and transformers for common data types
 * and validation patterns. It eliminates the need to write boilerplate
 * validation code for standard use cases.
 *
 * ## Built-in Validation Helpers
 *
 * ### Type Validators
 * - `required`: Ensures value is present and not empty
 * - `string`: Validates string type
 * - `number`: Validates numeric type (excluding NaN)
 * - `boolean`: Validates boolean type
 * - `array`: Validates array type
 * - `object`: Validates object type (excluding arrays)
 *
 * ### Format Validators
 * - `email`: Validates email format using regex
 * - `url`: Validates URL format using URL constructor
 * - `pattern(regex)`: Validates against custom regex pattern
 * - `enum(values)`: Validates value is in allowed set
 *
 * ### Numeric Validators
 * - `range(min, max)`: Validates number is within range
 * - `positive`: Validates number is greater than 0
 * - `nonNegative`: Validates number is >= 0
 * - `percentage`: Validates number is between 0-100
 *
 * ### String Validators
 * - `minLength(length)`: Validates minimum string length
 * - `maxLength(length)`: Validates maximum string length
 *
 * ## Built-in Transformers
 *
 * ### Type Coercion
 * - `string`: Converts any value to string
 * - `number`: Converts to number (throws if invalid)
 * - `boolean`: Converts to boolean
 * - `array`: Wraps non-array values in array
 *
 * ### String Manipulation
 * - `trim`: Trims whitespace from strings
 * - `lowercase`: Converts to lowercase
 * - `uppercase`: Converts to uppercase
 *
 * ### Data Operations
 * - `clone`: Deep clones value using JSON serialization
 *
 * @param {Object} schema - Configuration schema with custom validators/transformers
 * @param {Object} [options={}] - Builder options (same as createConfigBuilder)
 *
 * @returns {Function} Enhanced configuration builder with built-in helpers
 *
 * @example
 * // Using built-in validators
 * const buildUserConfig = createEnhancedConfigBuilder({
 *   defaults: {
 *     name: '',
 *     age: 0,
 *     email: '',
 *     role: 'user',
 *     active: true
 *   },
 *   validators: {
 *     name: ['required', 'string', ['minLength', 2], ['maxLength', 50]],
 *     age: ['number', ['range', 18, 120]],
 *     email: ['required', 'email'],
 *     role: ['enum', ['user', 'admin', 'moderator']],
 *     active: ['boolean']
 *   },
 *   transformers: {
 *     name: ['trim', ['lowercase']],
 *     age: ['number'],
 *     active: ['boolean']
 *   }
 * });
 *
 * @example
 * // Complex validation with multiple rules
 * const buildServerConfig = createEnhancedConfigBuilder({
 *   defaults: {
 *     host: 'localhost',
 *     port: 8080,
 *     ssl: false,
 *     maxConnections: 100,
 *     timeout: 30000
 *   },
 *   validators: {
 *     host: ['required', 'string'],
 *     port: ['number', ['range', 1, 65535]],
 *     ssl: ['boolean'],
 *     maxConnections: ['number', ['positive'], ['range', 1, 10000]],
 *     timeout: ['number', ['range', 1000, 300000]]
 *   },
 *   transformers: {
 *     port: ['number'],
 *     ssl: ['boolean'],
 *     maxConnections: ['number'],
 *     timeout: ['number']
 *   }
 * });
 *
 * @example
 * // Custom validation with built-in helpers
 * const buildApiConfig = createEnhancedConfigBuilder({
 *   defaults: {
 *     endpoint: '',
 *     apiKey: '',
 *     timeout: 30000,
 *     retries: 3
 *   },
 *   validators: {
 *     endpoint: ['required', 'url'],
 *     apiKey: ['required', 'string', ['minLength', 16]],
 *     timeout: ['number', ['range', 5000, 60000]],
 *     retries: ['number', ['range', 0, 10]]
 *   },
 *   transformers: {
 *     endpoint: ['trim'],
 *     apiKey: ['trim'],
 *     timeout: ['number'],
 *     retries: ['number']
 *   }
 * });
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
    string: (value) => {
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    },
    number: (value) => {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        throw new Error('Invalid number');
      }
      return num;
    },
    boolean: (value) => {
      if (value === null || value === undefined) {
        return false;
      }
      return Boolean(value);
    },
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
 * Creates a field schema definition for individual configuration fields
 *
 * This function provides a structured way to define field-level validation,
 * transformation, and default value rules. It's particularly useful when
 * building complex configuration schemas with field-specific requirements.
 *
 * ## Field Configuration Structure
 *
 * Each field can have:
 * - **Default Value**: Fallback value when not provided
 * - **Validation Rules**: Array of validation functions or helper names
 * - **Transformation Rules**: Array of transformation functions or helper names
 * - **Required Flag**: Whether the field must have a non-empty value
 *
 * ## Validation Rule Format
 *
 * Validation rules can be specified as:
 * - **Function**: Custom validation function `(value, config) => boolean`
 * - **String**: Built-in validator name (from enhanced builder)
 * - **Array**: Built-in validator with parameters `['range', 0, 100]`
 *
 * ## Transformation Rule Format
 *
 * Transformation rules follow the same pattern:
 * - **Function**: Custom transformer function `(value) => transformedValue`
 * - **String**: Built-in transformer name
 * - **Array**: Built-in transformer with parameters
 *
 * @param {Object} fieldConfig - Field configuration object
 * @param {*} fieldConfig.default - Default value for the field
 * @param {Array<Function|string>} [fieldConfig.validate=[]] - Validation rules array
 * @param {Array<Function|string>} [fieldConfig.transform=[]] - Transformation rules array
 * @param {boolean} [fieldConfig.required=false] - Whether field is required
 *
 * @returns {Object} Field schema object with validator and transformer functions
 *
 * @example
 * // Simple required field
 * const nameField = createFieldSchema({
 *   default: '',
 *   required: true,
 *   validate: ['string', ['minLength', 2]],
 *   transform: ['trim']
 * });
 *
 * @example
 * // Numeric field with range validation
 * const ageField = createFieldSchema({
 *   default: 18,
 *   required: true,
 *   validate: ['number', ['range', 18, 120]],
 *   transform: ['number']
 * });
 *
 * @example
 * // Email field with custom validation
 * const emailField = createFieldSchema({
 *   default: '',
 *   required: true,
 *   validate: [
 *     'string',
 *     'email',
 *     (value, config) => {
 *       // Custom business logic
 *       if (value.endsWith('@spam.com')) {
 *         return false;
 *       }
 *       return true;
 *     }
 *   ],
 *   transform: ['trim', 'lowercase']
 * });
 *
 * @example
 * // Optional field with conditional validation
 * const phoneField = createFieldSchema({
 *   default: '',
 *   required: false,
 *   validate: [
 *     (value, config) => {
 *       // Only validate if phone is provided
 *       if (!value) return true;
 *       return /^[\d\s\-\+\(\)]+$/.test(value);
 *     }
 *   ],
 *   transform: ['trim']
 * });
 *
 * @returns {Object} Schema object with:
 * - `default`: Default value
 * - `validator`: Compiled validation function
 * - `transformer`: Compiled transformation function (if any)
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
          throw new Error(`Transform failed: ${err instanceof Error ? err.message : String(err)}`);
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
 * Builds a complete configuration schema from field definitions
 *
 * This function processes an object of field definitions (created with
 * createFieldSchema) and compiles them into a complete schema that
 * can be used with createConfigBuilder. It extracts defaults, validators,
 * and transformers from each field definition.
 *
 * ## Schema Compilation Process
 *
 * 1. **Field Processing**: Iterate through each field definition
 * 2. **Default Extraction**: Collect default values for each field
 * 3. **Validator Compilation**: Compile field validators into schema validators
 * 4. **Transformer Compilation**: Compile field transformers into schema transformers
 * 5. **Schema Assembly**: Combine all components into final schema object
 *
 * ## Field Definition Object Structure
 *
 * The input should be an object where keys are field names and values
 * are field configurations created by createFieldSchema:
 *
 * ```javascript
 * {
 *   fieldName: createFieldSchema({
 *     default: 'defaultValue',
 *     required: true,
 *     validate: ['string', ['minLength', 2]],
 *     transform: ['trim']
 *   }),
 *   anotherField: createFieldSchema({...})
 * }
 * ```
 *
 * ## Generated Schema Structure
 *
 * The output schema has the following structure:
 * ```javascript
 * {
 *   defaults: {
 *     fieldName: 'defaultValue',
 *     anotherField: 123
 *   },
 *   validators: {
 *     fieldName: (value, config) => boolean,
 *     anotherField: (value, config) => boolean
 *   },
 *   transformers: {
 *     fieldName: (value) => transformedValue,
 *     anotherField: (value) => transformedValue
 *   }
 * }
 * ```
 *
 * @param {Object} fieldDefinitions - Object mapping field names to field schema definitions
 *
 * @returns {Object} Complete schema object with defaults, validators, and transformers
 *
 * @example
 * // Define field schemas
 * const fieldDefinitions = {
 *   name: createFieldSchema({
 *     default: '',
 *     required: true,
 *     validate: ['string', ['minLength', 2]],
 *     transform: ['trim']
 *   }),
 *   age: createFieldSchema({
 *     default: 18,
 *     required: true,
 *     validate: ['number', ['range', 18, 120]],
 *     transform: ['number']
 *   }),
 *   email: createFieldSchema({
 *     default: '',
 *     required: true,
 *     validate: ['email'],
 *     transform: ['trim', 'lowercase']
 *   }),
 *   active: createFieldSchema({
 *     default: true,
 *     required: false,
 *     validate: ['boolean'],
 *     transform: ['boolean']
 *   })
 * };
 *
 * // Build complete schema
 * const schema = buildSchema(fieldDefinitions);
 *
 * // Create config builder
 * const buildUserConfig = createConfigBuilder(schema);
 *
 * @example
 * // Using with enhanced builder
 * const enhancedFieldDefinitions = {
 *   apiUrl: createFieldSchema({
 *     default: 'https://api.example.com',
 *     required: true,
 *     validate: ['url'],
 *     transform: ['trim']
 *   }),
 *   timeout: createFieldSchema({
 *     default: 30000,
 *     required: false,
 *     validate: [['range', 1000, 300000]],
 *     transform: ['number']
 *   }),
 *   retries: createFieldSchema({
 *     default: 3,
 *     required: false,
 *     validate: [['range', 0, 10]],
 *     transform: ['number']
 *   })
 * };
 *
 * const schema = buildSchema(enhancedFieldDefinitions);
 * const buildApiConfig = createEnhancedConfigBuilder(schema);
 *
 * @throws {Error} When field definitions contain invalid field schemas
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

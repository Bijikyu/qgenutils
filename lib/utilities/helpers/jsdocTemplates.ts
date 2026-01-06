/**
 * JSDoc Template Utilities for Consistent Documentation
 * 
 * PURPOSE: Provides standardized JSDoc templates and documentation helpers
 * to ensure consistent API documentation across all utility functions.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Create reusable JSDoc templates for common function patterns
 * - Standardize parameter and return value documentation
 * - Provide consistent error handling documentation
 * - Maintain comprehensive example documentation
 * - Support TypeScript-specific documentation
 * 
 * USAGE PATTERNS:
 * - Standardize utility function documentation
 * - Consistent parameter descriptions and types
 * - Unified error handling documentation
 * - Standardized example format
 */

/**
 * JSDoc template for utility validation functions
 * 
 * @param {string} input - Input value to validate
 * @param {string} fieldName - Name of the field being validated (for error messages)
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.required=true] - Whether the field is required
 * @param {string} [options.message] - Custom error message
 * @returns {string|null} Error message or null if valid
 * @throws Never throws - always returns string or null
 * 
 * @example
 * // Basic usage
 * const error = validateFunction(input, 'fieldName');
 * if (error) {
 *   console.error('Validation failed:', error);
 * }
 * 
 * @example
 * // With options
 * const error = validateFunction(input, 'fieldName', {
 *   required: false,
 *   message: 'Custom error message'
 * });
 */
export const validationFunctionTemplate = `
/**
 * Validates input with consistent error handling
 * 
 * @param input - Input value to validate
 * @param fieldName - Name of the field being validated
 * @param options - Validation options configuration
 * @returns Validation result or null if valid
 * @throws Never throws - always returns string or null
 * 
 * @example
 * const error = validateFunction(input, 'fieldName');
 * if (error) {
 *   console.error('Validation failed:', error);
 * }
 */`;

/**
 * JSDoc template for utility transformation functions
 * 
 * @param {any} input - Input value to transform
 * @param {Object} [options] - Transformation options
 * @returns {any} Transformed value
 * @throws Never throws - returns safe fallback value on error
 * 
 * @example
 * // Basic transformation
 * const result = transformFunction(input);
 * console.log('Transformed:', result);
 * 
 * @example
 * // With options
 * const result = transformFunction(input, { option: 'value' });
 */
export const transformationFunctionTemplate = `
/**
 * Transforms input with consistent error handling
 * 
 * @param input - Input value to transform
 * @param options - Transformation options configuration
 * @returns Transformed value with safe fallback
 * @throws Never throws - returns safe fallback value on error
 * 
 * @example
 * const result = transformFunction(input);
 * console.log('Transformed:', result);
 */`;

/**
 * JSDoc template for utility format functions
 * 
 * @param {any} input - Input value to format
 * @param {Object} [options] - Formatting options
 * @param {string} [options.format='default'] - Default format to use
 * @param {string} [options.locale] - Locale for formatting
 * @returns {string} Formatted string
 * @throws Never throws - returns safe fallback string on error
 * 
 * @example
 * // Basic formatting
 * const formatted = formatFunction(input);
 * console.log('Formatted:', formatted);
 * 
 * @example
 * // With custom format
 * const formatted = formatFunction(input, { format: 'custom' });
 */
export const formatFunctionTemplate = `
/**
 * Formats input with consistent error handling
 * 
 * @param input - Input value to format
 * @param options - Formatting options configuration
 * @returns Formatted string with safe fallback
 * @throws Never throws - returns safe fallback string on error
 * 
 * @example
 * const formatted = formatFunction(input);
 * console.log('Formatted:', formatted);
 */`;

/**
 * JSDoc template for utility generator functions
 * 
 * @param {Object} [options] - Generator options
 * @param {string} [options.prefix=''] - Prefix for generated values
 * @param {number} [options.length=10] - Length of generated values
 * @param {string} [options.charset] - Character set to use
 * @returns {string} Generated value
 * @throws Never throws - returns safe fallback value on error
 * 
 * @example
 * // Basic generation
 * const value = generateFunction();
 * console.log('Generated:', value);
 * 
 * @example
 * // With options
 * const value = generateFunction({ prefix: 'test_', length: 20 });
 */
export const generatorFunctionTemplate = `
/**
 * Generates value with consistent error handling
 * 
 * @param options - Generation options configuration
 * @returns Generated value with safe fallback
 * @throws Never throws - returns safe fallback value on error
 * 
 * @example
 * const value = generateFunction();
 * console.log('Generated:', value);
 */`;

/**
 * JSDoc template for utility configuration functions
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.name - Configuration name
 * @param {any} config.value - Configuration value
 * @param {Object} [options] - Additional options
 * @returns {Object} Processed configuration
 * @throws Never throws - returns safe default config on error
 * 
 * @example
 * // Basic configuration
 * const config = configFunction({ name: 'test', value: true });
 * console.log('Config:', config);
 * 
 * @example
 * // With options
 * const config = configFunction({ name: 'test', value: true }, { 
 *   validate: true 
 * });
 */
export const configFunctionTemplate = `
/**
 * Processes configuration with consistent error handling
 * 
 * @param config - Configuration object to process
 * @param options - Additional processing options
 * @returns Processed configuration with safe fallback
 * @throws Never throws - returns safe default config on error
 * 
 * @example
 * const config = configFunction({ name: 'test', value: true });
 * console.log('Config:', config);
 */`;

/**
 * Generates standardized JSDoc for utility functions
 * 
 * @param type - Type of utility function
 * @param functionName - Name of the function
 * @param description - Brief description of function purpose
 * @param params - Array of parameter objects
 * @param returns - Return value description
 * @param examples - Array of usage examples
 * @returns Complete JSDoc string
 */
export function generateJSDoc(
  type: 'validation' | 'transformation' | 'format' | 'generator' | 'config' | 'custom',
  functionName: string,
  description: string,
  params: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
    defaultValue?: string;
  }>,
  returns: { type: string; description: string },
  examples?: string[]
): string {
  const templates = {
    validation: validationFunctionTemplate,
    transformation: transformationFunctionTemplate,
    format: formatFunctionTemplate,
    generator: generatorFunctionTemplate,
    config: configFunctionTemplate,
    custom: ''
  };

  let jsdoc = `/**
 * ${description}
 * 
`;

  // Add parameters
  if (params.length > 0) {
    jsdoc += ' * @param';
    params.forEach(param => {
      const optional = param.optional ? ' [optional]' : '';
      const defaultValue = param.defaultValue ? ` [default: ${param.defaultValue}]` : '';
      jsdoc += ` {${param.type}} ${param.name}${optional}${defaultValue} - ${param.description}\n *`;
    });
    jsdoc += '\n';
  }

  // Add return value
  jsdoc += ` * @returns {${returns.type}} ${returns.description}\n`;
  
  // Add error handling note
  jsdoc += ` * @throws Never throws - returns safe fallback value on error\n`;

  // Add examples
  if (examples && examples.length > 0) {
    jsdoc += ' * \n';
    examples.forEach((example, index) => {
      jsdoc += ` * @example\n`;
      jsdoc += ` * ${example}\n`;
    });
  }

  jsdoc += ' */';
  return jsdoc;
}

/**
 * Creates parameter object for JSDoc generation
 * 
 * @param name - Parameter name
 * @param type - Parameter type
 * @param description - Parameter description
 * @param options - Optional parameter settings
 * @returns Parameter object for JSDoc generation
 */
export function createJSDocParam(
  name: string,
  type: string,
  description: string,
  options: { optional?: boolean; defaultValue?: string } = {}
) {
  return {
    name,
    type,
    description,
    optional: options.optional,
    defaultValue: options.defaultValue
  };
}

/**
 * Creates return value object for JSDoc generation
 * 
 * @param type - Return type
 * @param description - Return value description
 * @returns Return value object for JSDoc generation
 */
export function createJSDocReturn(type: string, description: string) {
  return { type, description };
}
/**
 * String Transformation Utilities - Safe, Type-Checked String Operations
 * 
 * PURPOSE: This module provides a comprehensive set of string transformation utilities
 * that prioritize type safety and predictable behavior. All functions include built-in
 * validation to prevent runtime errors when handling non-string inputs.
 * 
 * SECURITY CONSIDERATIONS: These utilities are designed to safely handle user input
 * and malformed data without throwing exceptions. Each function returns a sensible
 * default value when the input is not a string, making them ideal for data processing
 * pipelines where input validation may not be complete.
 * 
 * DESIGN PATTERNS: 
 * - All functions follow the "safe" prefix convention to indicate they include type checking
 * - Consistent parameter ordering: (value, defaultValue, additionalOptions)
 * - Immutable operations that never modify the original input
 * - Composable design allowing functions to be chained or used in pipelines
 * 
 * PERFORMANCE CONSIDERATIONS: These utilities are optimized for common use cases
 * while maintaining readability and safety. They avoid unnecessary object creation
 * and use efficient string manipulation techniques.
 */

/**
 * Safely trims whitespace from both ends of a string with comprehensive type checking
 * 
 * PURPOSE: Removes leading and trailing whitespace from strings while safely handling
 * non-string inputs. This is essential for cleaning user input and form data where
 * the input type may not be guaranteed.
 * 
 * SECURITY: Prevents runtime errors when processing malformed data by returning
 * a default value instead of throwing exceptions. This makes the function suitable
 * for use in data validation pipelines.
 * 
 * @param {*} value - Value to trim (any type accepted for safety)
 * @param {string} defaultValue - Default value if input is not a string (defaults to empty string)
 * @returns {string} Trimmed string or default value if input is invalid
 * 
 * @example
 * safeTrim('  hello world  ') // returns 'hello world'
 * safeTrim(123) // returns ''
 * safeTrim(null, 'default') // returns 'default'
 */
function safeTrim(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  return value.trim();
}

/**
 * Safely converts string to lowercase with comprehensive type checking
 * 
 * PURPOSE: Converts strings to lowercase for case-insensitive comparisons and
 * data normalization. Handles non-string inputs gracefully to prevent runtime
 * errors in data processing pipelines.
 * 
 * USE CASES: Ideal for email normalization, username processing, search term
 * preparation, and any scenario where case-insensitive handling is required.
 * 
 * INTERNATIONALIZATION: Uses JavaScript's built-in toLowerCase() method which
 * handles Unicode characters appropriately for most common use cases.
 * 
 * @param {*} value - Value to convert (any type accepted for safety)
 * @param {string} defaultValue - Default value if input is not a string (defaults to empty string)
 * @returns {string} Lowercase string or default value if input is invalid
 * 
 * @example
 * safeToLower('HELLO WORLD') // returns 'hello world'
 * safeToLower('Mixed CASE') // returns 'mixed case'
 * safeToLower(456) // returns ''
 */
function safeToLower(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  return value.toLowerCase();
}

/**
 * Safely converts string to uppercase with type checking
 * @param {*} value - Value to convert
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Uppercase string or default value
 */
function safeToUpper(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  return value.toUpperCase();
}

/**
 * Safely capitalizes first letter of string
 * @param {*} value - Value to capitalize
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Capitalized string or default value
 */
function safeCapitalize(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  if (value.length === 0) {
    return ``;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Safely trims and converts string to lowercase
 * @param {*} value - Value to process
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Trimmed lowercase string or default value
 */
function safeTrimToLower(value, defaultValue = ``) {
  const trimmed: any = safeTrim(value);
  return trimmed === defaultValue ? defaultValue : safeToLower(trimmed, defaultValue);
}

/**
 * Safely trims and converts string to uppercase
 * @param {*} value - Value to process
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Trimmed uppercase string or default value
 */
function safeTrimToUpper(value, defaultValue = ``) {
  const trimmed: any = safeTrim(value);
  return trimmed === defaultValue ? defaultValue : safeToUpper(trimmed, defaultValue);
}

/**
 * Removes extra whitespace and normalizes spaces in string
 * @param {*} value - Value to normalize
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Normalized string or default value
 */
function safeNormalizeWhitespace(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Converts string to camelCase format with comprehensive type checking
 * 
 * PURPOSE: Transforms strings from various formats (snake_case, kebab-case,
 * Title Case, etc.) into camelCase for JavaScript property names and variable
 * naming conventions. Essential for API response processing and data mapping.
 * 
 * ALGORITHM: Uses a sophisticated regex-based approach that:
 * 1. Identifies word boundaries (spaces, hyphens, underscores, capital letters)
 * 2. Capitalizes the first letter of each word except the first
 * 3. Removes all separators to create the camelCase format
 * 
 * EDGE CASES: Handles multiple consecutive separators, mixed case input,
 * and strings with no separators. Preserves Unicode characters appropriately.
 * 
 * @param {*} value - Value to convert (any type accepted for safety)
 * @param {string} defaultValue - Default value if input is not a string (defaults to empty string)
 * @returns {string} camelCase string or default value if input is invalid
 * 
 * @example
 * safeToCamelCase('hello_world') // returns 'helloWorld'
 * safeToCamelCase('hello-world') // returns 'helloWorld'
 * safeToCamelCase('Hello World') // returns 'helloWorld'
 * safeToCamelCase('alreadyCamelCase') // returns 'alreadyCamelCase'
 */
function safeToCamelCase(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return value
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index: any): any => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, ``)
    .replace(/[-_]/g, ``);
}

/**
 * Converts string to snake_case
 * @param {*} value - Value to convert
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} snake_case string or default value
 */
function safeToSnakeCase(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return value
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_');
}

/**
 * Converts string to kebab-case
 * @param {*} value - Value to convert
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} kebab-case string or default value
 */
function safeToKebabCase(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return value
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('-');
}

/**
 * Safely truncates string to specified length
 * @param {*} value - Value to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated (default: '...')
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Truncated string or default value
 */
function safeTruncate(value, maxLength, suffix = `...`, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  if (value.length <= maxLength) {
    return value;
  }
  
  return value.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Safely pads string to specified length
 * @param {*} value - Value to pad
 * @param {number} length - Target length
 * @param {string} padString - String to pad with (default: ' ')
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Padded string or default value
 */
function safePad(value, length, padString = ` `, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return value.padEnd(length, padString);
}

/**
 * Safely removes all non-alphanumeric characters
 * @param {*} value - Value to clean
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Cleaned string or default value
 */
function safeRemoveNonAlphaNumeric(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return value.replace(/[^a-zA-Z0-9]/g, ``);
}

/**
 * Performs multiple string transformations in sequence with pipeline pattern
 * 
 * PURPOSE: Enables composition of multiple string operations into a single
 * transformation pipeline. This is powerful for complex data processing where
 * multiple transformations need to be applied in a specific order.
 * 
 * DESIGN PATTERN: Uses the functional programming pipeline pattern with
 * Array.reduce() to chain transformations. Each transformation receives
 * the output of the previous one as its input.
 * 
 * ERROR HANDLING: Gracefully handles transformation functions that return
 * null/undefined by falling back to the default value, ensuring the pipeline
 * never breaks due to unexpected function behavior.
 * 
 * PERFORMANCE: Efficiently processes transformations without creating
 * intermediate arrays, using a single pass through the transformation array.
 * 
 * @param {*} value - Value to transform (any type accepted for safety)
 * @param {Array} transformations - Array of transformation functions to apply in sequence
 * @param {string} defaultValue - Default value if input is not a string (defaults to empty string)
 * @returns {string} Transformed string or default value if input is invalid
 * 
 * @example
 * const pipeline = [safeTrim, safeToLower, safeToCamelCase];
 * safeTransform('  HELLO WORLD  ', pipeline) // returns 'helloWorld'
 */
function safeTransform(value: any, transformations: ((value: any) => any)[] = [], defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return transformations.reduce((result, transform: any): any => {
    if (typeof transform === `function`) {
      return transform(result) || defaultValue;
    }
    return result;
  }, value);
}

/**
 * Creates a string transformation pipeline
 * @param {Array} steps - Transformation steps with functions and options
 * @returns {Function} Pipeline function
 */
interface TransformStep {
  fn: (value: any) => any;
  [key: string]: any;
}

function createStringPipeline(steps: TransformStep[] = []) {
  return function(value, defaultValue = ``) {
    return safeTransform(value, steps.map(step => step.fn), defaultValue);
  };
}

/**
 * Common transformation presets for frequently used string operations
 * 
 * PURPOSE: Provides ready-to-use transformation functions for the most common
 * string processing scenarios. These presets eliminate the need to create
 * inline functions and enable consistent string processing across the application.
 * 
 * ARCHITECTURE: Each preset is a curried function that can be used directly
 * or composed into larger transformation pipelines. They follow the same
 * safety patterns as the individual transformation functions.
 * 
 * USAGE PATTERNS: These presets are designed for:
 * - Data normalization (trim, normalize)
 * - Case conversion (lower, upper, capitalize)
 * - Format conversion (camelCase, snakeCase, kebabCase)
 * - Combined operations (trimLower, trimUpper)
 * 
 * EXTENSIBILITY: New presets can be easily added by composing existing
 * transformation functions, ensuring consistency and reusability.
 */
const TRANSFORM_PRESETS = {
  trim: (value) => safeTrim(value),
  lower: (value) => safeToLower(value),
  upper: (value) => safeToUpper(value),
  capitalize: (value) => safeCapitalize(value),
  trimLower: (value) => safeTrimToLower(value),
  trimUpper: (value) => safeTrimToUpper(value),
  normalize: (value) => safeNormalizeWhitespace(value),
  camelCase: (value) => safeToCamelCase(value),
  snakeCase: (value) => safeToSnakeCase(value),
  kebabCase: (value) => safeToKebabCase(value)
};

export default {
  safeTrim,
  safeToLower,
  safeToUpper,
  safeCapitalize,
  safeTrimToLower,
  safeTrimToUpper,
  safeNormalizeWhitespace,
  safeToCamelCase,
  safeToSnakeCase,
  safeToKebabCase,
  safeTruncate,
  safePad,
  safeRemoveNonAlphaNumeric,
  safeTransform,
  createStringPipeline,
  TRANSFORM_PRESETS
};
/**
 * String transformation utilities for common string operations
 */

/**
 * Safely trims a string with type checking
 * @param {*} value - Value to trim
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Trimmed string or default value
 */
function safeTrim(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  return value.trim();
}

/**
 * Safely converts string to lowercase with type checking
 * @param {*} value - Value to convert
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Lowercase string or default value
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
  const trimmed = safeTrim(value);
  return trimmed === defaultValue ? defaultValue : safeToLower(trimmed, defaultValue);
}

/**
 * Safely trims and converts string to uppercase
 * @param {*} value - Value to process
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Trimmed uppercase string or default value
 */
function safeTrimToUpper(value, defaultValue = ``) {
  const trimmed = safeTrim(value);
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
 * Converts string to camelCase
 * @param {*} value - Value to convert
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} camelCase string or default value
 */
function safeToCamelCase(value, defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return value
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
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
 * Performs multiple string transformations in sequence
 * @param {*} value - Value to transform
 * @param {Array} transformations - Array of transformation functions
 * @param {string} defaultValue - Default value if input is not a string
 * @returns {string} Transformed string or default value
 */
function safeTransform(value, transformations = [], defaultValue = ``) {
  if (typeof value !== `string`) {
    return defaultValue;
  }
  
  return transformations.reduce((result, transform) => {
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
function createStringPipeline(steps = []) {
  return function(value, defaultValue = ``) {
    return safeTransform(value, steps.map(step => step.fn), defaultValue);
  };
}

/**
 * Common transformation presets
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

module.exports = {
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
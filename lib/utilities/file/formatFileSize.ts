/**
 * File Size Formatter - Human-Readable Byte Conversion Utility
 * 
 * PURPOSE: Converts raw byte values into human-readable file size formats
 * using the industry-standard filesize library. This utility provides
 * consistent, localized, and customizable file size presentation for
 * user interfaces, logging, and data visualization.
 * 
 * IMPLEMENTATION FEATURES:
 * - Battle-Tested Library: Uses the well-maintained filesize npm package
 * - Localization Ready: Supports international number formatting
 * - Multiple Standards: JEDEC (KB, MB) and SI (KiB, MiB) standards
 * - Customizable Output: Flexible rounding, spacing, and suffix configuration
 * - Comprehensive Testing: Handles edge cases and various input ranges
 * - Performance Optimized: Efficient calculations for large datasets
 * 
 * FORMATTING STANDARDS:
 * - Binary Base (1024): Traditional computing standard (KB, MB, GB)
 * - Decimal Base (1000): SI standard for storage devices
 * - JEDEC Standard: Uses KB, MB notation instead of KiB, MiB
 * - Configurable Precision: Control over decimal places and rounding
 * 
 * USE CASES:
 * - File upload progress displays with appropriate units
 * - Storage usage dashboards and monitoring interfaces
 * - Download managers with size information
 * - System administration tools and disk space reports
 * - Data transfer rate displays and bandwidth monitoring
 * 
 * ERROR HANDLING STRATEGY:
 * - Graceful Degradation: Never throws exceptions for invalid input
 * - Consistent Fallback: Returns "0 B" for all error conditions
 * - Comprehensive Logging: Debug and error logging for monitoring
 * - Input Validation: Handles NaN, negative, and non-number inputs
 * 
 * @param {number} bytes - File size in bytes to format (must be non-negative number)
 * @param {Object} [options] - Formatting options with intelligent defaults
 * @param {string} [options.base='2'] - Base for calculation ('2' for binary/1024, '10' for decimal/1000)
 * @param {number} [options.round=1] - Decimal places for rounding precision
 * @param {string} [options.spacer=' '] - Spacer between number and unit for readability
 * @param {Array} [options.suffix=['B', 'KB', 'MB', 'GB', 'TB']] - Custom unit suffixes array
 * @returns {string} Formatted file size with appropriate unit (e.g., "1.5 MB", "230 B")
 * @throws Never throws - returns "0 B" for any invalid input to maintain application stability
 * 
 * @example
 * // Basic usage with defaults
 * formatFileSize(1024); // "1 KB"
 * formatFileSize(1048576); // "1 MB"
 * 
 * @example
 * // Custom formatting options
 * formatFileSize(1500000, {
 *   base: 10,        // Use decimal (1000) instead of binary (1024)
 *   round: 2,         // Two decimal places
 *   spacer: '',       // No space between number and unit
 *   suffix: ['B', 'kB', 'MB'] // Custom suffixes
 * }); // "1.5MB"
 * 
 * @example
 * // Large file sizes
 * formatFileSize(1073741824); // "1 GB"
 * formatFileSize(1099511627776); // "1 TB"
 * 
 * @example
 * // Error handling (though function never throws)
 * const result = formatFileSize(-100); // "0 B" with warning logged
 * const result = formatFileSize('invalid'); // "0 B" with warning logged
 */

import { filesize } from 'filesize';
import { 
  handleUtilityError, 
  validateNumber, 
  createDebugLogger 
} from '../helpers/index.js';

function formatFileSize(bytes: number, options: Record<string, any> = {}) {
  const debug = createDebugLogger('formatFileSize');
  
  // Validate input using centralized validation
  const validationResult = validateNumber(bytes, 'formatFileSize', 0, { 
    min: 0, 
    allowNaN: false 
  });
  
  if (!validationResult.isValid) {
    return validationResult.value;
  }
  
  const validatedBytes = validationResult.value;
  
  try {
    debug.start({ bytes: validatedBytes, options });

    // Default options for consistent output with original implementation
    const defaultOptions = {
      base: 2,        // Binary (1024) calculation
      round: 1,       // 1 decimal place
      spacer: ` `,    // Space between number and unit
      suffix: [`B`, `KB`, `MB`, `GB`, `TB`],
      standard: 'jedec'  // Use JEDEC standard (KB, MB, GB) instead of SI (KiB, MiB, GiB)
    };

    const finalOptions: any = { ...defaultOptions, ...options };

    // Handle zero bytes - filesize handles this but we maintain consistent logging
    if (validatedBytes === 0) {
      debug.step('zero bytes handling');
    }

    const result: any = filesize(validatedBytes, finalOptions);
    
    debug.success({ input: validatedBytes, output: result });
    return result;

  } catch (error) {
    return handleUtilityError(error, 'formatFileSize', { 
      bytes: validatedBytes,
      options 
    }, '0 B');
  }
}

export default formatFileSize;
/**
 * Format File Size in Human-Readable Units
 * 
 * Uses the filesize npm module which provides comprehensive file size formatting
 * with localization support, multiple output formats, and extensive testing.
 * 
 * @param {number} bytes - File size in bytes to format
 * @param {Object} [options] - Formatting options
 * @param {string} [options.base=`2`] - Base for calculation (`2` for binary, `10` for decimal)
 * @param {string} [options.round=1] - Decimal places for rounding
 * @param {string} [options.spacer=` `] - Spacer between number and unit
 * @param {Array} [options.suffix=[`B`, `KB`, `MB`, `GB`, `TB`]] - Custom suffixes
 * @returns {string} Formatted file size with appropriate unit (e.g., "1.5 MB", "230 B")
 * @throws Never throws - returns "0 B" for any invalid input
 */

import { filesize } from 'filesize';
import logger from '../../../logger.js';

function formatFileSize(bytes, options = {}) {
  logger.debug(`formatFileSize formatting file size`, { bytes, options });
  
  try {
    // Handle invalid inputs gracefully
    if (typeof bytes !== `number` || isNaN(bytes) || bytes < 0) {
      logger.warn(`formatFileSize received invalid bytes value`, { bytes });
      return `0 B`;
    }

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
    if (bytes === 0) {
      logger.debug(`formatFileSize: zero bytes`);
    }

    const result: any = filesize(bytes, finalOptions);
    
    logger.debug(`formatFileSize formatted successfully`, { input: bytes, output: result });
    return result;

  } catch (error) {
    logger.error(`formatFileSize failed with error`, { error: error.message, bytes });
    
    // Return safe fallback value
    return `0 B`;
  }
}

export default formatFileSize;
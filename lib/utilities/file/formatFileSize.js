/**
 * Format File Size in Human-Readable Units
 * 
 * RATIONALE: File sizes in bytes are difficult for users to interpret.
 * Converting to appropriate units (B, KB, MB, GB) with proper decimal precision
 * makes file size information accessible and meaningful for users.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use standard 1024-byte conversion factors for binary file sizes
 * - Select appropriate unit based on magnitude to avoid tiny decimals or huge numbers
 * - Round to 1 decimal place for readability while maintaining reasonable precision
 * - Handle edge cases like zero, negative, and non-numeric inputs gracefully
 * - Return formatted string with unit suffix for immediate display use
 * 
 * UNIT SELECTION LOGIC:
 * - Bytes (B): Less than 1 KB, displayed as whole numbers
 * - Kilobytes (KB): 1 KB to 999.9 KB 
 * - Megabytes (MB): 1 MB to 999.9 MB
 * - Gigabytes (GB): 1 GB and above
 * 
 * PRECISION HANDLING:
 * - Bytes shown as integers (no decimals needed)
 * - KB, MB, GB shown with 1 decimal place for useful precision
 * - Rounds rather than truncates for more accurate representation
 * 
 * ERROR HANDLING:
 * - Invalid inputs return "0 B" to provide safe fallback
 * - Negative values return "0 B" (file sizes can't be negative)
 * - Non-numeric inputs are handled gracefully without throwing
 * 
 * @param {number} bytes - File size in bytes to format
 * @returns {string} Formatted file size with appropriate unit (e.g., "1.5 MB", "230 B")
 * @throws Never throws - returns "0 B" for any invalid input
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

function formatFileSize(bytes) {
  logger.debug(`formatFileSize formatting file size`, { bytes });
  
  try {
    // Handle invalid inputs gracefully
    if (typeof bytes !== `number` || isNaN(bytes) || bytes < 0) {
      logger.warn(`formatFileSize received invalid bytes value`, { bytes });
      return `0 B`;
    }

    // Handle zero bytes
    if (bytes === 0) {
      logger.debug(`formatFileSize: zero bytes`);
      return `0 B`;
    }

    // Define conversion thresholds using binary (1024) factors
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;

    let result;

    if (bytes >= gigabyte) {
      // Format as gigabytes with 1 decimal place
      const gb = bytes / gigabyte;
      result = `${gb.toFixed(1)} GB`;
    } else if (bytes >= megabyte) {
      // Format as megabytes with 1 decimal place
      const mb = bytes / megabyte;
      result = `${mb.toFixed(1)} MB`;
    } else if (bytes >= kilobyte) {
      // Format as kilobytes with 1 decimal place
      const kb = bytes / kilobyte;
      result = `${kb.toFixed(1)} KB`;
    } else {
      // Format as bytes (whole numbers only)
      result = `${bytes} B`;
    }

    
    logger.debug(`formatFileSize formatted successfully`, { input: bytes, output: result });
    return result;

  } catch (error) {
    
    qerrors(error, `formatFileSize`, { bytes });
    logger.error(`formatFileSize failed with error`, { error: error.message, bytes });
    
    // Return safe fallback value
    return `0 B`;
  }
}

module.exports = formatFileSize;
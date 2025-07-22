/**
 * File Utilities Module
 * 
 * RATIONALE: File operations and formatting are common requirements in Node.js
 * applications, particularly for file upload handling, storage management, and
 * user interface display. This module provides centralized file utility functions
 * with consistent formatting and error handling.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use binary (1024) rather than decimal (1000) for file size calculations
 * - Provide human-readable output suitable for user interfaces
 * - Handle edge cases like zero bytes and invalid inputs gracefully
 * - Follow standard conventions for file size unit abbreviations
 * - Maintain precision with decimal places for smaller files
 * 
 * SECURITY CONSIDERATIONS:
 * - Input validation to prevent unexpected data types
 * - Safe defaults for invalid or missing input
 * - Error logging for debugging and monitoring
 */

const { qerrors } = require('qerrors');

/**
 * Format file size in bytes to human-readable string with appropriate units
 * 
 * RATIONALE: Raw byte counts are difficult for users to interpret. Converting
 * to standard units (KB, MB, GB) with appropriate precision makes file sizes
 * immediately understandable in user interfaces and logging output.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use binary calculation (1024 bytes = 1 KB) following computing standards
 * - Automatically select appropriate unit based on size magnitude
 * - Maintain 2 decimal places for precision while keeping output readable
 * - Handle edge cases: zero bytes, negative values, non-numeric input
 * - Support up to GB range which covers most application file size needs
 * 
 * UNIT SELECTION LOGIC:
 * - 0-1023 bytes: Display as "Bytes"
 * - 1024-1048575 bytes: Display as "KB" (kilobytes)
 * - 1048576-1073741823 bytes: Display as "MB" (megabytes)  
 * - 1073741824+ bytes: Display as "GB" (gigabytes)
 * 
 * PRECISION HANDLING:
 * - Use parseFloat() to remove trailing zeros from decimal places
 * - toFixed(2) ensures consistent decimal formatting
 * - Results like "1.50 MB" become "1.5 MB" for cleaner display
 * 
 * @param {number} bytes - File size in bytes (must be non-negative integer)
 * @returns {string} Formatted file size with appropriate unit
 *                  - "0 Bytes" for zero input
 *                  - "Invalid file size" for negative or non-numeric input
 *                  - Properly formatted string with unit (e.g., "1.5 KB", "2.34 MB")
 * 
 * USAGE EXAMPLES:
 * formatFileSize(0)          // Returns "0 Bytes"
 * formatFileSize(1024)       // Returns "1 KB"
 * formatFileSize(1536)       // Returns "1.5 KB"
 * formatFileSize(2097152)    // Returns "2 MB"
 * formatFileSize(5368709120) // Returns "5 GB"
 * formatFileSize(-100)       // Returns "Invalid file size"
 * formatFileSize("invalid")  // Returns "Invalid file size"
 */
function formatFileSize(bytes) {
  // Input validation and error handling
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0 || !isFinite(bytes)) {
    qerrors(new Error('Invalid input provided to formatFileSize'), 'formatFileSize', {
      inputType: typeof bytes,
      inputValue: bytes,
      isNaN: isNaN(bytes),
      isFinite: isFinite(bytes)
    });
    return 'Invalid file size';
  }

  // Handle zero bytes edge case
  if (bytes === 0) {
    return '0 Bytes';
  }

  // Define conversion factor and unit labels
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  // Calculate appropriate unit index using logarithmic scaling
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Ensure we don't exceed our supported unit array
  const unitIndex = Math.min(i, sizes.length - 1);
  
  // Calculate the formatted value
  const value = bytes / Math.pow(k, unitIndex);
  
  // Format with 2 decimal places and remove trailing zeros
  const formattedValue = parseFloat(value.toFixed(2));
  
  return `${formattedValue} ${sizes[unitIndex]}`;
}

module.exports = {
  formatFileSize
};
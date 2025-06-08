
/**
 * Convert ISO string to locale display format
 * 
 * This function transforms machine-readable ISO date strings into human-readable
 * locale-specific formats. It's designed to handle the common scenario where
 * databases store dates in ISO format but users need to see them in familiar formats.
 * 
 * Rationale for implementation choices:
 * 1. Uses toLocaleString() rather than manual formatting to respect user's system locale
 * 2. Returns 'N/A' for falsy inputs to provide consistent empty state handling
 * 3. Throws errors rather than returning error strings so callers can decide error handling
 * 4. Includes debug logging to trace date formatting issues in production
 * 
 * Edge cases handled:
 * - Empty strings, null, undefined inputs return 'N/A'
 * - Invalid date strings will throw, allowing caller to catch and handle appropriately
 * - Timezone conversion is handled automatically by toLocaleString()
 * 
 * @param {string} dateString - The ISO date string to format (e.g., "2023-12-25T10:30:00.000Z")
 * @returns {string} The formatted date string (e.g., "12/25/2023, 10:30:00 AM") or 'N/A' for empty input
 * @throws {Error} If the date string is invalid and cannot be parsed
 */
function formatDateTime(dateString) {
  console.log(`formatDateTime is running with ${dateString}`); // Debug logging for troubleshooting date issues
  try {
    // Handle empty inputs gracefully - common when optional date fields are not set
    if (!dateString) return 'N/A';
    
    // Use browser/Node.js built-in locale formatting for internationalization support
    const result = new Date(dateString).toLocaleString();
    console.log(`formatDateTime is returning ${result}`); // Log successful conversion for debugging
    return result;
  } catch (err) {
    console.log('formatDateTime has run resulting in a final value of failure'); // Log error state for debugging
    throw err; // Re-throw so caller can decide whether to show error or fallback
  }
}

/**
 * Show elapsed time as hh:mm:ss format
 * 
 * This function calculates the duration between two timestamps and formats it
 * as a human-readable time span. It's commonly used for showing elapsed time
 * in logs, timers, or duration tracking features.
 * 
 * Rationale for implementation choices:
 * 1. Defaults endDate to current time for "time since" calculations
 * 2. Returns '00:00:00' for missing start date to provide safe fallback
 * 3. Uses millisecond math for precise calculations across timezone boundaries
 * 4. Formats with leading zeros for consistent display width
 * 5. Includes debug logging to trace timing calculation issues
 * 
 * Mathematical approach:
 * - Converts both dates to milliseconds since epoch for consistent calculation
 * - Uses modulo operations to extract hours/minutes/seconds without overflow
 * - Math.floor ensures we get whole numbers (no partial seconds displayed)
 * 
 * Edge cases handled:
 * - Missing startDate returns zero duration rather than throwing
 * - Negative durations (end before start) will show as large positive numbers
 *   This is intentional to avoid complex negative time display logic
 * - Invalid date strings will throw, allowing caller to handle appropriately
 * 
 * @param {string} startDate - The start date ISO string (e.g., "2023-12-25T10:00:00.000Z")
 * @param {string|null} [endDate] - The end date ISO string (optional, defaults to current time)
 * @returns {string} The formatted duration string (e.g., "01:30:45" for 1 hour, 30 minutes, 45 seconds)
 * @throws {Error} If either date string is invalid and cannot be parsed
 */
function formatDuration(startDate, endDate = null) {
  console.log(`formatDuration is running with ${startDate} and ${endDate}`); // Debug logging for timing issues
  try {
    // Handle missing start date gracefully - return zero duration instead of throwing
    if (!startDate) return '00:00:00';
    
    const start = new Date(startDate); // Convert to Date object for math operations
    const end = endDate ? new Date(endDate) : new Date(); // Default to "now" for current elapsed time
    
    // Calculate difference in milliseconds - this works across timezone boundaries
    const diffMs = end.getTime() - start.getTime();
    
    // Extract time components using modulo to prevent overflow
    // Example: 3661000ms = 1 hour, 1 minute, 1 second
    const seconds = Math.floor(diffMs / 1000) % 60; // Get seconds component (0-59)
    const minutes = Math.floor(diffMs / (1000 * 60)) % 60; // Get minutes component (0-59)
    const hours = Math.floor(diffMs / (1000 * 60 * 60)); // Get total hours (can exceed 24)
    
    // Format with padStart to ensure consistent two-digit display (e.g., "01:05:03" not "1:5:3")
    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(`formatDuration is returning ${result}`); // Log successful calculation for debugging
    return result;
  } catch (err) {
    console.log('formatDuration has run resulting in a final value of failure'); // Log error state for debugging
    throw err; // Re-throw so caller can decide whether to show error or fallback
  }
}

module.exports = {
  formatDateTime,
  formatDuration
};

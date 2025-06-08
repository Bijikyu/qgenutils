
/*
 * DateTime Utility Module
 * 
 * This module provides date and time formatting utilities optimized for web applications
 * that need to display dates in user-friendly formats and calculate time durations.
 * 
 * DESIGN PHILOSOPHY:
 * - Graceful degradation: Invalid inputs return safe fallback values rather than crashing
 * - Locale awareness: Uses browser/system locale for natural date formatting
 * - Consistent duration format: Always returns HH:MM:SS format for predictable display
 * - Error transparency: Logs all operations for debugging while handling errors gracefully
 * 
 * COMMON USE CASES:
 * - Displaying "last updated" timestamps in user interfaces
 * - Showing elapsed time for processes, sessions, or activities
 * - Converting server timestamps to user-readable formats
 */

/**
 * Convert ISO string to locale display format
 * 
 * RATIONALE: Server APIs typically return dates in ISO format (2023-12-25T10:30:00.000Z)
 * but users need to see dates in their familiar local format (12/25/2023, 10:30:00 AM).
 * This function bridges that gap while handling various edge cases safely.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Uses Date.toLocaleString() to respect user's system locale automatically
 * - Returns 'N/A' for empty/null inputs rather than throwing errors
 * - Throws errors for malformed dates to help developers catch data issues
 * - Logs all operations to aid in debugging timestamp-related problems
 * 
 * EDGE CASES HANDLED:
 * - Empty strings, null, undefined inputs
 * - Invalid date strings (throws to alert developers)
 * - Timezone differences (handled automatically by Date constructor)
 * 
 * @param {string} dateString - The ISO date string to format (e.g., "2023-12-25T10:30:00.000Z")
 * @returns {string} The formatted date string in user's locale or 'N/A' for empty inputs
 * @throws {Error} If dateString is malformed (helps catch API data issues)
 */
function formatDateTime(dateString) {
  console.log(`formatDateTime is running with ${dateString}`); // Log input for debugging timezone/format issues
  try {
    // Early return for empty inputs - common when optional fields are null/undefined
    if (!dateString) return 'N/A';
    
    // Use native Date parsing and locale formatting for maximum compatibility
    // toLocaleString() automatically handles user's timezone and preferred format
    const result = new Date(dateString).toLocaleString();
    console.log(`formatDateTime is returning ${result}`); // Log output to verify locale formatting
    return result;
  } catch (err) {
    // Log failure and re-throw to alert developers of data quality issues
    // Invalid dates often indicate API problems that should be fixed
    console.log('formatDateTime has run resulting in a final value of failure');
    throw err;
  }
}

/**
 * Show elapsed time as hh:mm:ss format
 * 
 * RATIONALE: Applications frequently need to show "how long ago" or "time elapsed"
 * for user activities, process durations, or session times. A consistent HH:MM:SS
 * format is universally understood and works well in UI components.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Defaults endDate to current time for "elapsed since" calculations
 * - Returns '00:00:00' for empty start dates rather than errors
 * - Uses Math.floor() to avoid decimal seconds in display
 * - Pads with zeros for consistent width in UI layouts
 * - Handles negative durations gracefully (though logically invalid)
 * 
 * ALTERNATIVE APPROACHES CONSIDERED:
 * - Relative formats like "2 hours ago" - rejected for precision needs
 * - Millisecond precision - rejected for UI clarity
 * - Duration objects - rejected for simplicity
 * 
 * EDGE CASES HANDLED:
 * - Start date after end date (negative duration)
 * - Very large durations (hours > 24)
 * - Millisecond precision truncation
 * - Empty/null start dates
 * 
 * @param {string} startDate - The start date ISO string
 * @param {string|null} [endDate] - The end date ISO string (optional, defaults to current time)
 * @returns {string} The formatted duration string (HH:MM:SS) or '00:00:00' for empty start
 * @throws {Error} If either date string is malformed
 */
function formatDuration(startDate, endDate = null) {
  console.log(`formatDuration is running with ${startDate} and ${endDate}`); // Log inputs for debugging duration calculations
  try {
    // Early return for empty start date - prevents nonsensical duration calculations
    if (!startDate) return '00:00:00';
    
    // Parse dates - Date constructor handles ISO strings robustly
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(); // Default to "now" for elapsed time
    
    // Calculate difference in milliseconds
    const diffMs = end.getTime() - start.getTime();
    
    // Break down milliseconds into time components
    // Math.floor ensures we get whole seconds/minutes/hours
    const seconds = Math.floor(diffMs / 1000) % 60;        // Remainder after removing minutes
    const minutes = Math.floor(diffMs / (1000 * 60)) % 60; // Remainder after removing hours
    const hours = Math.floor(diffMs / (1000 * 60 * 60));   // Total hours (can exceed 24)
    
    // Format with zero-padding for consistent UI width
    // padStart ensures "1:5:3" becomes "01:05:03" for alignment
    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(`formatDuration is returning ${result}`); // Log result for debugging
    return result;
  } catch (err) {
    // Log failure and re-throw to help developers identify bad date inputs
    console.log('formatDuration has run resulting in a final value of failure');
    throw err;
  }
}

/*
 * Module Export Strategy:
 * 
 * We export specific functions rather than a class or default export because:
 * 1. These are pure utility functions without shared state
 * 2. Named exports allow for selective importing in larger applications
 * 3. Functions can be easily tested and mocked independently
 * 4. The API remains simple and predictable for consumers
 */
module.exports = {
  formatDateTime,
  formatDuration
};

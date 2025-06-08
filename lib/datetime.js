
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
    /*
 * Date and Time Utility Module
 * 
 * This module provides date and time formatting utilities for applications that
 * need to display dates in user-friendly formats and calculate time durations.
 * 
 * DESIGN PHILOSOPHY:
 * - User-friendly output: Format dates for human readability, not machine processing
 * - Graceful error handling: Return sensible defaults rather than crashing
 * - Locale awareness: Use browser/system locale for date formatting
 * - Consistent duration format: Always return HH:MM:SS format for predictability
 * 
 * COMMON USE CASES:
 * - Displaying timestamps in user interfaces
 * - Showing elapsed time for processes or events
 * - Formatting API response dates for frontend consumption
 * - Creating readable log timestamps
 */

const { qerrors } = require('qerrors');

/**
 * Format an ISO date string to locale-specific display format
 * 
 * RATIONALE: APIs typically return dates in ISO format (2023-12-25T10:30:00.000Z)
 * which is machine-readable but not user-friendly. This function converts ISO
 * dates to formats that users expect to see in interfaces.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use toLocaleString() for automatic locale adaptation
 * - Return "N/A" for empty/invalid inputs rather than throwing errors
 * - Handle both null and empty string inputs gracefully
 * - Preserve timezone information from the original date
 * 
 * LOCALE BEHAVIOR:
 * toLocaleString() automatically formats dates according to the user's system
 * locale settings. For example:
 * - US format: "12/25/2023, 10:30:00 AM"
 * - European format: "25/12/2023, 10:30:00"
 * - ISO format in some locales: "2023-12-25, 10:30:00"
 * 
 * This automatic adaptation improves user experience by showing dates in
 * formats users are familiar with.
 * 
 * ERROR HANDLING STRATEGY:
 * Rather than throwing exceptions for invalid dates, we return "N/A" to
 * indicate missing or invalid data. This prevents date formatting errors
 * from breaking entire page renders or API responses.
 * 
 * @param {string} dateString - ISO date string to format (e.g., "2023-12-25T10:30:00.000Z")
 * @returns {string} Formatted date string or "N/A" if input is invalid/empty
 */
function formatDateTime(dateString) {
  console.log(`formatDateTime is running with ${dateString}`); // Log input for debugging date processing
  try {
    // Handle empty or null input gracefully - common in optional date fields
    if (!dateString) {
      console.log(`formatDateTime is returning N/A`); // Log fallback for empty input
      return 'N/A'; // User-friendly indicator for missing dates
    }
    
    // Convert ISO string to Date object and format according to user's locale
    // Date constructor can handle various ISO formats automatically
    const formatted = new Date(dateString).toLocaleString();
    console.log(`formatDateTime is returning ${formatted}`); // Log successful formatting
    return formatted;
  } catch (err) {
    // Handle invalid date strings that can't be parsed
    qerrors(err, 'formatDateTime', dateString); // Log parsing error with input context
    return 'N/A'; // Fallback to indicate invalid date data
  }
}

/**
 * Calculate and format duration between two dates in HH:MM:SS format
 * 
 * RATIONALE: Duration calculation is common for showing elapsed time, process
 * durations, or time differences. This function provides consistent formatting
 * that's easy to read and compare across different time ranges.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use current time as default end date for "time since" scenarios
 * - Calculate millisecond difference and convert to time components
 * - Always return HH:MM:SS format with zero-padding for consistency
 * - Handle edge cases like negative durations or invalid dates
 * 
 * TIME CALCULATION PROCESS:
 * 1. Parse both dates to milliseconds since epoch
 * 2. Calculate absolute difference in milliseconds
 * 3. Convert to hours, minutes, seconds using modular arithmetic
 * 4. Format with zero-padding for consistent display width
 * 
 * USE CASES:
 * - Process execution time: formatDuration(processStart)
 * - Event duration: formatDuration(eventStart, eventEnd)
 * - Time tracking: formatDuration(sessionStart)
 * - Log analysis: formatDuration(requestStart, requestEnd)
 * 
 * ZERO-PADDING RATIONALE:
 * Consistent formatting (01:05:03 vs 1:5:3) makes durations easier to:
 * - Visually compare and sort
 * - Align in tables and lists
 * - Parse programmatically if needed
 * 
 * @param {string} startDate - ISO date string for start time
 * @param {string} endDate - ISO date string for end time (defaults to current time)
 * @returns {string} Duration in HH:MM:SS format or "00:00:00" if start date is invalid
 */
function formatDuration(startDate, endDate) {
  console.log(`formatDuration is running with ${startDate} and ${endDate}`); // Log inputs for debugging duration calculations
  try {
    // Handle empty start date - return zero duration rather than error
    if (!startDate) {
      console.log(`formatDuration is returning 00:00:00`); // Log zero duration for empty input
      return '00:00:00'; // Indicates no measurable duration
    }
    
    // Use current time if no end date provided (common "time since" pattern)
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(startDate);
    
    // Calculate absolute difference in milliseconds
    // Math.abs() handles cases where end might be before start
    const diffMs = Math.abs(end - start);
    
    // Convert milliseconds to time components using standard time conversion
    const hours = Math.floor(diffMs / (1000 * 60 * 60)); // 3600000 ms per hour
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000); // Remaining seconds
    
    // Format with zero-padding for consistent display (padStart ensures 2 digits)
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(`formatDuration is returning ${formatted}`); // Log formatted result
    return formatted;
  } catch (err) {
    // Handle invalid date strings or calculation errors
    qerrors(err, 'formatDuration', { startDate, endDate }); // Log error with both input dates
    console.log('formatDuration has run resulting in a final value of failure'); // Log error condition
    throw err; // Re-throw to let caller handle date parsing errors appropriately
  }
}

/*
 * Module Export Strategy:
 * 
 * We export both date/time functions because they serve complementary purposes:
 * 
 * 1. formatDateTime - Convert timestamps to human-readable format
 * 2. formatDuration - Calculate and display time differences
 * 
 * Both functions are commonly needed together in applications that display
 * time-based information (logs, events, processes, etc.).
 * 
 * FUTURE ENHANCEMENTS:
 * - Add relative time formatting ("2 hours ago", "in 3 days")
 * - Add custom date format options
 * - Add timezone conversion utilities
 * - Add business day/hour calculations
 * - Add internationalization support for duration labels
 */
module.exports = {
  formatDateTime,
  formatDuration
};

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

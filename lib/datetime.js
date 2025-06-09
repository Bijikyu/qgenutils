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

const { qerrors } = require('qerrors');

/**
 * Helper function to validate if a Date object is valid
 * This centralizes the date validation logic used by multiple datetime functions
 * 
 * @param {Date} date - Date object to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
function isValidDate(date) {
  return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date'; // ensures constructed date is valid
}

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
  console.log(`formatDateTime is running with ${dateString}`); // record the raw input date value
  try {
    // Handle empty or null input gracefully - common in optional date fields
    if (!dateString) {
      console.log(`formatDateTime is returning N/A`); // show fallback when nothing provided
      return 'N/A'; // signal missing dates in UI-friendly way
    }

    // Convert ISO string to Date object and format according to user's locale
    // Date constructor can handle various ISO formats automatically
    const date = new Date(dateString); // rely on Date constructor for parsing

    // Handle invalid date strings using centralized validation
    if (!isValidDate(date)) {
      console.log(`formatDateTime is returning N/A`); // invalid date encountered
      return 'N/A'; // maintain consistent fallback
    }
    const formatted = date.toLocaleString(); // convert date into locale-specific string
    console.log(`formatDateTime is returning ${formatted}`); // output resulting formatted string
    return formatted; // provide formatted string back to caller
  } catch (err) {
    // Handle invalid date strings that can't be parsed
    qerrors(err, 'formatDateTime', dateString); // log parsing failure for monitoring
    return 'N/A'; // maintain consistent fallback on error
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
 * @param {string} startDateString - ISO date string for start time
 * @param {string} endDateString - ISO date string for end time (defaults to current time)
 * @returns {string} Duration in HH:MM:SS format or "00:00:00" if start date is invalid
 */
function formatDuration(startDateString, endDateString) {
  console.log(`formatDuration is running with ${startDateString} and ${endDateString}`); // record start and end timestamps
  try {
    // Handle edge cases gracefully
    if (!startDateString || startDateString === '') {
      console.log(`formatDuration is returning 00:00:00`); // start missing so duration is zero
      return '00:00:00'; // indicate no elapsed time
    }

    // Validate start date using centralized validation
    const startDate = new Date(startDateString); // parse start timestamp
    if (!isValidDate(startDate)) {
      throw new Error('Invalid start date');
    }

    // Calculate end time (current time if not provided)
    const endTime = endDateString ? new Date(endDateString) : new Date(); // default end to now

    // Validate end date if provided using centralized validation
    if (endDateString && !isValidDate(endTime)) {
      throw new Error('Invalid end date'); // let caller know the provided end date is bad
    }

    // Calculate duration in milliseconds and convert to absolute value
    const durationMs = Math.abs(endTime - startDate); // total milliseconds difference

    // Convert milliseconds to time components using standard time conversion
    const hours = Math.floor(durationMs / (1000 * 60 * 60)); // derive hours component
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)); // derive remaining minutes
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000); // derive remaining seconds

    // Format with zero-padding for consistent display (padStart ensures 2 digits)
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // ensure 2-digit parts
    console.log(`formatDuration is returning ${formatted}`); // show final human friendly duration
    return formatted; // deliver formatted duration
  } catch (err) {
    // Handle invalid date strings or calculation errors
    qerrors(err, 'formatDuration', { startDateString, endDateString }); // capture failure details
    console.log('formatDuration has run resulting in a final value of failure'); // flag an error path
    throw err; // propagate error to caller for handling
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
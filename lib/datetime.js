/*
 * DateTime Utility Module
 *
 * OVERVIEW: These utilities rely on JavaScript's native Date APIs for broad compatibility
 * and minimal dependencies. Locale awareness is baked in via methods like toLocaleString(),
 * allowing dates to automatically render according to each user's system preferences.
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

const { qerrors } = require('qerrors'); // error logging utility
const logger = require('./logger'); // structured logger
/**
 * Helper function to validate if a Date object is valid
 * This centralizes the date validation logic used by multiple datetime functions
 * Invalid inputs resolve to `false` so callers can return safe fallback values
 * like "N/A" or "00:00:00" rather than throwing errors.
 *
 * @param {Date} date - Date object to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
function isValidDate(date) {
  return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date'; // treat NaN or Invalid Date as bad input
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
  console.log(`formatDateTime is running with ${dateString}`); // debug input
  logger.debug(`formatDateTime is running with ${dateString}`); // persistent log
  try {
    // Handle empty or null input gracefully - common in optional date fields
    // Returning "N/A" allows the UI to show a neutral value without crashing
    if (!dateString) { // short-circuit when input missing or blank
      console.log(`formatDateTime is returning N/A`); logger.debug(`formatDateTime is returning N/A`); // return neutral value
      return 'N/A'; // return neutral value so UIs know no date was provided
    }

    // Convert ISO string to Date object and format according to user's locale
    // Date constructor can handle various ISO formats automatically
    const date = new Date(dateString); // parse ISO string into Date for conversion

    // Handle invalid date strings using centralized validation
    if (!isValidDate(date)) { // reject invalid dates to avoid misleading output
      console.log(`formatDateTime is returning N/A`); logger.debug(`formatDateTime is returning N/A`);
      return 'N/A'; // invalid date fallback prevents NaN in output
    }
    const formatted = date.toLocaleString(); // locale aware formatting for display
    console.log(`formatDateTime is returning ${formatted}`); logger.debug(`formatDateTime is returning ${formatted}`);
    return formatted; // send formatted date back to caller
  } catch (err) {
    // Handle invalid date strings that can't be parsed
    qerrors(err, 'formatDateTime', dateString); // Log parsing error with input context
    logger.error(`formatDateTime failed`, err); // record failure
    return 'N/A'; // final fallback keeps consumer code simple on failure
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
 *
 * INVALID INPUT POLICY:
 * Empty or malformed start dates return "00:00:00" so downstream logic never
 * receives NaN values. Invalid end dates throw so the caller can decide whether
 * to default to "now" or surface an error.
*/
function formatDuration(startDateString, endDateString) {
  console.log(`formatDuration is running with ${startDateString} and ${endDateString}`); logger.debug(`formatDuration is running with ${startDateString} and ${endDateString}`);
  try {
    // Handle edge cases gracefully
    // Empty start date yields zero duration so UIs show neutral value
    if (!startDateString || startDateString === '') { // guard against missing start time
      console.log(`formatDuration is returning 00:00:00`); logger.debug(`formatDuration is returning 00:00:00`);
      return '00:00:00';
    }

    // Validate start date using centralized validation
    const startDate = new Date(startDateString); // parse provided start time
    if (!isValidDate(startDate)) {
      throw new Error('Invalid start date');
    }

    // Calculate end time (current time if not provided)
    const endTime = endDateString ? new Date(endDateString) : new Date(); // default to now if end omitted

    // Validate end date if provided using centralized validation
    if (endDateString && !isValidDate(endTime)) { // check provided end date only when set
      throw new Error('Invalid end date');
    }

    // Calculate duration in milliseconds and convert to absolute value
    const durationMs = Math.abs(endTime - startDate); // use Math.abs so negative differences show as positive time intervals

    // Convert milliseconds to time components using standard time conversion
    const hours = Math.floor(durationMs / (1000 * 60 * 60)); // 1000ms*60s*60m = 1hr
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)); // remainder from hours to minutes
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000); // remainder from minutes to seconds

    // Format with zero-padding for consistent display (padStart ensures 2 digits)
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // pad for readability
    console.log(`formatDuration is returning ${formatted}`); logger.debug(`formatDuration is returning ${formatted}`);
    return formatted; // return the duration string
  } catch (err) {
    // Handle invalid date strings or calculation errors and re-throw
    logger.error(`formatDuration failed`, err); qerrors(err, 'formatDuration', { startDateString, endDateString });
    throw err; // let caller decide how to report invalid dates
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
  formatDateTime, // export for date display
  formatDuration // export for duration display
}; // expose utilities for consumption

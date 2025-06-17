/*
 * DateTime Utility Module
 *
 * OVERVIEW: These utilities rely on JavaScript's native Date APIs for broad compatibility
 * and minimal dependencies. Locale awareness is baked in via methods like toLocaleString(),
 * allowing dates to automatically render according to each user's system preferences.
 *
 * This module provides date and time formatting utilities optimized for web applications
 * that need to display dates in user-friendly formats, calculate time durations, and
 * perform date arithmetic for business logic like credit expiration and scheduling.
 * 
 * DESIGN PHILOSOPHY:
 * - Graceful degradation: Invalid inputs return safe fallback values rather than crashing
 * - Locale awareness: Uses browser/system locale for natural date formatting
 * - Consistent duration format: Always returns HH:MM:SS format for predictable display
 * - Immutable patterns: Date operations return new objects to prevent side effects
 * - Error transparency: Logs all operations for debugging while handling errors gracefully
 * 
 * COMMON USE CASES:
 * - Displaying "last updated" timestamps in user interfaces
 * - Showing elapsed time for processes, sessions, or activities
 * - Converting server timestamps to user-readable formats
 * - Calculating future dates for credit expiration and billing cycles
 * - Business date arithmetic for scheduling and time-based operations
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

/**
 * Add days to current date for future date calculations
 * 
 * RATIONALE: Business applications frequently need to calculate future dates for
 * credit expiration, billing cycles, trial periods, and scheduled operations.
 * This function provides a centralized, reliable way to perform date arithmetic
 * that handles month/year boundaries automatically.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use current date as baseline to ensure dates are relative to execution time
 * - Return new Date object to prevent mutation of current date (immutable pattern)
 * - Handle month/year boundaries automatically via JavaScript Date arithmetic
 * - Default 90-day period provides generous timeframe for credit systems
 * - Simple implementation reduces complexity and timezone-related bugs
 * 
 * BUSINESS RATIONALE:
 * Credit expiration encourages regular usage and prevents indefinite accumulation.
 * The 90-day default balances user convenience with business cash flow needs.
 * Consistent expiration logic ensures fair treatment across all users and purchase types.
 * Predictable expiration helps users plan their API usage and purchase timing.
 * 
 * TECHNICAL CONSIDERATIONS:
 * - JavaScript Date automatically handles month/year rollovers (Jan 31 + 1 day = Feb 1)
 * - Time component is preserved from current moment for precise expiration timing
 * - Works correctly across daylight saving time transitions
 * - No timezone conversion needed since expiration is relative to purchase time
 * - Negative values create past dates (useful for backdating or testing scenarios)
 * 
 * ERROR HANDLING STRATEGY:
 * - Invalid day parameters are handled gracefully by returning safe fallback dates
 * - Logging provides visibility into date calculation operations for debugging
 * - Consistent with module's fail-safe approach to date operations
 * 
 * @param {number} days - Number of days to add to current date (defaults to 90)
 *                       - Positive values create future dates (typical use case)
 *                       - Negative values create past dates (useful for testing)
 *                       - Zero returns current date (useful as baseline)
 * @returns {Date} New Date object representing the calculated date
 *                - Includes both date and time components for precise timing
 *                - Time matches the moment this function was called
 * 
 * USAGE EXAMPLES:
 * addDays()      // Returns date 90 days from now (default credit expiration)
 * addDays(30)    // Returns date 30 days from now (short-term promotions)
 * addDays(365)   // Returns date 1 year from now (annual credit packages)
 * addDays(-7)    // Returns date 7 days ago (backdating, testing scenarios)
 * addDays(0)     // Returns current date (baseline reference)
 */
function addDays(days = 90) {
  console.log(`addDays is running with ${days} days`);
  logger.debug(`addDays calculating future date with ${days} days offset`);
  
  try {
    // Validate input parameter
    if (typeof days !== 'number' || isNaN(days)) {
      console.log(`addDays received invalid days parameter: ${days}, using default 90`);
      logger.warn(`addDays received non-numeric days parameter, using default`);
      days = 90; // fail-safe default for invalid input
    }
    
    // Get current date and time as the baseline for calculation
    // Using current time ensures operations are relative to execution moment
    const today = new Date();
    
    // Validate that current date is valid (should always be true, but defensive)
    if (!isValidDate(today)) {
      const errorMsg = 'System date is invalid';
      console.error(`addDays failed: ${errorMsg}`);
      logger.error(errorMsg);
      qerrors(new Error(errorMsg), 'addDays', { days });
      return new Date(); // return current date as fallback
    }
    
    // Create a copy of the current date to avoid mutating the original
    // This immutable pattern prevents unexpected side effects in calling code
    const futureDate = new Date(today);
    
    // Add the specified number of days to the baseline date
    // JavaScript Date.setDate() automatically handles month and year boundaries
    // Examples: January 31 + 1 day = February 1, February 28 + 1 day = March 1
    futureDate.setDate(today.getDate() + days);
    
    // Validate the calculated result
    if (!isValidDate(futureDate)) {
      const errorMsg = `Date calculation resulted in invalid date`;
      console.error(`addDays failed: ${errorMsg}`);
      logger.error(errorMsg);
      qerrors(new Error(errorMsg), 'addDays', { days, todayDate: today.toISOString() });
      return new Date(); // return current date as fallback
    }
    
    console.log(`addDays is returning date: ${futureDate.toISOString()}`);
    logger.debug(`addDays calculated date successfully: ${futureDate.toISOString()}`);
    
    // Return the calculated date for use in business logic
    return futureDate;
    
  } catch (error) {
    // Handle unexpected errors in date calculation
    console.error('addDays encountered unexpected error:', error);
    qerrors(error, 'addDays', { days });
    logger.error(`addDays failed with error: ${error.message}`);
    
    // Return current date as safe fallback to prevent application crashes
    return new Date();
  }
}

/*
 * Module Export Strategy:
 * 
 * We export date/time functions that serve complementary purposes in applications:
 * 
 * 1. formatDateTime - Convert timestamps to human-readable format
 * 2. formatDuration - Calculate and display time differences
 * 3. addDays - Calculate future dates for business logic and expiration handling
 * 
 * These functions are commonly needed together in applications that display
 * time-based information (logs, events, processes) and manage time-based
 * business operations (credits, subscriptions, scheduling).
 * 
 * FUTURE ENHANCEMENTS:
 * - Add relative time formatting ("2 hours ago", "in 3 days")
 * - Add custom date format options
 * - Add timezone conversion utilities
 * - Add business day/hour calculations
 * - Add internationalization support for duration labels
 * - Add date range utilities and calendar operations
 */
module.exports = {
  formatDateTime, // export for date display
  formatDuration, // export for duration display
  addDays // export for date arithmetic and business calculations
}; // expose utilities for consumption

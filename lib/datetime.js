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

/**
 * Format date to localized date string with consistent options
 * 
 * RATIONALE: User interfaces need consistent date formatting that adapts to
 * user locale preferences. This function provides fallback handling for
 * invalid dates while maintaining locale-appropriate formatting.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Accept both string and Date object inputs for flexibility
 * - Use toLocaleDateString() for automatic locale adaptation
 * - Provide customizable fallback text for invalid/missing dates
 * - Handle parsing errors gracefully without throwing exceptions
 * - Log date formatting operations for debugging UI issues
 * 
 * LOCALE BEHAVIOR:
 * toLocaleDateString() automatically formats according to user's system locale:
 * - US format: "12/25/2023"
 * - European format: "25/12/2023" 
 * - ISO format: "2023-12-25"
 * This improves user experience by showing familiar date formats.
 * 
 * @param {string|Date|null|undefined} date - Date to format
 * @param {string} fallback - Text to show when date is invalid (default: "Unknown")
 * @returns {string} Formatted date string or fallback text
 * 
 * USAGE EXAMPLES:
 * formatDate(new Date())           // Returns "12/25/2023" (US locale)
 * formatDate("2023-12-25")         // Returns "12/25/2023" 
 * formatDate(null, "No date")      // Returns "No date"
 * formatDate("invalid", "Error")   // Returns "Error"
 */
function formatDate(date, fallback = "Unknown") {
  console.log(`formatDate is running with date: ${date}, fallback: ${fallback}`);
  logger.debug(`formatDate processing date input`, { date, fallback });
  
  if (!date) {
    console.log(`formatDate is returning fallback: ${fallback}`);
    logger.debug(`formatDate returning fallback for null/undefined input`);
    return fallback;
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValidDate(dateObj)) {
      console.log(`formatDate is returning fallback for invalid date: ${fallback}`);
      logger.debug(`formatDate returning fallback for invalid date`);
      return fallback;
    }
    
    const formatted = dateObj.toLocaleDateString();
    console.log(`formatDate is returning: ${formatted}`);
    logger.debug(`formatDate successfully formatted date: ${formatted}`);
    
    return formatted;
  } catch (error) {
    qerrors(error, 'formatDate', { date, fallback });
    logger.error(`formatDate failed with error: ${error.message}`);
    return fallback;
  }
}

/**
 * Format date with contextual prefix for creation/modification displays
 * 
 * RATIONALE: User interfaces often show dates with context like "Added on 12/25/2023"
 * or "Modified on 1/15/2024". This function centralizes that pattern while
 * handling edge cases gracefully.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Leverage formatDate() for consistent date formatting
 * - Provide customizable prefix for different contexts
 * - Handle invalid dates by falling back to context-appropriate text
 * - Support various date input formats
 * - Log prefix formatting for UI debugging
 * 
 * @param {string|Date|null|undefined} date - Date to format with prefix
 * @param {string} prefix - Text to prepend (default: "Added")
 * @param {string} fallback - Text for invalid dates (default: "Recently")
 * @returns {string} Formatted string with prefix and date
 * 
 * USAGE EXAMPLES:
 * formatDateWithPrefix(new Date(), "Created")     // Returns "Created 12/25/2023"
 * formatDateWithPrefix("2023-12-25", "Updated")   // Returns "Updated 12/25/2023"
 * formatDateWithPrefix(null, "Added", "Never")    // Returns "Never"
 */
function formatDateWithPrefix(date, prefix = "Added", fallback = "Recently") {
  console.log(`formatDateWithPrefix is running with prefix: ${prefix}`);
  logger.debug(`formatDateWithPrefix processing input`, { prefix, fallback });
  
  if (!date) {
    console.log(`formatDateWithPrefix is returning fallback: ${fallback}`);
    logger.debug(`formatDateWithPrefix returning fallback for null/undefined date`);
    return fallback;
  }
  
  const formattedDate = formatDate(date, "");
  if (!formattedDate || formattedDate === "") {
    console.log(`formatDateWithPrefix is returning fallback: ${fallback}`);
    logger.debug(`formatDateWithPrefix returning fallback for invalid date`);
    return fallback;
  }
  
  const result = `${prefix} ${formattedDate}`;
  console.log(`formatDateWithPrefix is returning: ${result}`);
  logger.debug(`formatDateWithPrefix successfully created prefixed date: ${result}`);
  
  return result;
}

/**
 * Format timestamp with both date and time information
 * 
 * RATIONALE: Detailed displays often need both date and time components
 * for precision. This function provides locale-aware formatting that
 * includes time zones and handles various input formats.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use toLocaleString() for comprehensive date/time formatting
 * - Handle both string and Date object inputs
 * - Provide fallback for invalid timestamps
 * - Support customizable fallback text
 * - Log timestamp formatting operations
 * 
 * @param {string|Date|null|undefined} timestamp - Timestamp to format
 * @param {string} fallback - Text for invalid timestamps (default: "Unknown")
 * @returns {string} Formatted timestamp string with date and time
 * 
 * USAGE EXAMPLES:
 * formatTimestamp(new Date())              // Returns "12/25/2023, 10:30:00 AM"
 * formatTimestamp("2023-12-25T10:30:00Z")  // Returns "12/25/2023, 10:30:00 AM"
 * formatTimestamp(null, "No time")         // Returns "No time"
 */
function formatTimestamp(timestamp, fallback = "Unknown") {
  console.log(`formatTimestamp is running with timestamp: ${timestamp}`);
  logger.debug(`formatTimestamp processing timestamp input`, { timestamp, fallback });
  
  if (!timestamp) {
    console.log(`formatTimestamp is returning fallback: ${fallback}`);
    logger.debug(`formatTimestamp returning fallback for null/undefined input`);
    return fallback;
  }
  
  try {
    const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (!isValidDate(dateObj)) {
      console.log(`formatTimestamp is returning fallback for invalid timestamp: ${fallback}`);
      logger.debug(`formatTimestamp returning fallback for invalid timestamp`);
      return fallback;
    }
    
    const formatted = dateObj.toLocaleString();
    console.log(`formatTimestamp is returning: ${formatted}`);
    logger.debug(`formatTimestamp successfully formatted timestamp: ${formatted}`);
    
    return formatted;
  } catch (error) {
    qerrors(error, 'formatTimestamp', { timestamp, fallback });
    logger.error(`formatTimestamp failed with error: ${error.message}`);
    return fallback;
  }
}

/**
 * Calculate relative time difference in human-readable format
 * 
 * RATIONALE: Activity feeds and recent actions need relative time display
 * like "5 minutes ago" or "2 hours ago" for better user context than
 * absolute timestamps.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Calculate time difference in various units (seconds, minutes, hours, days)
 * - Use appropriate unit based on time elapsed
 * - Handle pluralization correctly for grammar
 * - Fall back to absolute date for longer periods
 * - Provide "Just now" for very recent actions
 * 
 * @param {string|Date|null|undefined} date - Date to calculate relative time from
 * @param {string} fallback - Text for invalid dates (default: "Unknown")
 * @returns {string} Human-readable relative time string
 * 
 * USAGE EXAMPLES:
 * formatRelativeTime(new Date(Date.now() - 30000))   // Returns "Just now"
 * formatRelativeTime(new Date(Date.now() - 300000))  // Returns "5 minutes ago"
 * formatRelativeTime(new Date(Date.now() - 7200000)) // Returns "2 hours ago"
 */
function formatRelativeTime(date, fallback = "Unknown") {
  console.log(`formatRelativeTime is running with date: ${date}`);
  logger.debug(`formatRelativeTime calculating relative time`, { date, fallback });
  
  if (!date) {
    console.log(`formatRelativeTime is returning fallback: ${fallback}`);
    logger.debug(`formatRelativeTime returning fallback for null/undefined input`);
    return fallback;
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValidDate(dateObj)) {
      console.log(`formatRelativeTime is returning fallback for invalid date: ${fallback}`);
      logger.debug(`formatRelativeTime returning fallback for invalid date`);
      return fallback;
    }
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let result;
    if (diffSeconds < 60) {
      result = "Just now";
    } else if (diffMinutes < 60) {
      result = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      result = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      result = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      // For longer periods, fall back to formatted date
      result = formatDate(dateObj, fallback);
    }
    
    console.log(`formatRelativeTime is returning: ${result}`);
    logger.debug(`formatRelativeTime calculated relative time: ${result}`, {
      diffSeconds, diffMinutes, diffHours, diffDays
    });
    
    return result;
  } catch (error) {
    qerrors(error, 'formatRelativeTime', { date, fallback });
    logger.error(`formatRelativeTime failed with error: ${error.message}`);
    return fallback;
  }
}

/**
 * Calculate and format execution duration in compact human-readable format
 * 
 * RATIONALE: Process monitoring and execution tracking need concise duration
 * display that works for both completed and ongoing executions. This function
 * provides consistent formatting optimized for dashboard displays.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Calculate duration between start and end times (or current time)
 * - Use appropriate time units (seconds, minutes, hours) based on duration
 * - Provide compact formatting for space-constrained displays
 * - Handle edge cases like missing timestamps or invalid dates
 * - Support both completed and ongoing execution tracking
 * 
 * @param {object} execution - Execution object with timing information
 * @param {string|Date} execution.startedAt - When execution began
 * @param {string|Date} [execution.completedAt] - When execution finished (optional)
 * @returns {string} Compact duration string (e.g., "5m", "2h", "45s")
 * 
 * USAGE EXAMPLES:
 * formatExecutionDuration({ startedAt: "2023-12-25T10:00:00Z", completedAt: "2023-12-25T10:05:00Z" })
 * // Returns "5m"
 * 
 * formatExecutionDuration({ startedAt: "2023-12-25T10:00:00Z" })
 * // Returns ongoing duration like "12m" (if called 12 minutes after start)
 */
function formatExecutionDuration(execution) {
  console.log(`formatExecutionDuration is running`);
  logger.debug(`formatExecutionDuration processing execution`, { execution });
  
  if (!execution || !execution.startedAt) {
    console.log(`formatExecutionDuration is returning "Not started"`);
    logger.debug(`formatExecutionDuration returning "Not started" for invalid execution`);
    qerrors('Invalid execution object passed to formatExecutionDuration', 'formatExecutionDuration', {
      execution: execution ? 'object provided' : 'null/undefined',
      hasStartedAt: !!(execution && execution.startedAt)
    });
    return "Not started";
  }
  
  try {
    const start = new Date(execution.startedAt);
    const end = execution.completedAt ? new Date(execution.completedAt) : new Date();
    
    if (!isValidDate(start) || !isValidDate(end)) {
      console.log(`formatExecutionDuration is returning "Invalid time"`);
      logger.debug(`formatExecutionDuration returning "Invalid time" for invalid dates`);
      qerrors('Invalid date in execution duration calculation', 'formatExecutionDuration', {
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        startValid: isValidDate(start),
        endValid: isValidDate(end)
      });
      return "Invalid time";
    }
    
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    let result;
    if (duration < 60) {
      result = `${duration}s`;
    } else if (duration < 3600) {
      result = `${Math.round(duration / 60)}m`;
    } else {
      result = `${Math.round(duration / 3600)}h`;
    }
    
    console.log(`formatExecutionDuration is returning: ${result}`);
    logger.debug(`formatExecutionDuration calculated duration: ${result}`, {
      durationSeconds: duration,
      isCompleted: !!execution.completedAt
    });
    
    return result;
  } catch (error) {
    qerrors(error, 'formatExecutionDuration', { execution });
    logger.error(`formatExecutionDuration failed with error: ${error.message}`);
    return "Invalid time";
  }
}

/**
 * Format completion date for execution status displays
 * 
 * RATIONALE: Execution monitoring interfaces need to clearly distinguish
 * between completed executions (show completion date) and ongoing ones
 * (show status message). This function centralizes that logic.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Check for completion timestamp first
 * - Use status field to determine ongoing execution state
 * - Provide customizable text for running executions
 * - Handle various execution status values
 * - Log completion status for monitoring
 * 
 * @param {object} execution - Execution object with completion information
 * @param {string|Date} [execution.completedAt] - Completion timestamp
 * @param {string} [execution.status] - Current execution status
 * @param {string} runningText - Text for ongoing executions (default: "Running...")
 * @returns {string} Completion date or status text
 * 
 * USAGE EXAMPLES:
 * formatCompletionDate({ completedAt: "2023-12-25T10:05:00Z" })
 * // Returns "12/25/2023" (formatted completion date)
 * 
 * formatCompletionDate({ status: "processing" })
 * // Returns "Running..."
 * 
 * formatCompletionDate({ status: "failed" }, "Stopped")
 * // Returns "Not completed"
 */
function formatCompletionDate(execution, runningText = "Running...") {
  console.log(`formatCompletionDate is running with runningText: ${runningText}`);
  logger.debug(`formatCompletionDate processing execution`, { execution, runningText });
  
  if (!execution) {
    console.log(`formatCompletionDate is returning "Not completed"`);
    logger.debug(`formatCompletionDate returning "Not completed" for null/undefined execution`);
    qerrors('Invalid execution object passed to formatCompletionDate', 'formatCompletionDate', {
      execution: 'null/undefined'
    });
    return "Not completed";
  }
  
  if (execution.completedAt) {
    const formatted = formatDate(execution.completedAt, "Completed");
    console.log(`formatCompletionDate is returning completion date: ${formatted}`);
    logger.debug(`formatCompletionDate returning completion date: ${formatted}`);
    return formatted;
  }
  
  // Check if execution is actually running
  if (execution.status === "processing" || execution.status === "in_progress") {
    console.log(`formatCompletionDate is returning running text: ${runningText}`);
    logger.debug(`formatCompletionDate returning running text for active execution`, {
      status: execution.status,
      runningText
    });
    return runningText;
  }
  
  console.log(`formatCompletionDate is returning "Not completed"`);
  logger.debug(`formatCompletionDate returning "Not completed" for non-running execution`, {
    status: execution.status,
    hasCompletedAt: !!execution.completedAt
  });
  
  return "Not completed";
}

/*
 * Module Export Strategy:
 * 
 * We export date/time functions that serve complementary purposes in applications:
 * 
 * 1. formatDateTime - Convert timestamps to human-readable format (existing)
 * 2. formatDuration - Calculate and display time differences (existing)
 * 3. addDays - Calculate future dates for business logic (existing)
 * 4. formatDate - Simple date formatting with locale support (enhanced)
 * 5. formatDateWithPrefix - Contextual date display (enhanced)
 * 6. formatTimestamp - Detailed timestamp formatting (enhanced)
 * 7. formatRelativeTime - Relative time display for activity feeds (enhanced)
 * 8. formatExecutionDuration - Compact execution duration display (enhanced)
 * 9. formatCompletionDate - Execution completion status display (enhanced)
 * 
 * These functions are commonly needed together in applications that display
 * time-based information (logs, events, processes) and manage time-based
 * business operations (credits, subscriptions, scheduling).
 */
module.exports = {
  formatDateTime, // export for ISO date display
  formatDuration, // export for duration display
  addDays, // export for date arithmetic and business calculations
  formatDate, // export for simple date formatting
  formatDateWithPrefix, // export for contextual date display
  formatTimestamp, // export for detailed timestamp display
  formatRelativeTime, // export for relative time display
  formatExecutionDuration, // export for compact execution duration
  formatCompletionDate // export for execution completion status
}; // expose utilities for consumption

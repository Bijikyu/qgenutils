/**
 * Format ISO Date String to Locale-Specific Display Format
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
 * ERROR HANDLING STRATEGY:
 * Rather than throwing exceptions for invalid dates, we return "N/A" to
 * indicate missing or invalid data. This prevents date formatting errors
 * from breaking entire page renders or API responses.
 * 
 * @param {string} dateString - ISO date string to format (e.g., "2023-12-25T10:30:00.000Z")
 * @returns {string} Formatted date string or "N/A" if input is invalid/empty
 * @throws Never throws - returns "N/A" on any error for graceful degradation
 */

const { qerrors } = require(`qerrors`);
const logger = require(`../../logger`);
const isValidDate = require(`../../validation/isValidDate`);

function formatDateTime(dateString) {
  logger.debug(`formatDateTime is running with ${dateString}`);
  
  try {
    if (!dateString) {
      logger.debug(`formatDateTime is returning N/A`);
      return `N/A`;
    }

    const date = new Date(dateString);

    if (!isValidDate(date)) {
      logger.debug(`formatDateTime is returning N/A`);
      return `N/A`;
    }
    
    const formatted = date.toLocaleString();
    logger.debug(`formatDateTime is returning ${formatted}`);
    return formatted;
  } catch (err) {
    qerrors(err, `formatDateTime`, dateString);
    logger.error(`formatDateTime failed`, err);
    return `N/A`;
  }
}

module.exports = formatDateTime;
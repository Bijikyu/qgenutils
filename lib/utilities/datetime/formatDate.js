/**
 * Format Date to Localized Date String with Consistent Options
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
 * @throws Never throws - returns fallback on any error
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');
const isValidDate = require('../../validation/isValidDate');

function formatDate(date, fallback = "Unknown") {
  logger.debug(`formatDate processing date input`, { date, fallback });
  
  if (!date) {
    logger.debug(`formatDate returning fallback for null/undefined input`);
    return fallback;
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValidDate(dateObj)) {
      logger.debug(`formatDate returning fallback for invalid date`);
      return fallback;
    }
    
    const formatted = dateObj.toLocaleDateString();
    logger.debug(`formatDate successfully formatted date: ${formatted}`);
    
    return formatted;
  } catch (error) {
    qerrors(error, 'formatDate', { date, fallback });
    logger.error(`formatDate failed with error: ${error.message}`);
    return fallback;
  }
}

module.exports = formatDate;
/**
 * Format Date with Contextual Prefix for Creation/Modification Displays
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
 * @throws Never throws - returns fallback on any error
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');

/**
 * Helper function to validate if a Date object is valid
 * @param {Date} date - Date object to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
function isValidDate(date) {
  return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date';
}

/**
 * Format date to localized date string
 * @param {string|Date|null|undefined} date - Date to format
 * @param {string} fallback - Text to show when date is invalid
 * @returns {string} Formatted date string or fallback text
 */
function formatDate(date, fallback = "Unknown") {
  if (!date) {
    return fallback;
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValidDate(dateObj)) {
      return fallback;
    }
    
    return dateObj.toLocaleDateString();
  } catch (error) {
    return fallback;
  }
}

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

module.exports = formatDateWithPrefix;
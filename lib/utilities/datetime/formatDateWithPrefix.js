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
const logger = require('../../logger');
const isValidDate = require('../../validation/isValidDate');
const formatDate = require('./formatDate');

function formatDateWithPrefix(date, prefix = "Added", fallback = "Recently") {
  logger.debug(`formatDateWithPrefix processing input`, { prefix, fallback });
  
  if (!date) {
    logger.debug(`formatDateWithPrefix returning fallback for null/undefined date`);
    return fallback;
  }
  
  const formattedDate = formatDate(date, "");
  if (!formattedDate || formattedDate === "") {
    logger.debug(`formatDateWithPrefix returning fallback for invalid date`);
    return fallback;
  }
  
  const result = `${prefix} ${formattedDate}`;
  logger.debug(`formatDateWithPrefix successfully created prefixed date: ${result}`);
  
  return result;
}

module.exports = formatDateWithPrefix;
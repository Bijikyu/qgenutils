'use strict';

const { isValid, parseISO, isAfter, isBefore, differenceInDays } = require('date-fns'); // date manipulation library

/**
 * Validate date range for analytics and reporting
 * @param {string|Date} startDate - Start date of range (ISO 8601 string or Date object)
 * @param {string|Date} endDate - End date of range (ISO 8601 string or Date object)
 * @returns {boolean} True if date range is valid, false otherwise
 * @example
 * validateDateRange('2024-01-01', '2024-01-31') // returns true
 * validateDateRange('2024-12-31', '2024-01-01') // returns false (end before start)
 */
function validateDateRange(startDate, endDate) { // comprehensive date range validation using date-fns
  if (startDate === null || startDate === undefined || endDate === null || endDate === undefined) { // check for presence
    return false; // invalid input rejection
  }

  let start, end;

  try {
    start = startDate instanceof Date ? startDate : parseISO(startDate.toString()); // parse start date
    end = endDate instanceof Date ? endDate : parseISO(endDate.toString()); // parse end date
  } catch (error) {
    return false; // parsing error
  }

  if (!isValid(start) || !isValid(end)) { // check for valid date objects
    return false; // invalid date rejection
  }

  const isChronological = isBefore(start, end) || start.getTime() === end.getTime(); // start must be before or equal to end

  if (!isChronological) { // reject non-chronological ranges
    return false;
  }

  const isReasonable = differenceInDays(end, start) <= 365; // maximum 1 year range for performance

  if (!isReasonable) { // reject excessively long ranges
    return false;
  }

  const isNotFuture = !isAfter(end, new Date()); // ensure end date is not in future

  return isNotFuture; // return final validation result
}

module.exports = validateDateRange;

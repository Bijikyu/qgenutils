/**
 * Add Days to Current Date for Future Date Calculations
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
 * 
 * TECHNICAL CONSIDERATIONS:
 * - JavaScript Date automatically handles month/year rollovers (Jan 31 + 1 day = Feb 1)
 * - Time component is preserved from current moment for precise expiration timing
 * - Works correctly across daylight saving time transitions
 * - No timezone conversion needed since expiration is relative to purchase time
 * - Negative values create past dates (useful for backdating or testing scenarios)
 * 
 * @param {number} days - Number of days to add to current date (defaults to 90)
 * @returns {Date} New Date object representing the calculated date
 * @throws Never throws - returns current date on any error for safety
 */

const { qerrors } = require('qerrors');
const logger = require('../../logger');

/**
 * Helper function to validate if a Date object is valid
 * @param {Date} date - Date object to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
function isValidDate(date) {
  return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date';
}

function addDays(days = 90) {
  console.log(`addDays is running with ${days} days`);
  logger.debug(`addDays calculating future date with ${days} days offset`);
  
  try {
    if (typeof days !== 'number' || isNaN(days)) {
      console.log(`addDays received invalid days parameter: ${days}, using default 90`);
      logger.warn(`addDays received non-numeric days parameter, using default`);
      days = 90;
    }
    
    const today = new Date();
    
    if (!isValidDate(today)) {
      const errorMsg = 'System date is invalid';
      console.error(`addDays failed: ${errorMsg}`);
      logger.error(errorMsg);
      qerrors(new Error(errorMsg), 'addDays', { days });
      return new Date();
    }
    
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    if (!isValidDate(futureDate)) {
      const errorMsg = `Date calculation resulted in invalid date`;
      console.error(`addDays failed: ${errorMsg}`);
      logger.error(errorMsg);
      qerrors(new Error(errorMsg), 'addDays', { days, todayDate: today.toISOString() });
      return new Date();
    }
    
    console.log(`addDays is returning date: ${futureDate.toISOString()}`);
    logger.debug(`addDays calculated date successfully: ${futureDate.toISOString()}`);
    
    return futureDate;
    
  } catch (error) {
    console.error('addDays encountered unexpected error:', error);
    qerrors(error, 'addDays', { days });
    logger.error(`addDays failed with error: ${error.message}`);
    
    return new Date();
  }
}

module.exports = addDays;
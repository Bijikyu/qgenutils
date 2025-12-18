/**
 * Add Days to Date using date-fns Library
 * 
 * RATIONALE: Business applications frequently need to calculate future dates for
 * credit expiration, billing cycles, trial periods, and scheduled operations.
 * This function provides a centralized, reliable way to perform date arithmetic
 * using the robust date-fns library that handles edge cases properly.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use date-fns addDays function for reliable date arithmetic
 * - Use current date as baseline to ensure dates are relative to execution time
 * - Return new Date object to prevent mutation of current date (immutable pattern)
 * - Default 90-day period provides generous timeframe for credit systems
 * - Leverage date-fns for proper month/year boundary handling
 * 
 * BUSINESS RATIONALE:
 * Credit expiration encourages regular usage and prevents indefinite accumulation.
 * The 90-day default balances user convenience with business cash flow needs.
 * 
 * TECHNICAL CONSIDERATIONS:
 * - date-fns handles month/year rollovers and edge cases correctly
 * - Time component is preserved from current moment for precise expiration timing
 * - Works correctly across daylight saving time transitions
 * - No timezone conversion needed since expiration is relative to purchase time
 * - Negative values create past dates (useful for backdating or testing scenarios)
 * 
 * @param {number} days - Number of days to add to current date (defaults to 90)
 * @returns {Date} New Date object representing the calculated date
 * @throws Never throws - returns current date on any error for safety
 */

const { addDays: addDaysFromDate } = require('date-fns');
const { qerrors } = require('qerrors');
const logger = require('../../logger');

function addDays(days = 90) {
  logger.debug(`addDays calculating future date with ${days} days offset`);
  
  try {
    if (typeof days !== `number` || isNaN(days) || !isFinite(days)) {
      logger.warn(`addDays received non-numeric or infinite days parameter, using default`);
      days = 90;
    }
    
    const today = new Date();
    const futureDate = addDaysFromDate(today, days);
    
    logger.debug(`addDays calculated date successfully: ${futureDate.toISOString()}`);
    
    return futureDate;
    
  } catch (error) {
    qerrors(error, `addDays`, { days });
    logger.error(`addDays failed with error: ${error.message}`);
    
    return new Date();
  }
}

module.exports = addDays;
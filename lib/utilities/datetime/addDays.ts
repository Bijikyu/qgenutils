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
 * @param days - Number of days to add to current date (defaults to 90)
 * @returns New Date object representing the calculated date
 * @throws Never throws - returns current date on any error for safety
 */

import { addDays as addDaysFromDate } from 'date-fns';
import { qerrors } from '@bijikyu/qerrors';
import logger from '../../logger.js';

/**
 * Adds specified number of days to current date
 *
 * @param days - Number of days to add (default: 90)
 * @returns New Date object with calculated future date
 */
const addDays = (days: number = 90): Date => {
  logger.debug(`addDays calculating future date with ${days} days offset`);

  try {
    // Validate input parameter
    if (typeof days !== 'number' || isNaN(days) || !isFinite(days)) {
      logger.warn('addDays received non-numeric or infinite days parameter, using default');
      days = 90;
    }

    // Get current date and calculate future date
    const today = new Date();
    const futureDate = addDaysFromDate(today, days);

    logger.debug(`addDays calculated date successfully: ${futureDate.toISOString()}`);
    return futureDate;

  } catch (error) {
    // Log error and return current date as safe fallback
    qerrors(
      error instanceof Error ? error : new Error(String(error)),
      'addDays'
    );
    logger.error(`addDays failed with error: ${error instanceof Error ? error.message : String(error)}`);
    return new Date();
  }
};

export default addDays;

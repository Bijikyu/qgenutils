/**
 * Calculate and Format Duration Between Two Dates in HH:MM:SS Format using date-fns
 *
 * RATIONALE: Duration calculation is common for showing elapsed time, process
 * durations, or time differences. This function provides consistent formatting
 * that's easy to read and compare across different time ranges using the robust date-fns library.
 *
 * IMPLEMENTATION STRATEGY:
 * - Use date-fns differenceInMilliseconds for accurate duration calculation
 * - Use current time as default end date for "time since" scenarios
 * - Calculate millisecond difference and convert to time components
 * - Always return HH:MM:SS format with zero-padding for consistency
 * - Handle edge cases like negative durations or invalid dates
 *
 * TIME CALCULATION PROCESS:
 * 1. Parse both dates using date-fns parseISO for robust parsing
 * 2. Calculate absolute difference in milliseconds using date-fns
 * 3. Convert to hours, minutes, seconds using modular arithmetic
 * 4. Format with zero-padding for consistent display width
 *
 * ZERO-PADDING RATIONALE:
 * Consistent formatting (01:05:03 vs 1:5:3) makes durations easier to:
 * - Visually compare and sort
 * - Align in tables and lists
 * - Parse programmatically if needed
 *
 * @param startDateString - ISO date string for start time
 * @param endDateString - ISO date string for end time (defaults to current time)
 * @returns Duration in HH:MM:SS format or "00:00:00" if start date is invalid
 * @throws If dates are invalid (after trying graceful handling)
 */

import { differenceInMilliseconds, parseISO, isValid } from 'date-fns';
import { qerr as qerrors } from '@bijikyu/qerrors';
import logger from '../../logger.js';

function formatDuration(startDateString: string, endDateString?: string): string {
  logger.debug(`formatDuration is running with ${startDateString} and ${endDateString}`);

  try {
    if (!startDateString || startDateString === '') {
      logger.debug('formatDuration is returning 00:00:00');
      return '00:00:00';
    }

    const startDate = parseISO(startDateString);
    if (!isValid(startDate)) {
      return '00:00:00';
    }

    const endTime = endDateString ? parseISO(endDateString) : new Date();

    if (endDateString && !isValid(endTime)) {
      return '00:00:00';
    }

    const durationMs = Math.abs(differenceInMilliseconds(endTime, startDate));

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    logger.debug(`formatDuration is returning ${formatted}`);
    return formatted;
  } catch (err) {
    logger.error('formatDuration failed', err);
    qerrors(err instanceof Error ? err : new Error(String(err)), 'formatDuration');
    return '00:00:00';
  }
}

export default formatDuration;

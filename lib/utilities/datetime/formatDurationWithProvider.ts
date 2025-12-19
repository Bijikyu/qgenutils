/**
 * Format duration with injectable time provider.
 *
 * PURPOSE: Testable version of formatDuration that accepts a time provider
 * for deterministic "time since" calculations in tests.
 *
 * @param {string} startTime - ISO date string for start time
 * @param {string} [endTime] - ISO date string for end time (uses provider.now() if not specified)
 * @param {object} [timeProvider] - Time provider with now() method
 * @returns {string} Duration in HH:MM:SS format
 */

const isValidDate: any = require('../helpers/isValidDate');
const createTimeProvider: any = require('./createTimeProvider');

function formatDurationWithProvider(startTime, endTime, timeProvider) {
  if (!startTime) {
    return '00:00:00';
  }

  try {
    const startDate: any = new Date(startTime);
    
    if (!isValidDate(startDate)) {
      return '00:00:00';
    }

    const provider: any = timeProvider || createTimeProvider();
    const endDate: any = endTime ? new Date(endTime) : provider.now();
    
    if (endTime && !isValidDate(endDate)) {
      return '00:00:00';
    }

    const durationMs: any = Math.abs(endDate.getTime() - startDate.getTime());

    const hours: any = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes: any = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds: any = Math.floor((durationMs % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch {
    return '00:00:00';
  }
}

export default formatDurationWithProvider;

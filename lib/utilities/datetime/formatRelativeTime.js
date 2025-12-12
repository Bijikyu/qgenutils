/**
 * Format relative time (e.g., "5 minutes ago", "in 2 hours").
 *
 * PURPOSE: User-friendly relative time display for timestamps.
 * Uses dependency injection for deterministic testing.
 *
 * @param {string} isoString - ISO date string to format
 * @param {object} [timeProvider] - Time provider with now() method
 * @returns {string} Relative time string or 'N/A' if invalid
 */

const isValidDate = require('../helpers/isValidDate');
const createTimeProvider = require('./createTimeProvider');

function formatRelativeTime(isoString, timeProvider) {
  if (!isoString) {
    return 'N/A';
  }

  try {
    const date = new Date(isoString);
    
    if (!isValidDate(date)) {
      return 'N/A';
    }

    const provider = timeProvider || createTimeProvider();
    const now = provider.now();
    const diffMs = now.getTime() - date.getTime();
    const absDiff = Math.abs(diffMs);
    const isPast = diffMs > 0;

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let value, unit;

    if (seconds < 60) {
      value = seconds;
      unit = seconds === 1 ? 'second' : 'seconds';
    } else if (minutes < 60) {
      value = minutes;
      unit = minutes === 1 ? 'minute' : 'minutes';
    } else if (hours < 24) {
      value = hours;
      unit = hours === 1 ? 'hour' : 'hours';
    } else if (days < 7) {
      value = days;
      unit = days === 1 ? 'day' : 'days';
    } else if (weeks < 4) {
      value = weeks;
      unit = weeks === 1 ? 'week' : 'weeks';
    } else if (months < 12) {
      value = months;
      unit = months === 1 ? 'month' : 'months';
    } else {
      value = years;
      unit = years === 1 ? 'year' : 'years';
    }

    if (seconds < 5) {
      return 'just now';
    }

    return isPast ? `${value} ${unit} ago` : `in ${value} ${unit}`;
  } catch {
    return 'N/A';
  }
}

module.exports = formatRelativeTime;

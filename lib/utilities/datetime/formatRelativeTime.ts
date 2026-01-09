/**
 * Format relative time (e.g., "5 minutes ago", "in 32 hours").
 *
 * PURPOSE: User-friendly relative time display for timestamps.
 * Uses date-fns for robust, locale-aware formatting.
 *
 * @param {string} isoString - ISO date string to format
 * @param {object} [timeProvider] - Time provider with now() method (for testing)
 * @returns {string} Relative time string or 'N/A' if invalid
 */

import { parseISO, isValid } from 'date-fns';

function formatRelativeTime(isoString: string, timeProvider?: { now: () => Date }): string {
  if (!isoString) {
    return 'N/A';
  }

  try {
    const date = parseISO(isoString);

    if (!isValid(date)) {
      return 'N/A';
    }

    // Use provided time provider for testing, otherwise use current time
    const referenceDate = timeProvider ? timeProvider.now() : new Date();

    const diffMs = referenceDate.getTime() - date.getTime();
    const absMs = Math.abs(diffMs);
    if (absMs <= 5000) {
      return 'just now';
    }

    const isFuture = diffMs < 0;
    const absSeconds = Math.floor(absMs / 1000);

    const plural = (n: number, unit: string) => (n === 1 ? `${n} ${unit}` : `${n} ${unit}s`);
    const withSuffix = (text: string) => (isFuture ? `in ${text}` : `${text} ago`);

    if (absSeconds < 60) {
      return withSuffix(plural(absSeconds, 'second'));
    }

    const absMinutes = Math.floor(absSeconds / 60);
    if (absMinutes < 60) {
      return withSuffix(plural(absMinutes, 'minute'));
    }

    const absHours = Math.floor(absMinutes / 60);
    if (absHours < 24) {
      return withSuffix(plural(absHours, 'hour'));
    }

    const absDays = Math.floor(absHours / 24);
    if (absDays < 7) {
      return withSuffix(plural(absDays, 'day'));
    }

    if (absDays < 30) {
      const absWeeks = Math.floor(absDays / 7);
      return withSuffix(plural(absWeeks, 'week'));
    }

    if (absDays < 365) {
      const absMonths = Math.floor(absDays / 30);
      return withSuffix(plural(absMonths, 'month'));
    }

    const absYears = Math.floor(absDays / 365);
    return withSuffix(plural(absYears, 'year'));
  } catch {
    return 'N/A';
  }
}

export default formatRelativeTime;

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

import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

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
    
    // Use date-fns formatDistanceToNow for robust relative time formatting
    return formatDistanceToNow(date, { 
      addSuffix: true,
      includeSeconds: true
    });
  } catch {
    return 'N/A';
  }
}

export default formatRelativeTime;
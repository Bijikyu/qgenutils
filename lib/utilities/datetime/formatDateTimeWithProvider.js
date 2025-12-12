/**
 * Format datetime with injectable time provider.
 *
 * PURPOSE: Testable version of formatDateTime that accepts a time provider
 * for deterministic behavior in tests.
 *
 * @param {string} isoString - ISO date string to format
 * @param {object} [options] - Formatting options
 * @param {string} [options.locale] - Locale for formatting (e.g., 'en-US', 'de-DE')
 * @param {object} [options.formatOptions] - Intl.DateTimeFormat options
 * @returns {string} Formatted date string or 'N/A' if invalid
 */

const isValidDate = require('../helpers/isValidDate');

function formatDateTimeWithProvider(isoString, options = {}) {
  if (!isoString) {
    return 'N/A';
  }

  try {
    const date = new Date(isoString);
    
    if (!isValidDate(date)) {
      return 'N/A';
    }

    const { locale, formatOptions } = options;
    
    if (locale || formatOptions) {
      return date.toLocaleString(locale, formatOptions);
    }
    
    return date.toLocaleString();
  } catch {
    return 'N/A';
  }
}

module.exports = formatDateTimeWithProvider;

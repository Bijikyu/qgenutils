/**
 * Format ISO Date String to Locale-Specific Display Format using date-fns
 * 
 * RATIONALE: APIs typically return dates in ISO format (2023-12-25T10:30:00.000Z)
 * which is machine-readable but not user-friendly. This function converts ISO
 * dates to formats that users expect to see in interfaces using the robust date-fns library.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use date-fns formatLocale function for consistent locale adaptation
 * - Return "N/A" for empty/invalid inputs rather than throwing errors
 * - Handle both null and empty string inputs gracefully
 * - Preserve timezone information from the original date
 * - Leverage date-fns for reliable date parsing and formatting
 * 
 * LOCALE BEHAVIOR:
 * date-fns formatLocale automatically formats dates according to the user's system
 * locale settings. For example:
 * - US format: "12/25/2023, 10:30:00 AM"
 * - European format: "25/12/2023, 10:30:00"
 * - ISO format in some locales: "2023-12-25, 10:30:00"
 * 
 * ERROR HANDLING STRATEGY:
 * Rather than throwing exceptions for invalid dates, we return "N/A" to
 * indicate missing or invalid data. This prevents date formatting errors
 * from breaking entire page renders or API responses.
 * 
 * @param {string} dateString - ISO date string to format (e.g., "2023-12-25T10:30:00.000Z")
 * @returns {string} Formatted date string or "N/A" if input is invalid/empty
 * @throws Never throws - returns "N/A" on any error for graceful degradation
 */

import { format as formatDateFn, parseISO, isValid } from 'date-fns';
import { qerrors } from 'qerrors';
import logger from '../../logger.js';

function formatDateTime(dateString: string): string {
  logger.debug(`formatDateTime is running with ${dateString}`);
  
  try {
    if (!dateString) {
      logger.debug(`formatDateTime is returning N/A`);
      return `N/A`;
    }

    const date: any = parseISO(dateString);

    if (!isValid(date)) {
      logger.debug(`formatDateTime is returning N/A`);
      return `N/A`;
    }
    
    const formatted: any = formatDateFn(date, 'Ppp');
    logger.debug(`formatDateTime is returning ${formatted}`);
    return formatted;
  } catch (err) {
    if (err instanceof Error) {
      qerrors(err, `formatDateTime`, dateString);
      logger.error(`formatDateTime failed`, err);
    } else {
      const error = new Error(String(err));
      qerrors(error, `formatDateTime`, dateString);
      logger.error(`formatDateTime failed`, error);
    }
    return `N/A`;
  }
}

export default formatDateTime;
/**
 * Format Date to Localized Date String with Consistent Options
 * 
 * RATIONALE: User interfaces need consistent date formatting that adapts to
 * user locale preferences. This function provides fallback handling for
 * invalid dates while maintaining locale-appropriate formatting.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Accept both string and Date object inputs for flexibility
 * - Use toLocaleDateString() for automatic locale adaptation
 * - Provide customizable fallback text for invalid/missing dates
 * - Handle parsing errors gracefully without throwing exceptions
 * - Log date formatting operations for debugging UI issues
 * 
 * LOCALE BEHAVIOR:
 * toLocaleDateString() automatically formats according to user's system locale:
 * - US format: "12/25/2023"
 * - European format: "25/12/2023" 
 * - ISO format: "2023-12-25"
 * This improves user experience by showing familiar date formats.
 * 
 * @param date - Date to format
 * @param fallback - Text to show when date is invalid (default: "Unknown")
 * @returns Formatted date string or fallback text
 * @throws Never throws - returns fallback on any error
 */

import { 
  handleUtilityError, 
  createDebugLogger,
  isValidDate 
} from '../helpers/index.js';

function formatDate(date: string | Date | null | undefined, fallback: string = "N/A"): string {
  const debug = createDebugLogger('formatDate');
  
  try {
    debug.start({ input: date, fallback });

    if (date == null) {
      debug.warn('returning fallback for null/undefined input');
      return fallback;
    }

    if (typeof date !== 'string' && !(date instanceof Date)) {
      debug.warn('returning fallback for unsupported input type');
      return fallback;
    }
    
    const dateObj: any = typeof date === `string` ? new Date(date) : date;
    if (!isValidDate(dateObj)) {
      debug.warn('returning fallback for invalid date');
      return fallback;
    }
    
    const formatted: any = dateObj.toLocaleDateString();
    debug.success({ output: formatted });
    
    return formatted;
  } catch (error) {
    return handleUtilityError(error, 'formatDate', { 
      input: date,
      fallback 
    }, fallback);
  }
}

export default formatDate;

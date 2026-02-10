/**
 * DateTime Formatting Utility
 *
 * PURPOSE: Provides robust date/time parsing and formatting with comprehensive
 * error handling. This utility handles various input formats and provides
 * consistent output for display purposes.
 *
 * WHY: Date handling in JavaScript is notoriously inconsistent across
 * different environments and input formats. This utility provides a
 * standardized approach with proper error handling and logging.
 */

import { isValid, parseISO } from 'date-fns';
import { qerrors } from '@bijikyu/qerrors';
import logger from '../../logger.js';

/**
 * Result interface for date/time formatting operations
 */
type DateTimeFormatResult = {
  original: string | Date;  // Original input value
  formatted?: string;       // Formatted date string (if successful)
  timestamp?: number;       // Unix timestamp (if successful)
  error?: string;          // Error message (if failed)
};

/**
 * Formats a date/time value with comprehensive error handling
 *
 * This function accepts both Date objects and ISO string formats,
 * validates the input, and returns a standardized result with
 * both formatted string and timestamp for flexibility.
 *
 * @param input - Date object or ISO string to format
 * @returns DateTimeFormatResult with formatted data or error information
 */
const formatDateTime = (input: string | Date): DateTimeFormatResult => {
  // Log the operation for debugging and monitoring
  logger.debug('formatDateTime is running', { inputType: typeof input });

  try {
    // Validate input is not null or undefined
    if (input == null) {
      return { original: input as any, error: 'Invalid date: input is null/undefined' };
    }

    // Convert input to Date object based on type
    const date: Date =
      input instanceof Date
        ? input  // Already a Date object
        : typeof input === 'string'
          ? parseISO(input)  // Parse ISO string
          : (new Date(NaN) as any);  // Invalid type, create invalid Date

    // Validate the resulting Date object
    if (!(date instanceof Date) || !isValid(date)) {
      return {
        original: input as any,
        formatted: 'N/A',  // Standard placeholder for invalid dates
        error: 'Invalid date'
      };
    }

    // Return successful result with both formatted string and timestamp
    return {
      original: input,
      formatted: date.toLocaleString(),  // Use locale-aware formatting
      timestamp: date.getTime()          // Unix timestamp for programmatic use
    };
  } catch (err) {
    // Comprehensive error handling with proper error types
    const errorObj = err instanceof Error ? err : new Error(String(err));
    qerrors(errorObj, 'formatDateTime');  // Log to error tracking system
    logger.error('formatDateTime failed', { error: errorObj.message });

    // Return error result with original input preserved
    return {
      original: input as any,
      formatted: 'N/A',
      error: errorObj.message
    };
  }
};

export default formatDateTime;

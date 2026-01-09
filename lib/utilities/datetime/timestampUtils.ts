/**
 * Timestamp utilities using date-fns
 *
 * PURPOSE: Provides timestamp operations using well-tested date-fns library
 * instead of custom implementations for better reliability and
 * locale-aware functionality.
 */

import {
  add,
  sub,
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  parseISO,
  isValid,
  format,
  parse
} from 'date-fns';

interface TimeToAdd {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

interface TimestampObject {
  timestamp: number;
  isoString: string;
  dateString: string;
  timeString: string;
  localString: string;
  utcString: string;
}

interface TimestampDifference {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
}

/**
 * Gets current timestamp in milliseconds
 * @returns Current timestamp in milliseconds
 */
function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Gets current timestamp as ISO string
 * @returns Current timestamp as ISO string
 */
function getCurrentIsoTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Converts timestamp to ISO string
 * @param timestamp - Timestamp in milliseconds
 * @returns ISO string representation
 */
function toIsoTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Creates a timestamp with optional offset
 * @param offsetMs - Offset in milliseconds (default: 0)
 * @returns Timestamp with offset applied
 */
function createTimestamp(offsetMs: number = 0): number {
  return Date.now() + offsetMs;
}

/**
 * Creates an ISO timestamp with optional offset
 * @param offsetMs - Offset in milliseconds (default: 0)
 * @returns ISO timestamp with offset applied
 */
function createIsoTimestamp(offsetMs: number = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

/**
 * Gets timestamp object with multiple formats
 * @param timestamp - Timestamp in milliseconds (default: current time)
 * @returns Timestamp object with multiple formats
 */
function createTimestampObject(timestamp: number = Date.now()): TimestampObject {
  const date = new Date(timestamp);
  return {
    timestamp,
    isoString: date.toISOString(),
    dateString: date.toDateString(),
    timeString: date.toTimeString(),
    localString: date.toLocaleString(),
    utcString: date.toUTCString()
  };
}

/**
 * Adds time to a timestamp using date-fns
 * @param timestamp - Base timestamp in milliseconds
 * @param timeToAdd - Time to add
 * @returns New timestamp with time added
 */
function addToTimestamp(timestamp: number, timeToAdd: TimeToAdd = {}): number {
  const date = new Date(timestamp);
  const {
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  } = timeToAdd;

  let result = date;

  if (days > 0) {
    result = add(result, { days });
  }
  if (hours > 0) {
    result = add(result, { hours });
  }
  if (minutes > 0) {
    result = add(result, { minutes });
  }
  if (seconds > 0) {
    result = add(result, { seconds });
  }
  if (milliseconds > 0) {
    // Add milliseconds separately as date-fns doesn't support milliseconds in duration
    result = new Date(result.getTime() + milliseconds);
  }

  return result.getTime();
}

/**
 * Subtracts time from a timestamp using date-fns
 * @param timestamp - Base timestamp in milliseconds
 * @param timeToSubtract - Time to subtract (same format as addToTimestamp)
 * @returns New timestamp with time subtracted
 */
function subtractFromTimestamp(timestamp: number, timeToSubtract: TimeToAdd = {}): number {
  const date = new Date(timestamp);
  const {
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  } = timeToSubtract;

  let result = date;

  if (days > 0) {
    result = sub(result, { days });
  }
  if (hours > 0) {
    result = sub(result, { hours });
  }
  if (minutes > 0) {
    result = sub(result, { minutes });
  }
  if (seconds > 0) {
    result = sub(result, { seconds });
  }
  if (milliseconds > 0) {
    // Subtract milliseconds separately as date-fns doesn't support milliseconds in duration
    result = new Date(result.getTime() - milliseconds);
  }

  return result.getTime();
}

/**
 * Calculates difference between two timestamps using date-fns
 * @param timestamp1 - First timestamp in milliseconds
 * @param timestamp2 - Second timestamp in milliseconds (default: current time)
 * @returns Difference in multiple units
 */
function getTimestampDifference(timestamp1: number, timestamp2: number = Date.now()): TimestampDifference {
  const diffMs = Math.abs(timestamp2 - timestamp1);
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return {
    milliseconds: diffMs,
    seconds: differenceInSeconds(date2, date1),
    minutes: differenceInMinutes(date2, date1),
    hours: differenceInHours(date2, date1),
    days: differenceInDays(date2, date1),
    totalSeconds: differenceInSeconds(date2, date1),
    totalMinutes: differenceInMinutes(date2, date1),
    totalHours: differenceInHours(date2, date1),
    totalDays: differenceInDays(date2, date1)
  };
}

/**
 * Validates if a value is a valid timestamp
 * @param value - Value to validate
 * @returns True if valid timestamp
 */
function isValidTimestamp(value: unknown): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  // Check if it's within reasonable range (not too far in past or future)
  const minTimestamp = new Date('1970-01-01').getTime();
  const maxTimestamp = new Date('2100-01-01').getTime();

  return value >= minTimestamp && value <= maxTimestamp;
}

/**
 * Parses various timestamp formats to milliseconds using date-fns
 * @param timestamp - Timestamp in various formats
 * @returns Timestamp in milliseconds or null if invalid
 */
function parseTimestamp(timestamp: unknown): number | null {
  if (typeof timestamp === 'number') {
    return isValidTimestamp(timestamp) ? timestamp : null;
  }

  if (typeof timestamp === 'string') {
    const parsed = parseISO(timestamp);
    return isValid(parsed) ? parsed.getTime() : null;
  }

  if (timestamp instanceof Date) {
    const parsed = timestamp.getTime();
    return isValidTimestamp(parsed) ? parsed : null;
  }

  return null;
}

export {
  getCurrentTimestamp,
  getCurrentIsoTimestamp,
  toIsoTimestamp,
  createTimestamp,
  createIsoTimestamp,
  createTimestampObject,
  addToTimestamp,
  subtractFromTimestamp,
  getTimestampDifference,
  isValidTimestamp,
  parseTimestamp
};

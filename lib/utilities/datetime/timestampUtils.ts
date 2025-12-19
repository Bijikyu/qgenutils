/**
 * Timestamp utilities for common time-related operations
 */

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
  return {
    timestamp,
    isoString: new Date(timestamp).toISOString(),
    dateString: new Date(timestamp).toDateString(),
    timeString: new Date(timestamp).toTimeString(),
    localString: new Date(timestamp).toLocaleString(),
    utcString: new Date(timestamp).toUTCString()
  };
}

/**
 * Adds time to a timestamp
 * @param timestamp - Base timestamp in milliseconds
 * @param timeToAdd - Time to add
 * @returns New timestamp with time added
 */
function addToTimestamp(timestamp: number, timeToAdd: TimeToAdd = {}): number {
  const {
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  } = timeToAdd;

  const totalMs = 
    (days * 24 * 60 * 60 * 1000) +
    (hours * 60 * 60 * 1000) +
    (minutes * 60 * 1000) +
    (seconds * 1000) +
    milliseconds;

  return timestamp + totalMs;
}

/**
 * Subtracts time from a timestamp
 * @param timestamp - Base timestamp in milliseconds
 * @param timeToSubtract - Time to subtract (same format as addToTimestamp)
 * @returns New timestamp with time subtracted
 */
function subtractFromTimestamp(timestamp: number, timeToSubtract: TimeToAdd = {}): number {
  return addToTimestamp(timestamp, Object.fromEntries(
    Object.entries(timeToSubtract).map(([key, value]) => [key, -Math.abs(value as number)])
  ) as TimeToAdd);
}

/**
 * Calculates difference between two timestamps
 * @param timestamp1 - First timestamp in milliseconds
 * @param timestamp2 - Second timestamp in milliseconds (default: current time)
 * @returns Difference in multiple units
 */
function getTimestampDifference(timestamp1: number, timestamp2: number = Date.now()): TimestampDifference {
  const diffMs: any = Math.abs(timestamp2 - timestamp1);
  const diffSeconds: any = Math.floor(diffMs / 1000);
  const diffMinutes: any = Math.floor(diffSeconds / 60);
  const diffHours: any = Math.floor(diffMinutes / 60);
  const diffDays: any = Math.floor(diffHours / 24);

  return {
    milliseconds: diffMs,
    seconds: diffSeconds % 60,
    minutes: diffMinutes % 60,
    hours: diffHours % 24,
    days: diffDays,
    totalSeconds: diffSeconds,
    totalMinutes: diffMinutes,
    totalHours: diffHours,
    totalDays: diffDays
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
  const minTimestamp: any = new Date('1970-01-01').getTime();
  const maxTimestamp: any = new Date('2100-01-01').getTime();
  
  return value >= minTimestamp && value <= maxTimestamp;
}

/**
 * Parses various timestamp formats to milliseconds
 * @param timestamp - Timestamp in various formats
 * @returns Timestamp in milliseconds or null if invalid
 */
function parseTimestamp(timestamp: unknown): number | null {
  if (typeof timestamp === 'number') {
    return isValidTimestamp(timestamp) ? timestamp : null;
  }
  
  if (typeof timestamp === 'string') {
    const parsed: any = new Date(timestamp).getTime();
    return isValidTimestamp(parsed) ? parsed : null;
  }
  
  if (timestamp instanceof Date) {
    const parsed: any = timestamp.getTime();
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
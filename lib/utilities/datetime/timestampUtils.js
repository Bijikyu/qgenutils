/**
 * Timestamp utilities for common time-related operations
 */

/**
 * Gets current timestamp in milliseconds
 * @returns {number} Current timestamp in milliseconds
 */
function getCurrentTimestamp() {
  return Date.now();
}

/**
 * Gets current timestamp as ISO string
 * @returns {string} Current timestamp as ISO string
 */
function getCurrentIsoTimestamp() {
  return new Date().toISOString();
}

/**
 * Converts timestamp to ISO string
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} ISO string representation
 */
function toIsoTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}

/**
 * Creates a timestamp with optional offset
 * @param {number} offsetMs - Offset in milliseconds (default: 0)
 * @returns {number} Timestamp with offset applied
 */
function createTimestamp(offsetMs = 0) {
  return Date.now() + offsetMs;
}

/**
 * Creates an ISO timestamp with optional offset
 * @param {number} offsetMs - Offset in milliseconds (default: 0)
 * @returns {string} ISO timestamp with offset applied
 */
function createIsoTimestamp(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

/**
 * Gets timestamp object with multiple formats
 * @param {number} timestamp - Timestamp in milliseconds (default: current time)
 * @returns {Object} Timestamp object with multiple formats
 */
function createTimestampObject(timestamp = Date.now()) {
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
 * @param {number} timestamp - Base timestamp in milliseconds
 * @param {Object} timeToAdd - Time to add
 * @param {number} timeToAdd.days - Days to add
 * @param {number} timeToAdd.hours - Hours to add
 * @param {number} timeToAdd.minutes - Minutes to add
 * @param {number} timeToAdd.seconds - Seconds to add
 * @param {number} timeToAdd.milliseconds - Milliseconds to add
 * @returns {number} New timestamp with time added
 */
function addToTimestamp(timestamp, timeToAdd = {}) {
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
 * @param {number} timestamp - Base timestamp in milliseconds
 * @param {Object} timeToSubtract - Time to subtract (same format as addToTimestamp)
 * @returns {number} New timestamp with time subtracted
 */
function subtractFromTimestamp(timestamp, timeToSubtract = {}) {
  return addToTimestamp(timestamp, Object.fromEntries(
    Object.entries(timeToSubtract).map(([key, value]) => [key, -Math.abs(value)])
  ));
}

/**
 * Calculates difference between two timestamps
 * @param {number} timestamp1 - First timestamp in milliseconds
 * @param {number} timestamp2 - Second timestamp in milliseconds (default: current time)
 * @returns {Object} Difference in multiple units
 */
function getTimestampDifference(timestamp1, timestamp2 = Date.now()) {
  const diffMs = Math.abs(timestamp2 - timestamp1);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

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
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid timestamp
 */
function isValidTimestamp(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  
  // Check if it's within reasonable range (not too far in past or future)
  const now = Date.now();
  const minTimestamp = new Date('1970-01-01').getTime();
  const maxTimestamp = new Date('2100-01-01').getTime();
  
  return value >= minTimestamp && value <= maxTimestamp;
}

/**
 * Parses various timestamp formats to milliseconds
 * @param {*} timestamp - Timestamp in various formats
 * @returns {number|null} Timestamp in milliseconds or null if invalid
 */
function parseTimestamp(timestamp) {
  if (typeof timestamp === 'number') {
    return isValidTimestamp(timestamp) ? timestamp : null;
  }
  
  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp).getTime();
    return isValidTimestamp(parsed) ? parsed : null;
  }
  
  if (timestamp instanceof Date) {
    const parsed = timestamp.getTime();
    return isValidTimestamp(parsed) ? parsed : null;
  }
  
  return null;
}

module.exports = {
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
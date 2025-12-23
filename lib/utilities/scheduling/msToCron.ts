/**
 * Convert Milliseconds to Cron Expression
 * 
 * Converts a millisecond interval to a cron expression.
 * Supports intervals from seconds to days.
 * 
 * Cron format: second minute hour day month weekday
 * 
 * @param {number} ms - Milliseconds to convert (must be positive)
 * @returns {string} Cron expression
 * @throws {Error} If ms is not a positive number
 */
function msToCron(ms) {
  if (typeof ms !== 'number' || ms <= 0 || !Number.isFinite(ms)) {
    throw new Error('Milliseconds must be a positive number');
  }

  const seconds: any = Math.floor(ms / 1000);
  const minutes: any = Math.floor(seconds / 60);
  const hours: any = Math.floor(minutes / 60);
  const days: any = Math.floor(hours / 24);

  if (seconds < 60) { // every N seconds
    return `*/${Math.max(1, seconds)} * * * *`;
  } else if (minutes < 60) { // every N minutes
    return `0 */${minutes} * * *`;
  } else if (hours < 24) { // every N hours
    return `0 0 */${hours} * *`;
  } else { // every N days
    return `0 0 0 */${Math.max(1, days)} *`;
  }
}

export default msToCron;

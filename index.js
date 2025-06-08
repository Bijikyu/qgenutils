
/**
 * Convert ISO string to locale display format
 * @param {string} dateString - The ISO date string to format
 * @returns {string} The formatted date string
 */
function formatDateTime(dateString) {
  console.log(`formatDateTime is running with ${dateString}`);
  try {
    if (!dateString) return 'N/A';
    const result = new Date(dateString).toLocaleString();
    console.log(`formatDateTime is returning ${result}`);
    return result;
  } catch (err) {
    console.log('formatDateTime has run resulting in a final value of failure');
    throw err;
  }
}

/**
 * Show elapsed time as hh:mm:ss format
 * @param {string} startDate - The start date ISO string
 * @param {string|null} [endDate] - The end date ISO string (optional, defaults to current time)
 * @returns {string} The formatted duration string
 */
function formatDuration(startDate, endDate = null) {
  console.log(`formatDuration is running with ${startDate} and ${endDate}`);
  try {
    if (!startDate) return '00:00:00';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const seconds = Math.floor(diffMs / 1000) % 60;
    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(`formatDuration is returning ${result}`);
    return result;
  } catch (err) {
    console.log('formatDuration has run resulting in a final value of failure');
    throw err;
  }
}

// Export functions for CommonJS
module.exports = {
  formatDateTime,
  formatDuration
};

// Export functions for ES modules (if needed)
module.exports.default = module.exports;

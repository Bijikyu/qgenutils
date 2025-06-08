
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

const { qerrors } = require('./utils/offline'); // import offline-aware qerrors

/**
 * Calculate the content length of a body in bytes
 * @param {*} body - The body to calculate length for
 * @returns {string} The content length as a string
 */
function calculateContentLength(body) {
  console.log(`calculateContentLength is running with ${body}`); // start log
  try {
    if (body === undefined) throw new TypeError('Body is undefined'); // throw on undefined
    const emptyObj = typeof body === 'object' && Object.keys(body).length === 0; // check empty object
    if (body === null || body === '' || emptyObj) { // return zero only for valid empty bodies
      console.log(`calculateContentLength is returning 0`); // return log
      return '0'; // return zero as string
    }

    if (typeof body === 'string') { // handle string bodies
      const len = Buffer.byteLength(body, 'utf8'); // compute byte size
      console.log(`calculateContentLength is returning ${len}`); // return log
      return len.toString(); // return length string
    }

    if (typeof body === 'object') { // handle object bodies
      const jsonString = JSON.stringify(body); // stringify for count
      const len = Buffer.byteLength(jsonString, 'utf8'); // compute bytes
      console.log(`calculateContentLength is returning ${len}`); // return log
      return len.toString(); // return length string
    }

    console.log(`calculateContentLength is returning 0`); // fallback log
    return '0'; // fallback for unknown types
  } catch (error) {
    qerrors(error, 'calculateContentLength', { body }); // log errors via qerrors
    throw error; // rethrow so caller handles invalid input
  }
}

// Export functions for CommonJS
module.exports = {
  formatDateTime,
  formatDuration,
  calculateContentLength
};

// Export functions for ES modules (if needed)
module.exports.default = module.exports;

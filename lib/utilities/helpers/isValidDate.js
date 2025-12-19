/**
 * Checks if a value is a valid Date object.
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a valid Date
 */
const isValidDate = (value) => value instanceof Date && !isNaN(value.getTime());

module.exports = isValidDate;

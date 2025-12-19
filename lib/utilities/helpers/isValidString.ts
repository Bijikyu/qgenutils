/**
 * Checks if a value is a non-empty string.
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a non-empty string
 */
const isValidString: any = (value) => typeof value === 'string' && value.trim().length > 0;

export default isValidString;

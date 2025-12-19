/**
 * Checks if a value is a valid Date object.
 * @param value - The value to check
 * @returns True if value is a valid Date
 */
const isValidDate: any = (value: unknown): boolean => value instanceof Date && !isNaN(value.getTime());

export default isValidDate;

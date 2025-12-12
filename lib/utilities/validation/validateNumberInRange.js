'use strict';

/**
 * Validates numeric field with range constraints in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} fieldName - Name of field to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.min] - Minimum allowed value
 * @param {number} [options.max] - Maximum allowed value
 * @param {boolean} [options.required=false] - Whether field is required
 * @param {Function} handler - Validation error handler
 * @returns {Promise<number|null>} Validated number or null if validation failed/missing
 * @example
 * const age = await validateNumberInRange(req, res, 'age', { min: 0, max: 120 }, handler);
 */
async function validateNumberInRange(req, res, fieldName, options = {}, handler) { // validate number in range
  const { min, max, required = false } = options;
  const value = req.body?.[fieldName];

  if (value === undefined || value === null) { // field not present
    if (required && handler) {
      await handler(res, `Missing required field: ${fieldName}`, fieldName);
    }
    return null;
  }

  const numValue = Number(value); // convert to number

  if (!Number.isFinite(numValue)) { // not a valid number
    if (handler) {
      await handler(res, `${fieldName} must be a number`, fieldName, {
        receivedValue: value,
        receivedType: typeof value
      });
    }
    return null;
  }

  if (min !== undefined && numValue < min) { // below minimum
    if (handler) {
      await handler(res, `${fieldName} must be at least ${min}`, fieldName, {
        receivedValue: numValue,
        min
      });
    }
    return null;
  }

  if (max !== undefined && numValue > max) { // above maximum
    if (handler) {
      await handler(res, `${fieldName} must be at most ${max}`, fieldName, {
        receivedValue: numValue,
        max
      });
    }
    return null;
  }

  return numValue; // valid number in range
}

module.exports = validateNumberInRange;

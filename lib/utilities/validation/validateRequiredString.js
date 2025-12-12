'use strict';

/**
 * Validates required string field in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} fieldName - Name of field to validate
 * @param {Function} handler - Validation error handler from createValidationErrorHandler
 * @returns {Promise<string|null>} Validated string value or null if validation failed
 * @example
 * const name = await validateRequiredString(req, res, 'name', errorHandler);
 * if (!name) return; // Response already sent
 */
async function validateRequiredString(req, res, fieldName, handler) { // validate required string field
  const value = req.body?.[fieldName];

  if (value === undefined || value === null || value === '') { // missing field
    await handler(res, `Missing required field: ${fieldName}`, fieldName, {
      receivedValue: value
    });
    return null;
  }

  if (typeof value !== 'string') { // wrong type
    await handler(res, `${fieldName} must be a string`, fieldName, {
      receivedValue: value,
      receivedType: typeof value
    });
    return null;
  }

  return value; // valid string
}

module.exports = validateRequiredString;

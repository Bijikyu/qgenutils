'use strict';

/**
 * Validates boolean field in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} fieldName - Name of field to validate
 * @param {Function} handler - Validation error handler
 * @param {boolean} [defaultValue=false] - Default value if field not present
 * @returns {Promise<boolean>} Validated boolean value or default
 * @example
 * const isActive = await validateBooleanField(req, res, 'active', handler, true);
 */
async function validateBooleanField(req, res, fieldName, handler, defaultValue = false) { // validate boolean field
  const value = req.body?.[fieldName];

  if (value === undefined || value === null) { // field not present
    return defaultValue;
  }

  if (typeof value === 'boolean') { // already boolean
    return value;
  }

  if (value === 'true' || value === '1') { // string true
    return true;
  }

  if (value === 'false' || value === '0') { // string false
    return false;
  }

  if (handler) { // invalid type
    await handler(res, `${fieldName} must be a boolean`, fieldName, {
      receivedValue: value,
      receivedType: typeof value
    });
  }

  return defaultValue; // fallback to default
}

module.exports = validateBooleanField;

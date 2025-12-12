'use strict';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/; // MongoDB ObjectId pattern

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - ObjectId string to validate
 * @param {string} [fieldName='id'] - Name of field for error messages
 * @returns {{error: string, details: string}|null} Validation error or null if valid
 * @example
 * validateObjectId('507f1f77bcf86cd799439011'); // null
 * validateObjectId('invalid-id'); // { error: '...' }
 */
function validateObjectId(id, fieldName = 'id') { // check valid ObjectId format
  if (typeof id !== 'string') { // must be string
    return {
      error: `Invalid ${fieldName} format`,
      details: `${fieldName} must be a string`
    };
  }

  if (!OBJECT_ID_REGEX.test(id)) { // doesn't match pattern
    return {
      error: `Invalid ${fieldName} format`,
      details: `${fieldName} must be a valid ObjectId`
    };
  }

  return null; // valid
}

module.exports = validateObjectId;

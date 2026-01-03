'use strict';

import validator from 'validator';

/**
 * Validates MongoDB ObjectId format using validator.isMongoId()
 * @param {string} id - ObjectId string to validate
 * @param {string} [fieldName='id'] - Name of field for error messages
 * @returns {{error: string, details: string}|null} Validation error or null if valid
 * @example
 * validateObjectId('507f1f77bcf86cd799439011'); // null
 * validateObjectId('invalid-id'); // { error: '...' }
 */
const validateObjectId = (id: any, fieldName: any = 'id'): any => {
  if (typeof id !== 'string') return {
    error: `Invalid ${fieldName} format`,
    details: `${fieldName} must be a string`
  };

  if (!validator.isMongoId(id)) {
    return {
      error: `Invalid ${fieldName} format`,
      details: `${fieldName} must be a valid 24-character hexadecimal string`
    };
  }

  return null;
};

export default validateObjectId;

/**
 * Non-throwing required fields validation returning structured result.
 *
 * PURPOSE: Provides a non-throwing validation interface that returns a
 * structured result object including the list of missing fields. Suitable
 * for API responses, form validation, and batch processing scenarios.
 *
 * @param {object} input - Input object containing validation parameters
 * @param {Record<string, unknown>} input.obj - Object to validate
 * @param {string[]} input.requiredFields - Array of field names that must be present
 * @returns {{isValid: boolean, missingFields: string[]}} Validation result with missing field list
 */

const isValidObject = require('./isValidObject');

function validateRequiredFieldsObj(input) {
  try {
    if (!isValidObject(input.obj)) {
      return { isValid: false, missingFields: input.requiredFields || [] };
    }

    if (!Array.isArray(input.requiredFields) || input.requiredFields.length === 0) {
      return { isValid: true, missingFields: [] };
    }

    const missing = input.requiredFields.filter(field => 
      !(field in input.obj) || input.obj[field] === undefined || input.obj[field] === null || input.obj[field] === ''
    );

    if (missing.length === 0) {
      return { isValid: true, missingFields: [] };
    }

    return { isValid: false, missingFields: missing };
  } catch (error) {
    const missing = input.requiredFields.filter(field => 
      !(field in input.obj) || input.obj[field] === undefined || input.obj[field] === null || input.obj[field] === ''
    );
    return { isValid: false, missingFields: missing };
  }
}

module.exports = validateRequiredFieldsObj;

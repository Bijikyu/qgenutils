/**
 * Validate Required Fields in Request Object
 * 
 * RATIONALE: API endpoints commonly require specific fields to be present and non-empty.
 * This utility standardizes field validation and error reporting, reducing code
 * duplication across route handlers and ensuring consistent error responses.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Check each required field for presence and non-empty values
 * - Automatically send validation error response when fields are missing
 * - Return boolean result so handlers can short-circuit processing
 * - Use response-utils for consistent error message formatting
 * - Handle edge cases like null objects and non-string fields gracefully
 * 
 * VALIDATION RULES:
 * - Fields must exist in the object
 * - Fields must not be null or undefined
 * - String fields must not be empty after trimming whitespace
 * - Number fields (including 0) and boolean fields are considered valid
 * - Empty arrays and objects are considered invalid for required fields
 * 
 * ERROR RESPONSE STRATEGY:
 * When validation fails, automatically sends HTTP 400 response with:
 * - Clear error message indicating missing fields
 * - List of specific fields that failed validation
 * - Consistent JSON format matching other API error responses
 * 
 * @param {object} data - Object to validate (typically req.body or req.query)
 * @param {string[]} fields - Array of field names that must be present
 * @param {object} res - Express response object for automatic error sending
 * @returns {boolean} True if all fields are valid, false if any are missing/invalid
 * @throws Never throws - validation errors are sent via HTTP response
 */

const { qerrors } = require(`qerrors`);
const logger = require(`../logger`);
const isValidObject = require(`./isValidObject`);
const isValidString = require(`./isValidString`);

function requireFields(data, fields, res) {
  logger.debug(`requireFields validating required fields`, { fields });
  
  try {
    // Handle edge cases gracefully
    if (!isValidObject(data)) {
      logger.warn(`requireFields validation failed: invalid data object`);
      
      if (res && typeof res.status === `function`) {
        return res.status(400).json({
          error: `Invalid request data`,
          details: `Request body must be a valid object`
        });
      }
      return false;
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      logger.warn(`requireFields validation failed: invalid fields specification`);
      return true; // No fields to validate
    }

    // Check each required field
    const missingFields = [];
    
    for (const field of fields) {
      const value = data[field];
      
      // Check if field exists and has a valid value
      if (value === null || value === undefined) {
        missingFields.push(field);
        continue;
      }
      
      // For strings, use our validation utility
      if (typeof value === `string` && !isValidString(value)) {
        missingFields.push(field);
        continue;
      }
      
      // For arrays, check if they're empty
      if (Array.isArray(value) && value.length === 0) {
        missingFields.push(field);
        continue;
      }
      
      // For objects (but not arrays), check if they're empty
      if (isValidObject(value) && Object.keys(value).length === 0) {
        missingFields.push(field);
        continue;
      }
    }

    // If all fields are valid, return true
    if (missingFields.length === 0) {
      
      logger.debug(`requireFields validation successful`);
      return true;
    }

    // Send validation error response
    const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
    
    logger.warn(`requireFields validation failed`, { missingFields });

    if (res && typeof res.status === `function`) {
      res.status(400).json({
        error: `Validation failed`,
        message: errorMessage,
        missingFields: missingFields
      });
    }

    return false;

  } catch (error) {
    
    qerrors(error, `requireFields`, { fields, dataKeys: data ? Object.keys(data) : `null` });
    logger.error(`requireFields failed with error`, { error: error.message });

    if (res && typeof res.status === `function`) {
      res.status(500).json({
        error: `Internal validation error`,
        message: `Unable to validate required fields`
      });
    }

    return false;
  }
}

module.exports = requireFields;
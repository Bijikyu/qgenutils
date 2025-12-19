'use strict';

/**
 * Creates a validator function for multiple validation rules
 * @param {Array<Function>} validations - Array of validation functions
 * @returns {Function} Validator function that runs all validations
 * @example
 * const validate = createValidator([
 *   (data) => validateRequired(data, ['name']),
 *   (data) => validateStringLength(data.name, 1, 100, 'name')
 * ]);
 * const errors: any = validate({ name: '' });
 */
function createValidator(validations) { // compose multiple validators
  if (!Array.isArray(validations)) { // must be array
    throw new Error('Validations must be an array');
  }

  return function validator(data) { // run all validations
    const errors: any = [];

    for (const validation of validations) {
      if (typeof validation !== 'function') continue; // skip non-functions
      const error: any = validation(data); // run validation
      if (error) {
        errors.push(error); // collect errors
      }
    }

    return errors.length === 0 ? null : { errors }; // return all errors or null
  };
}

export default createValidator;

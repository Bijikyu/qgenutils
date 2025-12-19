'use strict';

/**
 * Creates a resource-specific validator for CRUD operations
 * @param {string} resourceType - Type of resource
 * @param {Array<string>} requiredFields - Required fields for create
 * @param {Array<string>} allowedFields - Allowed fields for update
 * @param {Object} [fieldValidators={}] - Field-specific validation functions
 * @returns {{create: Function, update: Function}} Validators for create/update
 * @example
 * const userValidator: any = createResourceValidator('user', ['name', 'email'], ['name', 'email', 'bio']);
 * userValidator.create({ name: 'John' }); // { error: 'Missing...' }
 */
function createResourceValidator(resourceType, requiredFields, allowedFields, fieldValidators = {}) { // factory for CRUD validators
  return {
    create(data) { // validate create operation
      if (!data || typeof data !== 'object') {
        return { error: `Invalid ${resourceType} data` };
      }

      const missing = requiredFields.filter(field => // find missing required
        data[field] === undefined || data[field] === null || data[field] === ''
      );

      if (missing.length > 0) {
        return {
          error: `Missing required fields for ${resourceType}`,
          required: requiredFields,
          missing
        };
      }

      for (const [field, validator] of Object.entries(fieldValidators)) { // run field validators
        if (data[field] !== undefined && typeof validator === 'function') {
          const error: any = validator(data[field], field);
          if (error) return error;
        }
      }

      return null; // valid
    },

    update(data) { // validate update operation
      if (!data || typeof data !== 'object') {
        return { error: `Invalid ${resourceType} data` };
      }

      const keys: any = Object.keys(data);

      if (keys.length === 0) { // at least one field required
        return {
          error: `At least one field must be provided for ${resourceType} update`
        };
      }

      const invalidFields: any = keys.filter(field => !allowedFields.includes(field)); // find invalid fields

      if (invalidFields.length > 0) {
        return {
          error: `Invalid fields for ${resourceType} update`,
          allowedFields,
          invalidFields
        };
      }

      for (const [field, validator] of Object.entries(fieldValidators)) { // run field validators
        if (data[field] !== undefined && typeof validator === 'function') {
          const error: any = validator(data[field], field);
          if (error) return error;
        }
      }

      return null; // valid
    }
  };
}

export default createResourceValidator;

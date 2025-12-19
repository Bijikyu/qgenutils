'use strict';

/**
 * Shared test helpers for validation utilities
 * Eliminates duplicate test patterns across validation test files
 */

/**
 * Common test cases for null/undefined/non-string inputs
 * @param {Function} validator - Validation function to test
 * @param {string} [expectedErrorKey='invalid'] - Expected error key for failed validation
 */
const testInvalidInputTypes = (validator: any, expectedErrorKey: any = 'invalid'): any => {
  describe('invalid input types', (): any => {
    it('should reject null', (): any => {
      const result: any = validator(null);
      if (typeof result === 'boolean') {
        expect(result).toBe(false);
      } else {
        expect(result.isValid).toBe(false);
        if (result.errors && !result.errors.includes(expectedErrorKey)) {
          expect(result.errors.length).toBeGreaterThan(0);
        }
      }
    });

    it('should reject undefined', (): any => {
      const result: any = validator(undefined);
      if (typeof result === 'boolean') {
        expect(result).toBe(false);
      } else {
        expect(result.isValid).toBe(false);
        if (result.errors && !result.errors.includes(expectedErrorKey)) {
          expect(result.errors.length).toBeGreaterThan(0);
        }
      }
    });

    it('should reject non-string values', (): any => {
      expect(validator(123)).toBeFalsy();
      expect(validator({})).toBeFalsy();
      expect(validator([])).toBeFalsy();
    });

    it('should reject empty strings', (): any => {
      expect(validator('')).toBeFalsy();
      expect(validator('   ')).toBeFalsy();
    });
  });
};

/**
 * Common test cases for string validation with valid inputs
 * @param {Function} validator - Validation function to test
 * @param {Array<string>} validValues - Array of valid string values
 */
const testValidStringInputs = (validator: any, validValues: any): any => {
  describe('valid string inputs', (): any => {
    validValues.forEach((value: any) => {
      it(`should accept "${value}"`, (): any => {
        const result: any = validator(value);
        if (typeof result === 'boolean') {
          expect(result).toBe(true);
        } else {
          expect(result.isValid).toBe(true);
          expect(result.errors).toEqual([]);
        }
      });
    });
  });
};

/**
 * Common test cases for string validation with invalid inputs
 * @param {Function} validator - Validation function to test
 * @param {Array<string>} invalidValues - Array of invalid string values
 * @param {string|Function} [expectedError] - Expected error key or custom validator
 */
const testInvalidStringInputs = (validator: any, invalidValues: any, expectedError: any): any => {
  describe('invalid string inputs', (): any => {
    invalidValues.forEach((value: any) => {
      it(`should reject "${value}"`, (): any => {
        const result: any = validator(value);
        if (typeof result === 'boolean') {
          expect(result).toBe(false);
        } else {
          expect(result.isValid).toBe(false);
          if (typeof expectedError === 'string') {
            expect(result.errors).toContain(expectedError);
          } else if (typeof expectedError === 'function') {
            expectedError(result.errors);
          } else {
            expect(result.errors.length).toBeGreaterThan(0);
          }
        }
      });
    });
  });
};

/**
 * Common test cases for numeric validation
 * @param {Function} validator - Validation function to test
 * @param {Object} options - Test options
 * @param {Array<number>} options.valid - Array of valid numbers
 * @param {Array<number>} options.invalid - Array of invalid numbers
 * @param {string} [options.errorKey] - Expected error key
 */
const testNumericValidation = (validator: any, { valid, invalid, errorKey }: any): any => {
  if (valid) {
    describe('valid numeric inputs', (): any => {
      valid.forEach((value: any) => {
        it(`should accept ${value}`, (): any => {
          const result: any = validator(value);
          if (typeof result === 'boolean') {
            expect(result).toBe(true);
          } else {
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
          }
        });
      });
    });
  }

  if (invalid) {
    describe('invalid numeric inputs', (): any => {
      invalid.forEach((value: any) => {
        it(`should reject ${value}`, (): any => {
          const result: any = validator(value);
          if (typeof result === 'boolean') {
            expect(result).toBe(false);
          } else {
            expect(result.isValid).toBe(false);
            if (errorKey) {
              expect(result.errors).toContain(errorKey);
            } else {
              expect(result.errors.length).toBeGreaterThan(0);
            }
          }
        });
      });
    });
  }
};

export default {
  testInvalidInputTypes,
  testValidStringInputs,
  testInvalidStringInputs,
  testNumericValidation
};
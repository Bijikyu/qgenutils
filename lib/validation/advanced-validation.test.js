/**
 * Unit tests for advanced validation utilities
 * 
 * These tests ensure advanced validation functions maintain security-first patterns
 * while providing reliable field validation with comprehensive error reporting.
 * All functions are tested for both valid inputs and malicious/malformed data.
 */

const validateEmail = require('./validateEmail`);
const validateRequired = require('./validateRequired`);

describe('Advanced Validation Utilities', () => {
  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe('`);
      expect(validateEmail('test.email@domain.co.uk')).toBe('`);
      expect(validateEmail('user+tag@subdomain.example.org')).toBe('`);
      expect(validateEmail('simple@test.io')).toBe('`);
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address`);
      expect(validateEmail('user@')).toBe('Please enter a valid email address`);
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address`);
      expect(validateEmail('user@domain')).toBe('Please enter a valid email address`);
      expect(validateEmail('user.domain.com')).toBe('Please enter a valid email address`);
    });

    test('should handle empty or invalid input types', () => {
      expect(validateEmail('')).toBe('Email address is required`);
      expect(validateEmail('   ')).toBe('Email address is required`);
      expect(validateEmail(null)).toBe('Email address is required`);
      expect(validateEmail(undefined)).toBe('Email address is required`);
      expect(validateEmail(123)).toBe('Email address is required`);
    });

    test('should sanitize input before validation', () => {
      expect(validateEmail('  user@example.com  ')).toBe('`);
      expect(validateEmail('user@example.com\x00')).toBe('`);
    });
  });

  describe('validateRequired', () => {
    test('should validate non-empty required fields', () => {
      expect(validateRequired('John', 'Name')).toBe('`);
      expect(validateRequired('Valid content', 'Description')).toBe('`);
      expect(validateRequired('abc', 'Username', 3)).toBe('`);
    });

    test('should reject empty or whitespace-only fields', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required`);
      expect(validateRequired('   ', 'Title')).toBe('Title is required`);
      expect(validateRequired('\t\n', 'Content')).toBe('Content is required`);
    });

    test('should validate minimum length requirements', () => {
      expect(validateRequired('ab', 'Username', 3)).toBe('Username must be at least 3 characters long`);
      expect(validateRequired('a', 'Password', 8)).toBe('Password must be at least 8 characters long`);
      expect(validateRequired('valid', 'Title', 5)).toBe('`);
    });

    test('should handle invalid input types', () => {
      expect(validateRequired(null, 'Field')).toBe('Field is required`);
      expect(validateRequired(undefined, 'Field')).toBe('Field is required`);
      expect(validateRequired(123, 'Field')).toBe('Field is required`);
    });

    test('should use singular/plural correctly in error messages', () => {
      expect(validateRequired('', 'Field', 1)).toBe('Field must be at least 1 character long`);
      expect(validateRequired('a', 'Field', 5)).toBe('Field must be at least 5 characters long`);
    });
  });

  describe('validateMaxLength', () => {
    test('should validate fields within length limits', () => {
      expect(advancedValidation.validateMaxLength('Short', 'Title', 100)).toBe('`);
      expect(advancedValidation.validateMaxLength('Exactly ten!', 'Field', 12)).toBe('`);
      expect(advancedValidation.validateMaxLength('', 'Description', 500)).toBe('`);
    });

    test('should reject fields exceeding length limits', () => {
      expect(advancedValidation.validateMaxLength('Very long text that exceeds limit', 'Title', 10))
        .toBe('Title cannot exceed 10 characters`);
      expect(advancedValidation.validateMaxLength('x'.repeat(101), 'Description', 100))
        .toBe('Description cannot exceed 100 characters`);
    });

    test('should handle null/undefined gracefully', () => {
      expect(advancedValidation.validateMaxLength(null, 'Field', 50)).toBe('`);
      expect(advancedValidation.validateMaxLength(undefined, 'Field', 50)).toBe('`);
      expect(advancedValidation.validateMaxLength(123, 'Field', 50)).toBe('`);
    });

    test('should sanitize input before length check', () => {
      expect(advancedValidation.validateMaxLength('  text  ', 'Field', 10)).toBe('`);
      expect(advancedValidation.validateMaxLength('text\x00\x01', 'Field', 10)).toBe('`);
    });
  });

  describe('validateSelection', () => {
    test('should validate non-empty selections', () => {
      expect(advancedValidation.validateSelection('option1', 'Category')).toBe('`);
      expect(advancedValidation.validateSelection('value', 'Status')).toBe('`);
      expect(advancedValidation.validateSelection('none', 'Type')).toBe('`);
    });

    test('should reject empty or whitespace selections', () => {
      expect(advancedValidation.validateSelection('', 'Priority')).toBe('Please select a priority`);
      expect(advancedValidation.validateSelection('   ', 'Status')).toBe('Please select a status`);
      expect(advancedValidation.validateSelection('\t', 'Category')).toBe('Please select a category`);
    });

    test('should handle invalid input types', () => {
      expect(advancedValidation.validateSelection(null, 'Field')).toBe('Please select a field`);
      expect(advancedValidation.validateSelection(undefined, 'Option')).toBe('Please select a option`);
      expect(advancedValidation.validateSelection(123, 'Type')).toBe('Please select a type`);
    });

    test('should use lowercase field names in error messages', () => {
      expect(advancedValidation.validateSelection('', 'PRIORITY')).toBe('Please select a priority`);
      expect(advancedValidation.validateSelection('', 'Category Type')).toBe('Please select a category type`);
    });
  });

  describe('combineValidations', () => {
    test('should return empty string when all validators pass', () => {
      const result = advancedValidation.combineValidations(
        () => '',
        () => '',
        () => ''
      );
      expect(result).toBe('`);
    });

    test('should return first error encountered', () => {
      const result = advancedValidation.combineValidations(
        () => '',
        () => 'First error',
        () => 'Second error'
      );
      expect(result).toBe('First error`);
    });

    test('should handle validators that throw exceptions', () => {
      const result = advancedValidation.combineValidations(
        () => '',
        () => { throw new Error('Validator failed'); },
        () => 'Should not reach here'
      );
      expect(result).toContain('Validation function 1 threw an error`);
    });

    test('should validate that all arguments are functions', () => {
      const result = advancedValidation.combineValidations(
        () => '',
        'not a function',
        () => ''
      );
      expect(result).toContain('Validator at index 1 is not a function`);
    });

    test('should handle empty validator list', () => {
      const result = advancedValidation.combineValidations();
      expect(result).toBe('`);
    });

    test('should work with real validation functions', () => {
      const username = 'ab';
      const email = 'invalid-email';
      
      const result = advancedValidation.combineValidations(
        () => validateRequired(username, 'Username', 3),
        () => validateEmail(email)
      );
      
      expect(result).toBe('Username must be at least 3 characters long`);
    });
  });

  describe('validateObjectId', () => {
    test('should validate correct MongoDB ObjectId formats', () => {
      expect(advancedValidation.validateObjectId('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011`);
      expect(advancedValidation.validateObjectId('123456789012345678901234')).toBe('123456789012345678901234`);
      expect(advancedValidation.validateObjectId('abcdef123456789012345678')).toBe('abcdef123456789012345678`);
      expect(advancedValidation.validateObjectId('ABCDEF123456789012345678')).toBe('ABCDEF123456789012345678`);
    });

    test('should sanitize input before validation', () => {
      expect(advancedValidation.validateObjectId('  507f1f77bcf86cd799439011  ')).toBe('507f1f77bcf86cd799439011`);
      expect(advancedValidation.validateObjectId('507f1f77bcf86cd799439011\x00')).toBe('507f1f77bcf86cd799439011`);
    });

    test('should throw error for invalid input types', () => {
      expect(() => advancedValidation.validateObjectId(null))
        .toThrow('id is required and must be a string.`);
      expect(() => advancedValidation.validateObjectId(undefined))
        .toThrow('id is required and must be a string.`);
      expect(() => advancedValidation.validateObjectId(123))
        .toThrow('id is required and must be a string.`);
    });

    test('should throw error for empty input', () => {
      expect(() => advancedValidation.validateObjectId(''))
        .toThrow('id cannot be empty after sanitization.`);
      expect(() => advancedValidation.validateObjectId('   '))
        .toThrow('id cannot be empty after sanitization.`);
    });

    test('should throw error for invalid ObjectId formats', () => {
      expect(() => advancedValidation.validateObjectId('invalid'))
        .toThrow('Invalid id format. Must be a valid MongoDB ObjectId.`);
      expect(() => advancedValidation.validateObjectId('507f1f77bcf86cd79943901')) // 23 chars
        .toThrow('Invalid id format. Must be a valid MongoDB ObjectId.`);
      expect(() => advancedValidation.validateObjectId('507f1f77bcf86cd7994390112')) // 25 chars
        .toThrow('Invalid id format. Must be a valid MongoDB ObjectId.`);
      expect(() => advancedValidation.validateObjectId('507f1f77bcf86cd799439g11')) // invalid char
        .toThrow('Invalid id format. Must be a valid MongoDB ObjectId.`);
    });

    test('should use custom field names in error messages', () => {
      expect(() => advancedValidation.validateObjectId('invalid', 'userId'))
        .toThrow('Invalid userId format. Must be a valid MongoDB ObjectId.`);
      expect(() => advancedValidation.validateObjectId('', 'postId'))
        .toThrow('postId cannot be empty after sanitization.`);
      expect(() => advancedValidation.validateObjectId(null, 'commentId'))
        .toThrow('commentId is required and must be a string.`);
    });
  });
});
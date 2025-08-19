/**
 * Unit tests for advanced validation utilities
 * 
 * These tests ensure advanced validation functions maintain security-first patterns
 * while providing reliable field validation with comprehensive error reporting.
 * All functions are tested for both valid inputs and malicious/malformed data.
 */

const validateEmail = require('./validateEmail');
const validateRequired = require('./validateRequired');

describe('Advanced Validation Utilities', () => {
  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe('');
      expect(validateEmail('test.email@domain.co.uk')).toBe('');
      expect(validateEmail('user+tag@subdomain.example.org')).toBe('');
      expect(validateEmail('simple@test.io')).toBe('');
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
      expect(validateEmail('user@')).toBe('Please enter a valid email address');
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address');
      expect(validateEmail('user@domain')).toBe('Please enter a valid email address');
      expect(validateEmail('user.domain.com')).toBe('Please enter a valid email address');
    });

    test('should handle empty or invalid input types', () => {
      expect(validateEmail('')).toBe('Email address is required');
      expect(validateEmail('   ')).toBe('Email address is required');
      expect(validateEmail(null)).toBe('Email address is required');
      expect(validateEmail(undefined)).toBe('Email address is required');
      expect(validateEmail(123)).toBe('Email address is required');
    });

    test('should sanitize input before validation', () => {
      expect(validateEmail('  user@example.com  ')).toBe('');
      expect(validateEmail('user@example.com\x00')).toBe('');
    });
  });

  describe('validateRequired', () => {
    test('should accept valid non-empty values', () => {
      expect(validateRequired('test', 'Field')).toBe('');
      expect(validateRequired('valid input', 'Input')).toBe('');
      expect(validateRequired('123', 'Number')).toBe('');
    });

    test('should reject empty or invalid values', () => {
      expect(validateRequired('', 'Field')).toBe('Field is required');
      expect(validateRequired('   ', 'Field')).toBe('Field is required');
      expect(validateRequired(null, 'Field')).toBe('Field is required');
      expect(validateRequired(undefined, 'Field')).toBe('Field is required');
    });
  });
});
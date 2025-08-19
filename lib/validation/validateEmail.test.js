const validateEmail = require('./validateEmail');

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
  });
});
const validateRequired = require('./validateRequired');

describe('validateRequired', () => {
  test('should accept valid non-empty values', () => {
    expect(validateRequired('test', 'Field')).toBe('');
    expect(validateRequired('valid input', 'Input')).toBe('');
    expect(validateRequired('123', 'Number')).toBe('');
    expect(validateRequired('0', 'Zero')).toBe('');
  });

  test('should reject empty or invalid values', () => {
    expect(validateRequired('', 'Field')).toBe('Field is required');
    expect(validateRequired('   ', 'Field')).toBe('Field is required');
    expect(validateRequired(null, 'Field')).toBe('Field is required');
    expect(validateRequired(undefined, 'Field')).toBe('Field is required');
  });

  test('should handle custom field names', () => {
    expect(validateRequired('', 'Username')).toBe('Username is required');
    expect(validateRequired('', 'Email Address')).toBe('Email Address is required');
  });

  test('should handle non-string inputs', () => {
    expect(validateRequired(0, 'Number')).toBe('Number is required');
    expect(validateRequired(false, 'Boolean')).toBe('Boolean is required');
  });
});
const validateInputString = require('./validateInputString');

describe('validateInputString', () => {
  it('should not throw for valid non-empty string', () => {
    expect(() => validateInputString('hello')).not.toThrow();
    expect(() => validateInputString('a')).not.toThrow();
  });

  it('should throw for empty string', () => {
    expect(() => validateInputString('')).toThrow('Invalid input: must be a non-empty string');
  });

  it('should throw for whitespace-only string', () => {
    expect(() => validateInputString('   ')).toThrow('Invalid input: must be a non-empty string');
    expect(() => validateInputString('\t\n')).toThrow('Invalid input: must be a non-empty string');
  });

  it('should throw for null', () => {
    expect(() => validateInputString(null)).toThrow('Invalid input: must be a non-empty string');
  });

  it('should throw for undefined', () => {
    expect(() => validateInputString(undefined)).toThrow('Invalid input: must be a non-empty string');
  });

  it('should throw for number', () => {
    expect(() => validateInputString(123)).toThrow('Invalid input: must be a non-empty string');
  });

  it('should throw for object', () => {
    expect(() => validateInputString({})).toThrow('Invalid input: must be a non-empty string');
  });

  it('should use custom field name in error message', () => {
    expect(() => validateInputString('', 'username')).toThrow('Invalid username: must be a non-empty string');
    expect(() => validateInputString(null, 'email')).toThrow('Invalid email: must be a non-empty string');
  });

  it('should default fieldName to input', () => {
    expect(() => validateInputString('')).toThrow('Invalid input: must be a non-empty string');
  });
});

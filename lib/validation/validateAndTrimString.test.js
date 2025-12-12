const validateAndTrimString = require('./validateAndTrimString');

describe('validateAndTrimString', () => {
  it('should trim whitespace from valid strings', () => {
    expect(validateAndTrimString('  hello  ')).toBe('hello');
    expect(validateAndTrimString('test')).toBe('test');
    expect(validateAndTrimString('  leading')).toBe('leading');
    expect(validateAndTrimString('trailing  ')).toBe('trailing');
  });

  it('should return empty string for non-string inputs', () => {
    expect(validateAndTrimString(null)).toBe('');
    expect(validateAndTrimString(undefined)).toBe('');
    expect(validateAndTrimString(123)).toBe('');
    expect(validateAndTrimString({})).toBe('');
    expect(validateAndTrimString([])).toBe('');
    expect(validateAndTrimString(true)).toBe('');
  });

  it('should return empty string for empty or whitespace-only strings', () => {
    expect(validateAndTrimString('')).toBe('');
    expect(validateAndTrimString('   ')).toBe('');
    expect(validateAndTrimString('\t\n')).toBe('');
  });

  it('should accept optional fieldName parameter', () => {
    expect(validateAndTrimString('value', 'username')).toBe('value');
    expect(validateAndTrimString(null, 'email')).toBe('');
  });

  it('should preserve internal whitespace', () => {
    expect(validateAndTrimString('  hello world  ')).toBe('hello world');
    expect(validateAndTrimString('a  b  c')).toBe('a  b  c');
  });
});

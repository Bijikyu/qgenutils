const validateRequiredFields = require('./validateRequiredFields');

describe('validateRequiredFields', () => {
  it('should not throw when all required fields are present', () => {
    expect(() => validateRequiredFields({ name: 'John', email: 'john@test.com' }, ['name', 'email'])).not.toThrow();
  });

  it('should not throw for empty required fields array', () => {
    expect(() => validateRequiredFields({}, [])).not.toThrow();
  });

  it('should not throw when no required fields specified', () => {
    expect(() => validateRequiredFields({ name: 'John' }, null)).not.toThrow();
  });

  it('should throw when field is missing', () => {
    expect(() => validateRequiredFields({ name: 'John' }, ['name', 'email'])).toThrow('Missing required fields: email');
  });

  it('should throw when field is undefined', () => {
    expect(() => validateRequiredFields({ name: 'John', email: undefined }, ['name', 'email'])).toThrow('Missing required fields: email');
  });

  it('should throw when field is null', () => {
    expect(() => validateRequiredFields({ name: 'John', email: null }, ['name', 'email'])).toThrow('Missing required fields: email');
  });

  it('should throw when field is empty string', () => {
    expect(() => validateRequiredFields({ name: 'John', email: '' }, ['name', 'email'])).toThrow('Missing required fields: email');
  });

  it('should list multiple missing fields', () => {
    expect(() => validateRequiredFields({}, ['name', 'email', 'age'])).toThrow('Missing required fields: name, email, age');
  });

  it('should throw for non-object input', () => {
    expect(() => validateRequiredFields(null, ['name'])).toThrow('Invalid input: must be a plain object');
    expect(() => validateRequiredFields('string', ['name'])).toThrow('Invalid input: must be a plain object');
    expect(() => validateRequiredFields([], ['name'])).toThrow('Invalid input: must be a plain object');
  });

  it('should accept 0 as valid value', () => {
    expect(() => validateRequiredFields({ count: 0 }, ['count'])).not.toThrow();
  });

  it('should accept false as valid value', () => {
    expect(() => validateRequiredFields({ active: false }, ['active'])).not.toThrow();
  });
});

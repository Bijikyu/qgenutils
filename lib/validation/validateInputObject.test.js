const validateInputObject = require('./validateInputObject');

describe('validateInputObject', () => {
  it('should not throw for valid plain object', () => {
    expect(() => validateInputObject({})).not.toThrow();
    expect(() => validateInputObject({ key: 'value' })).not.toThrow();
  });

  it('should throw for null', () => {
    expect(() => validateInputObject(null)).toThrow('Invalid input: must be a plain object');
  });

  it('should throw for undefined', () => {
    expect(() => validateInputObject(undefined)).toThrow('Invalid input: must be a plain object');
  });

  it('should throw for array', () => {
    expect(() => validateInputObject([])).toThrow('Invalid input: must be a plain object');
    expect(() => validateInputObject([1, 2, 3])).toThrow('Invalid input: must be a plain object');
  });

  it('should throw for string', () => {
    expect(() => validateInputObject('string')).toThrow('Invalid input: must be a plain object');
  });

  it('should throw for number', () => {
    expect(() => validateInputObject(123)).toThrow('Invalid input: must be a plain object');
  });

  it('should use custom field name in error message', () => {
    expect(() => validateInputObject(null, 'config')).toThrow('Invalid config: must be a plain object');
    expect(() => validateInputObject([], 'options')).toThrow('Invalid options: must be a plain object');
  });

  it('should default fieldName to input', () => {
    expect(() => validateInputObject(null)).toThrow('Invalid input: must be a plain object');
  });
});

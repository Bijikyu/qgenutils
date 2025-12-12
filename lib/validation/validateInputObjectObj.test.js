const validateInputObjectObj = require('./validateInputObjectObj');

describe('validateInputObjectObj', () => {
  it('should return isValid true for valid plain object', () => {
    expect(validateInputObjectObj({ obj: {} })).toEqual({ isValid: true });
    expect(validateInputObjectObj({ obj: { key: 'value' } })).toEqual({ isValid: true });
  });

  it('should return isValid false for null', () => {
    expect(validateInputObjectObj({ obj: null })).toEqual({ isValid: false });
  });

  it('should return isValid false for undefined', () => {
    expect(validateInputObjectObj({ obj: undefined })).toEqual({ isValid: false });
  });

  it('should return isValid false for array', () => {
    expect(validateInputObjectObj({ obj: [] })).toEqual({ isValid: false });
    expect(validateInputObjectObj({ obj: [1, 2, 3] })).toEqual({ isValid: false });
  });

  it('should return isValid false for string', () => {
    expect(validateInputObjectObj({ obj: 'string' })).toEqual({ isValid: false });
  });

  it('should return isValid false for number', () => {
    expect(validateInputObjectObj({ obj: 123 })).toEqual({ isValid: false });
  });

  it('should accept optional fieldName', () => {
    expect(validateInputObjectObj({ obj: {}, fieldName: 'config' })).toEqual({ isValid: true });
    expect(validateInputObjectObj({ obj: null, fieldName: 'config' })).toEqual({ isValid: false });
  });
});

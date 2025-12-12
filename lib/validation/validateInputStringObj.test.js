const validateInputStringObj = require('./validateInputStringObj');

describe('validateInputStringObj', () => {
  it('should return isValid true for valid non-empty string', () => {
    expect(validateInputStringObj({ str: 'hello' })).toEqual({ isValid: true });
    expect(validateInputStringObj({ str: 'a' })).toEqual({ isValid: true });
  });

  it('should return isValid false for empty string', () => {
    expect(validateInputStringObj({ str: '' })).toEqual({ isValid: false });
  });

  it('should return isValid false for whitespace-only string', () => {
    expect(validateInputStringObj({ str: '   ' })).toEqual({ isValid: false });
  });

  it('should return isValid false for null', () => {
    expect(validateInputStringObj({ str: null })).toEqual({ isValid: false });
  });

  it('should return isValid false for undefined', () => {
    expect(validateInputStringObj({ str: undefined })).toEqual({ isValid: false });
  });

  it('should return isValid false for number', () => {
    expect(validateInputStringObj({ str: 123 })).toEqual({ isValid: false });
  });

  it('should return isValid false for object', () => {
    expect(validateInputStringObj({ str: {} })).toEqual({ isValid: false });
  });

  it('should accept optional fieldName', () => {
    expect(validateInputStringObj({ str: 'valid', fieldName: 'username' })).toEqual({ isValid: true });
    expect(validateInputStringObj({ str: '', fieldName: 'username' })).toEqual({ isValid: false });
  });
});

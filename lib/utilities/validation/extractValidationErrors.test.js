'use strict';

const extractValidationErrors = require('./extractValidationErrors');

describe('extractValidationErrors', () => {
  it('should extract errors from express-validator result', () => {
    const mockErrors = {
      array: () => [
        { path: 'email', msg: 'Invalid email', value: 'bad-email' },
        { path: 'password', msg: 'Too short', value: 'abc' }
      ]
    };

    const result = extractValidationErrors(mockErrors);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      field: 'email',
      message: 'Invalid email',
      value: 'bad-email'
    });
    expect(result[1]).toEqual({
      field: 'password',
      message: 'Too short',
      value: 'abc'
    });
  });

  it('should sanitize error messages', () => {
    const mockErrors = {
      array: () => [
        { path: 'field', msg: '<script>alert(1)</script>Error', value: 'test' }
      ]
    };

    const result = extractValidationErrors(mockErrors);
    expect(result[0].message).toBe('Error');
  });

  it('should use param as fallback for field', () => {
    const mockErrors = {
      array: () => [
        { param: 'legacyField', msg: 'Error', value: 'test' }
      ]
    };

    const result = extractValidationErrors(mockErrors);
    expect(result[0].field).toBe('legacyField');
  });

  it('should use unknown for missing field', () => {
    const mockErrors = {
      array: () => [
        { msg: 'Error', value: 'test' }
      ]
    };

    const result = extractValidationErrors(mockErrors);
    expect(result[0].field).toBe('unknown');
  });

  it('should throw for invalid input', () => {
    expect(() => extractValidationErrors(null)).toThrow('Invalid validation errors object');
    expect(() => extractValidationErrors({})).toThrow('Invalid validation errors object');
    expect(() => extractValidationErrors([])).toThrow('Invalid validation errors object');
  });
});

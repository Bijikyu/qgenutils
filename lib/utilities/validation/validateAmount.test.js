'use strict';

const validateAmount = require('./validateAmount');

describe('validateAmount', () => {
  it('should return valid for proper amounts', () => {
    expect(validateAmount(99.99)).toEqual({ isValid: true, errors: [] });
    expect(validateAmount(0.01)).toEqual({ isValid: true, errors: [] });
    expect(validateAmount(999999.99)).toEqual({ isValid: true, errors: [] });
    expect(validateAmount(100)).toEqual({ isValid: true, errors: [] });
  });

  it('should reject string amounts', () => {
    const result = validateAmount('100');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('not_number');
  });

  it('should reject null and undefined', () => {
    expect(validateAmount(null).errors).toContain('not_number');
    expect(validateAmount(undefined).errors).toContain('not_number');
  });

  it('should reject zero amount', () => {
    const result = validateAmount(0);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('zero_amount');
  });

  it('should reject negative amounts', () => {
    const result = validateAmount(-50);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('negative_amount');
  });

  it('should reject too many decimals', () => {
    const result = validateAmount(10.999);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('too_many_decimals');
  });

  it('should reject amounts exceeding limit', () => {
    const result = validateAmount(1000000);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('exceeds_limit');
  });

  it('should reject NaN and Infinity', () => {
    expect(validateAmount(NaN).errors).toContain('not_number');
    expect(validateAmount(Infinity).errors).toContain('not_number');
    expect(validateAmount(-Infinity).errors).toContain('not_number');
  });
});

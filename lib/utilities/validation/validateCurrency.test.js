'use strict';

const validateCurrency = require('./validateCurrency');

describe('validateCurrency', () => {
  it('should return true for supported currencies', () => {
    expect(validateCurrency('USD')).toBe(true);
    expect(validateCurrency('EUR')).toBe(true);
    expect(validateCurrency('GBP')).toBe(true);
    expect(validateCurrency('CAD')).toBe(true);
    expect(validateCurrency('AUD')).toBe(true);
    expect(validateCurrency('JPY')).toBe(true);
  });

  it('should return false for unsupported currencies', () => {
    expect(validateCurrency('XYZ')).toBe(false);
    expect(validateCurrency('BTC')).toBe(false);
    expect(validateCurrency('INR')).toBe(false);
  });

  it('should be case-sensitive', () => {
    expect(validateCurrency('usd')).toBe(false);
    expect(validateCurrency('Usd')).toBe(false);
  });

  it('should return false for null/undefined/non-string', () => {
    expect(validateCurrency(null)).toBe(false);
    expect(validateCurrency(undefined)).toBe(false);
    expect(validateCurrency(123)).toBe(false);
    expect(validateCurrency({})).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateCurrency('')).toBe(false);
  });
});

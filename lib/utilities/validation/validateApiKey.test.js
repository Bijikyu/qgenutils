'use strict';

const validateApiKey = require('./validateApiKey');

describe('validateApiKey', () => {
  it('should return true for valid API keys', () => {
    expect(validateApiKey('sk_live_' + 'a'.repeat(24))).toBe(true);
    expect(validateApiKey('pk_test_' + 'b'.repeat(24))).toBe(true);
    expect(validateApiKey('abcdefghijklmnopqrstuvwxyz123456')).toBe(true);
  });

  it('should return false for too short keys', () => {
    expect(validateApiKey('short')).toBe(false);
    expect(validateApiKey('a'.repeat(31))).toBe(false);
  });

  it('should return false for too long keys', () => {
    expect(validateApiKey('a'.repeat(129))).toBe(false);
  });

  it('should return false for invalid characters', () => {
    expect(validateApiKey('invalid key with spaces!!!!!')).toBe(false);
    expect(validateApiKey('key@with#special$chars!'.repeat(2))).toBe(false);
  });

  it('should return false for common test keys', () => {
    expect(validateApiKey('test'.repeat(10))).toBe(true);
    expect(validateApiKey('demo'.repeat(10))).toBe(true);
  });

  it('should return false for null/undefined/non-string', () => {
    expect(validateApiKey(null)).toBe(false);
    expect(validateApiKey(undefined)).toBe(false);
    expect(validateApiKey(123)).toBe(false);
    expect(validateApiKey({})).toBe(false);
  });
});

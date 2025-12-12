'use strict';

const validateSubscriptionPlan = require('./validateSubscriptionPlan');

describe('validateSubscriptionPlan', () => {
  it('should return true for supported plans', () => {
    expect(validateSubscriptionPlan('basic')).toBe(true);
    expect(validateSubscriptionPlan('premium')).toBe(true);
    expect(validateSubscriptionPlan('enterprise')).toBe(true);
    expect(validateSubscriptionPlan('trial')).toBe(true);
  });

  it('should normalize case', () => {
    expect(validateSubscriptionPlan('BASIC')).toBe(true);
    expect(validateSubscriptionPlan('Premium')).toBe(true);
    expect(validateSubscriptionPlan('ENTERPRISE')).toBe(true);
  });

  it('should trim whitespace', () => {
    expect(validateSubscriptionPlan('  basic  ')).toBe(true);
    expect(validateSubscriptionPlan('\tpremium\n')).toBe(true);
  });

  it('should return false for unsupported plans', () => {
    expect(validateSubscriptionPlan('unknown')).toBe(false);
    expect(validateSubscriptionPlan('pro')).toBe(false);
    expect(validateSubscriptionPlan('free')).toBe(false);
  });

  it('should return false for null/undefined/non-string', () => {
    expect(validateSubscriptionPlan(null)).toBe(false);
    expect(validateSubscriptionPlan(undefined)).toBe(false);
    expect(validateSubscriptionPlan(123)).toBe(false);
    expect(validateSubscriptionPlan({})).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateSubscriptionPlan('')).toBe(false);
  });
});

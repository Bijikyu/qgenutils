const defaultChargeRetryPlanObj = require('./defaultChargeRetryPlanObj');

describe('defaultChargeRetryPlanObj', () => {
  it('should return object with plan property', () => {
    const result = defaultChargeRetryPlanObj({});
    expect(result).toHaveProperty('plan');
    expect(Array.isArray(result.plan)).toBe(true);
  });

  it('should default to 3 attempts when no maxAttempts provided', () => {
    const result = defaultChargeRetryPlanObj({});
    expect(result.plan).toHaveLength(3);
  });

  it('should use provided maxAttempts', () => {
    const result = defaultChargeRetryPlanObj({ maxAttempts: 5 });
    expect(result.plan).toHaveLength(5);
  });

  it('should work with empty object', () => {
    const result = defaultChargeRetryPlanObj({});
    expect(result.plan).toHaveLength(3);
  });

  it('should work with no arguments', () => {
    const result = defaultChargeRetryPlanObj();
    expect(result.plan).toHaveLength(3);
  });

  it('should throw for null params', () => {
    expect(() => defaultChargeRetryPlanObj(null)).toThrow('Parameter must be an object');
  });

  it('should throw for non-object params', () => {
    expect(() => defaultChargeRetryPlanObj('string')).toThrow('Parameter must be an object');
    expect(() => defaultChargeRetryPlanObj(123)).toThrow('Parameter must be an object');
  });

  it('should return correct structure for each plan entry', () => {
    const result = defaultChargeRetryPlanObj({ maxAttempts: 2 });
    expect(result.plan[0]).toEqual({ attempt: 1, delayMs: 0 });
    expect(result.plan[1]).toEqual({ attempt: 2, delayMs: 24 * 3600 * 1000 });
  });

  it('should handle maxAttempts of 1', () => {
    const result = defaultChargeRetryPlanObj({ maxAttempts: 1 });
    expect(result.plan).toHaveLength(1);
  });

  it('should return empty plan for maxAttempts of 0', () => {
    const result = defaultChargeRetryPlanObj({ maxAttempts: 0 });
    expect(result.plan).toEqual([]);
  });
});

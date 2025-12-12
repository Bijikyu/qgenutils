const defaultChargeRetryPlan = require('./defaultChargeRetryPlan');

describe('defaultChargeRetryPlan', () => {
  it('should return 3 attempts by default', () => {
    const plan = defaultChargeRetryPlan();
    expect(plan).toHaveLength(3);
  });

  it('should return correct attempt numbers', () => {
    const plan = defaultChargeRetryPlan(3);
    expect(plan[0].attempt).toBe(1);
    expect(plan[1].attempt).toBe(2);
    expect(plan[2].attempt).toBe(3);
  });

  it('should have 0ms delay for first attempt', () => {
    const plan = defaultChargeRetryPlan();
    expect(plan[0].delayMs).toBe(0);
  });

  it('should have 24 hours delay for second attempt', () => {
    const plan = defaultChargeRetryPlan();
    expect(plan[1].delayMs).toBe(24 * 3600 * 1000);
  });

  it('should have 72 hours delay for third attempt', () => {
    const plan = defaultChargeRetryPlan();
    expect(plan[2].delayMs).toBe(72 * 3600 * 1000);
  });

  it('should extend with 48-hour intervals after base schedule', () => {
    const plan = defaultChargeRetryPlan(5);
    expect(plan).toHaveLength(5);
    expect(plan[3].delayMs).toBe((72 + 48) * 3600 * 1000);
    expect(plan[4].delayMs).toBe((72 + 48 * 2) * 3600 * 1000);
  });

  it('should return single attempt when maxAttempts is 1', () => {
    const plan = defaultChargeRetryPlan(1);
    expect(plan).toHaveLength(1);
    expect(plan[0]).toEqual({ attempt: 1, delayMs: 0 });
  });

  it('should return empty array for 0 attempts', () => {
    const plan = defaultChargeRetryPlan(0);
    expect(plan).toEqual([]);
  });

  it('should return empty array for negative attempts', () => {
    const plan = defaultChargeRetryPlan(-1);
    expect(plan).toEqual([]);
  });

  it('should return empty array for non-integer attempts', () => {
    const plan = defaultChargeRetryPlan(2.5);
    expect(plan).toEqual([]);
  });

  it('should return empty array for NaN', () => {
    const plan = defaultChargeRetryPlan(NaN);
    expect(plan).toEqual([]);
  });

  it('should return empty array for Infinity', () => {
    const plan = defaultChargeRetryPlan(Infinity);
    expect(plan).toEqual([]);
  });

  it('should default to 3 for null', () => {
    const plan = defaultChargeRetryPlan(null);
    expect(plan).toHaveLength(3);
  });

  it('should default to 3 for undefined', () => {
    const plan = defaultChargeRetryPlan(undefined);
    expect(plan).toHaveLength(3);
  });

  it('should handle large number of attempts', () => {
    const plan = defaultChargeRetryPlan(10);
    expect(plan).toHaveLength(10);
    expect(plan[9].attempt).toBe(10);
  });
});

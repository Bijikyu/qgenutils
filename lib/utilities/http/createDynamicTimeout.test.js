const createDynamicTimeout = require('./createDynamicTimeout');

describe('createDynamicTimeout', () => {
  it('should return base timeout for zero payload', () => {
    expect(createDynamicTimeout(15000, 0)).toBe(15000);
  });

  it('should add 10 seconds per MB', () => {
    const oneMB = 1024 * 1024;
    expect(createDynamicTimeout(15000, oneMB)).toBe(25000);
    expect(createDynamicTimeout(15000, oneMB * 2)).toBe(35000);
  });

  it('should cap additional time at 2 minutes', () => {
    const twentyMB = 20 * 1024 * 1024;
    expect(createDynamicTimeout(15000, twentyMB)).toBe(135000);
  });

  it('should handle fractional MB', () => {
    const halfMB = 512 * 1024;
    expect(createDynamicTimeout(15000, halfMB)).toBe(20000);
  });

  it('should handle very large payloads', () => {
    const hundredMB = 100 * 1024 * 1024;
    expect(createDynamicTimeout(30000, hundredMB)).toBe(150000);
  });

  it('should return base timeout for undefined payload', () => {
    expect(createDynamicTimeout(15000, undefined)).toBe(15000);
  });

  it('should return base timeout for NaN payload', () => {
    expect(createDynamicTimeout(15000, NaN)).toBe(15000);
  });

  it('should return base timeout for negative payload', () => {
    expect(createDynamicTimeout(15000, -1000)).toBe(15000);
  });

  it('should return base timeout for non-numeric payload', () => {
    expect(createDynamicTimeout(15000, 'large')).toBe(15000);
    expect(createDynamicTimeout(15000, null)).toBe(15000);
  });
});

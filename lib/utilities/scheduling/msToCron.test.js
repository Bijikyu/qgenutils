const msToCron = require('./msToCron');

describe('msToCron', () => {
  it('should convert seconds to cron', () => {
    expect(msToCron(5000)).toBe('*/5 * * * * *');
    expect(msToCron(30000)).toBe('*/30 * * * * *');
    expect(msToCron(1000)).toBe('*/1 * * * * *');
  });

  it('should convert minutes to cron', () => {
    expect(msToCron(60000)).toBe('0 */1 * * * *');
    expect(msToCron(5 * 60 * 1000)).toBe('0 */5 * * * *');
    expect(msToCron(30 * 60 * 1000)).toBe('0 */30 * * * *');
  });

  it('should convert hours to cron', () => {
    expect(msToCron(60 * 60 * 1000)).toBe('0 0 */1 * * *');
    expect(msToCron(6 * 60 * 60 * 1000)).toBe('0 0 */6 * * *');
    expect(msToCron(12 * 60 * 60 * 1000)).toBe('0 0 */12 * * *');
  });

  it('should convert days to cron', () => {
    expect(msToCron(24 * 60 * 60 * 1000)).toBe('0 0 0 */1 * *');
    expect(msToCron(7 * 24 * 60 * 60 * 1000)).toBe('0 0 0 */7 * *');
  });

  it('should throw for invalid input', () => {
    expect(() => msToCron(0)).toThrow('Milliseconds must be a positive number');
    expect(() => msToCron(-1000)).toThrow('Milliseconds must be a positive number');
    expect(() => msToCron('1000')).toThrow('Milliseconds must be a positive number');
    expect(() => msToCron(null)).toThrow('Milliseconds must be a positive number');
    expect(() => msToCron(Infinity)).toThrow('Milliseconds must be a positive number');
  });

  it('should handle sub-second intervals by rounding to 1 second', () => {
    expect(msToCron(500)).toBe('*/1 * * * * *');
  });
});

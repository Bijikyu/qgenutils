const { default: throttle } = require('./throttle');

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call immediately on first call', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throttle subsequent calls', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call after delay', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);
    throttled('a');
    expect(fn).toHaveBeenCalledWith('a');
    jest.advanceTimersByTime(50);
    throttled('b');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('b');
  });

  it('should pass arguments', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);
    throttled(1, 2, 3);
    expect(fn).toHaveBeenCalledWith(1, 2, 3);
  });

  it('should allow call after delay passes', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);
    throttled();
    jest.advanceTimersByTime(150);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
